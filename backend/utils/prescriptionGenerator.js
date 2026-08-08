const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = function generatePrescription(reportData) {
  return new Promise((resolve, reject) => {
    try {
      // ======================================================
      // CREATE FILE
      // ======================================================

      const fileName = `Veterinary_Prescription_${Date.now()}.pdf`;

      const prescriptionsDir = path.join(
        process.cwd(),
        "uploads",
        "prescriptions",
      );

      if (!fs.existsSync(prescriptionsDir)) {
        fs.mkdirSync(prescriptionsDir, { recursive: true });
      }

      const filePath = path.join(prescriptionsDir, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
        info: {
          Title: "Veterinary Prescription",
          Author: "ROHA VetAssist",
        },
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ======================================================
      // DESIGN SYSTEM (kept identical to the clinical report
      // generator so both documents read as one family)
      // ======================================================

      const COLORS = {
        primary: "#173A5E",
        accent: "#C9A24B",
        headerTint: "#EEF3F8",
        panel: "#F7F9FB",
        border: "#D7DEE6",
        borderStrong: "#B9C3CE",
        text: "#1F2937",
        textMuted: "#5B6472",
        white: "#FFFFFF",
        zebra: "#FBFCFD",
      };

      const FONT = {
        regular: "Helvetica",
        bold: "Helvetica-Bold",
      };

      const PAGE = {
        left: 40,
        right: 555,
        width: 515,
        bottom: 782, // leaves room for the footer strip below this
      };

      const RX_ID = `RX-${Date.now()}`;
      const ISSUED_ON = new Date();

      // ======================================================
      // TEXT HELPERS
      // ======================================================

      const setFont = (
        weight = FONT.regular,
        size = 10,
        color = COLORS.text,
      ) => {
        doc.font(weight).fontSize(size).fillColor(color);
      };

      const mutedStyle = (size = 8.5) =>
        setFont(FONT.regular, size, COLORS.textMuted);

      const fmtDate = (d) => {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return "-";
        return dt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      // Draw text at an explicit x/y with manual alignment instead of the
      // `width`/`align` options. This sidesteps a pdfkit quirk: text placed
      // close to the page's bottom margin with `width` set can trip the
      // line-wrapper's own overflow check and silently inject a blank
      // trailing page. Safe to use anywhere, not just near the bottom.
      const textAligned = (
        str,
        x,
        y,
        { align = "left", boxWidth = 0 } = {},
      ) => {
        let drawX = x;
        if (align === "right") drawX = x + boxWidth - doc.widthOfString(str);
        if (align === "center")
          drawX = x + (boxWidth - doc.widthOfString(str)) / 2;
        doc.text(str, drawX, y, { lineBreak: false });
      };

      // ======================================================
      // PAGE FLOW
      // ======================================================

      const addSpace = (space = 10) => {
        doc.y += space;
      };

      const ensureSpace = (required = 60) => {
        if (doc.y + required > PAGE.bottom) {
          doc.addPage();
          drawContinuationHeader();
          return true;
        }
        return false;
      };

      // ======================================================
      // SECTION HEADING (compact bar, matches the report style)
      // ======================================================

      const section = (title, minBodyHeight = 30) => {
        ensureSpace(32 + minBodyHeight);
        addSpace(4);

        const y = doc.y;
        const barHeight = 19;

        doc
          .roundedRect(PAGE.left, y, PAGE.width, barHeight, 2)
          .fill(COLORS.primary);
        doc.rect(PAGE.left, y, 3, barHeight).fill(COLORS.accent);

        setFont(FONT.bold, 9.5, COLORS.white);
        doc.text(title.toUpperCase(), PAGE.left + 12, y + 5.5, {
          characterSpacing: 0.4,
        });

        doc.y = y + barHeight + 8;
      };

      // ======================================================
      // HEADER / LETTERHEAD
      // ======================================================

      const drawHeader = () => {
        const bandHeight = 74;

        doc.rect(0, 0, doc.page.width, bandHeight).fill(COLORS.primary);
        doc.rect(0, bandHeight, doc.page.width, 2.5).fill(COLORS.accent);

        setFont(FONT.bold, 19, COLORS.white);
        doc.text("ROHA VetAssist", PAGE.left, 18);

        doc.fillOpacity(0.75);
        setFont(FONT.regular, 8.5, COLORS.white);
        doc.text("Veterinary Diagnostics & Clinical Care", PAGE.left, 40);
        doc.fillOpacity(1);

        setFont(FONT.bold, 12, COLORS.white);
        textAligned("VETERINARY PRESCRIPTION", PAGE.left, 18, {
          align: "right",
          boxWidth: PAGE.width,
        });

        doc.fillOpacity(0.75);
        setFont(FONT.regular, 8.5, COLORS.white);
        textAligned(`ID: ${RX_ID}`, PAGE.left, 37, {
          align: "right",
          boxWidth: PAGE.width,
        });
        textAligned(`Date: ${fmtDate(ISSUED_ON)}`, PAGE.left, 49, {
          align: "right",
          boxWidth: PAGE.width,
        });
        doc.fillOpacity(1);

        doc.y = bandHeight + 2.5 + 16;
      };

      // Only used if an unusually long prescription overflows onto a
      // second page - keeps things tidy rather than crashing or clipping.
      const drawContinuationHeader = () => {
        setFont(FONT.bold, 10.5, COLORS.primary);
        doc.text(
          "ROHA VetAssist \u00B7 Veterinary Prescription (continued)",
          PAGE.left,
          26,
        );
        mutedStyle();
        textAligned(RX_ID, PAGE.left, 26, {
          align: "right",
          boxWidth: PAGE.width,
        });
        doc
          .moveTo(PAGE.left, 44)
          .lineTo(PAGE.right, 44)
          .lineWidth(0.75)
          .strokeColor(COLORS.border)
          .stroke();
        doc.y = 58;
      };

      // ======================================================
      // COMPACT TWO-COLUMN DETAIL GRID
      // ======================================================

      const drawDetailGrid = (rows) => {
        const colWidth = PAGE.width / 2;
        const rowHeight = 32;

        rows.forEach((pair) => {
          ensureSpace(rowHeight + 4);

          const y = doc.y;

          pair.forEach(([label, value], colIndex) => {
            if (label === undefined) return;

            const x = PAGE.left + colIndex * colWidth;

            // Label
            setFont(FONT.bold, 8.5, COLORS.textMuted);

            doc.text(label.toUpperCase(), x, y, {
              characterSpacing: 0.2,
            });

            // Value (closer to label)
            setFont(FONT.regular, 10.5, COLORS.text);

            doc.text(value || "-", x, y + 10, {
              width: colWidth - 14,
            });
          });

          // Larger gap before next field
          doc.y = y + rowHeight;
        });
      };

      // ======================================================
      // RX TABLE
      // ======================================================

      const drawRxTable = (items) => {
        const widths = [30, 165, 95, 70, 155];
        const headerHeight = 22;

        const drawTableHeader = () => {
          const headerHeight = 28;

          ensureSpace(headerHeight + 30);

          const y = doc.y;
          let x = PAGE.left;

          const headers = ["#", "Medicine", "Dosage", "Duration", "Notes"];

          headers.forEach((title, i) => {
            doc
              .rect(x, y, widths[i], headerHeight)
              .fillAndStroke(COLORS.primary, COLORS.primary);

            setFont(FONT.bold, 9.5, COLORS.white);

            doc.text(title, x + 8, y + 9, {
              width: widths[i] - 16,
              align: i === 0 ? "center" : "left",
              lineBreak: false,
            });

            x += widths[i];
          });

          // thin separator below header
          doc
            .moveTo(PAGE.left, y + headerHeight)
            .lineTo(PAGE.right, y + headerHeight)
            .lineWidth(1)
            .strokeColor(COLORS.borderStrong)
            .stroke();

          doc.y = y + headerHeight;
        };

        drawTableHeader();
        doc.y += 1;

        if (!items || items.length === 0) {
          const h = 28;
          const y = doc.y;
          doc
            .rect(PAGE.left, y, PAGE.width, h)
            .fillAndStroke(COLORS.white, COLORS.border);
          mutedStyle();
          doc.text("No medicines prescribed", PAGE.left, y + 9, {
            width: PAGE.width,
            align: "center",
          });
          doc.y = y + h;
          return;
        }

        items.forEach((item, index) => {
          const medicineLabel = item.group
            ? `${item.group}\n${item.medicine || "-"}`
            : item.medicine || "-";

          setFont(FONT.regular, 9);
          const cellTexts = [
            String(index + 1),
            medicineLabel,
            item.dosage || "-",
            item.duration || "-",
            item.reason || "-",
          ];

          // ------------------------------------------------------
          // Calculate dynamic row height
          // ------------------------------------------------------

          const cellHeights = cellTexts.map((text, i) => {
            const options = {
              width: widths[i] - 12,
              lineGap: 2,
            };

            if (i === 1 && item.group) {
              return (
                doc.heightOfString(item.group, {
                  width: widths[1] - 12,
                  lineGap: 1,
                }) +
                doc.heightOfString(item.medicine || "-", {
                  width: widths[1] - 12,
                  lineGap: 2,
                })
              );
            }

            return doc.heightOfString(text || "-", options);
          });

          // Notes column generally decides the tallest row
          const notesHeight = doc.heightOfString(item.reason || "-", {
            width: widths[4] - 12,
            lineGap: 2,
          });

          // Final row height
          const rowHeight = Math.max(
            40,
            notesHeight + 26,
            ...cellHeights.map((h) => h + 16),
          );

          if (doc.y + rowHeight > PAGE.bottom) {
            doc.addPage();
            drawContinuationHeader();
            drawTableHeader();
          }

          const y = doc.y;
          let x = PAGE.left;
          const bg = index % 2 === 0 ? COLORS.white : COLORS.zebra;

          widths.forEach((w, i) => {
            doc.rect(x, y, w, rowHeight).fillAndStroke(bg, COLORS.border);

            if (i === 1 && item.group) {
              setFont(FONT.regular, 7.5, COLORS.textMuted);
              doc.text(item.group.toUpperCase(), x + 6, y + 6, {
                width: w - 12,
                characterSpacing: 0.3,
                lineGap: 1,
              });

              setFont(FONT.bold, 9.5, COLORS.text);

              doc.text(item.medicine || "-", x + 6, y + 18, {
                width: w - 12,
                lineGap: 2,
              });
            } else {
              setFont(i === 1 ? FONT.bold : FONT.regular, 9.5, COLORS.text);
              doc.text(cellTexts[i], x + 6, y + 8, {
                width: w - 12,
                lineGap: 2,
                align: i === 1 || i === 4 ? "left" : "center",
              });
            }

            x += w;
          });

          doc.y = y + rowHeight;
        });
      };

      // ======================================================
      // FOOTER (drawn once, absolute position, last)
      // ======================================================

      const drawFooter = () => {
        const pages = doc.bufferedPageRange();

        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          const y = doc.page.height - 46;

          doc
            .moveTo(PAGE.left, y)
            .lineTo(PAGE.right, y)
            .lineWidth(0.75)
            .strokeColor(COLORS.border)
            .stroke();

          mutedStyle(7.5);
          textAligned(
            "Generated by ROHA VetAssist Support System",
            PAGE.left,
            y + 20,
            {
              align: "center",
              boxWidth: PAGE.width,
            },
          );

          if (pages.count > 1) {
            textAligned(`Page ${i + 1} of ${pages.count}`, PAGE.left, y + 8, {
              align: "right",
              boxWidth: PAGE.width,
            });
          }
        }
      };

      // ======================================================
      // BUILD DOCUMENT
      // ======================================================

      drawHeader();

      const cow = reportData.cow || {};

      // ------------------------------------------------------
      // Owner & animal details (compact 2-column grid)
      // ------------------------------------------------------
      section("Owner & Animal Details", 66);
      drawDetailGrid([
        [
          ["Owner", cow.ownerName],
          ["Mobile", cow.ownerPhone || "N/A"],
        ],
        [
          ["Cow Number", cow.cowNumber],
          ["Cow Name", cow.name],
        ],
        [
          ["Breed", cow.breed],
          [
            "Age",
            cow.age !== undefined && cow.age !== null
              ? `${cow.age} Years`
              : "-",
          ],
        ],
      ]);

      addSpace(5);

      // ------------------------------------------------------
      // Diagnosis (single compact row)
      // ------------------------------------------------------
      section("Diagnosis", 66);
      drawDetailGrid([
        [
          ["GI Parasite", reportData.currentInfection],
          ["Parasite Load", reportData.parasiteLoad],
        ],
      ]);
      // EPG on its own short line under the pair above
      {
        ensureSpace(25);
        const y = doc.y;
        setFont(FONT.bold, 8.5, COLORS.textMuted);
        doc.text("EPG (EGGS PER GRAM)", PAGE.left, y, {
          characterSpacing: 0.2,
        });
        setFont(FONT.regular, 10.5, COLORS.text);
        doc.text(
          reportData.epg === undefined ||
            reportData.epg === null ||
            reportData.epg === ""
            ? "-"
            : String(reportData.epg),
          PAGE.left,
          y + 11,
        );
        doc.y = y + 25;
      }

      addSpace(10);

      // ------------------------------------------------------
      // Rx
      // ------------------------------------------------------
      section("Prescribed Medication", 66);
      drawRxTable(reportData.doctorRecommendation || []);

      doc.y += 25;

      // Move signature block near the bottom of the page

      const footerTop = doc.page.height - 55;

      const signatureHeight = 90;

      const targetY = footerTop - signatureHeight - 10;

      if (doc.y < targetY) {
        doc.y = targetY;
      }

      ensureSpace(signatureHeight);

      {
        const y = doc.y;
        const leftWidth = 300;
        const sealX = PAGE.left + leftWidth + 15;
        const sealWidth = PAGE.width - leftWidth - 15;

        const sigField = (label, fy) => {
          setFont(FONT.regular, 8.5, COLORS.textMuted);
          doc.text(label, PAGE.left, fy);
          doc
            .moveTo(PAGE.left, fy + 20)
            .lineTo(PAGE.left + leftWidth, fy + 20)
            .lineWidth(0.75)
            .dash(2, { space: 2 })
            .strokeColor(COLORS.borderStrong)
            .stroke();
          doc.undash();
        };

        sigField("Registration No.", y);

        sigField("Veterinarian's Signature", y + 50);

        doc
          .roundedRect(sealX, y, sealWidth, 95, 4)
          .lineWidth(0.75)
          .dash(3, { space: 2 })
          .strokeColor(COLORS.borderStrong)
          .stroke();
        doc.undash();
        setFont(FONT.regular, 8.5, COLORS.textMuted);
        textAligned("Official Hospital / Clinic Seal", sealX, y + 42, {
          align: "center",
          boxWidth: sealWidth,
        });

        doc.y = y + 78;
      }

      // ======================================================
      // FOOTER (all pages) + FINISH
      // ======================================================
      drawFooter();

      doc.end();

      stream.on("finish", () => resolve(fileName));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};
