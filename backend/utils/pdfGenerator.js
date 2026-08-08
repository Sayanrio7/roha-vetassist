const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = function generatePDF(reportData) {
  return new Promise((resolve, reject) => {
    try {
      // ======================================================
      // CREATE FILE
      // ======================================================

      const fileName = `Clinical_Report_${Date.now()}.pdf`;

      const reportsDir = path.join(process.cwd(), "uploads", "reports");

      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const filePath = path.join(reportsDir, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
        info: {
          Title: "GI Parasite Clinical Report",
          Author: "ROHA VetAssist",
        },
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ======================================================
      // DESIGN SYSTEM
      // ======================================================

      const COLORS = {
        primary: "#173A5E", // deep slate navy
        primaryDark: "#0F2A44",
        accent: "#C9A24B", // muted gold, used sparingly
        headerTint: "#EEF3F8", // pale navy tint for table headers/cells
        panel: "#F7F9FB", // very light panel background
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
        oblique: "Helvetica-Oblique",
      };

      const PAGE = {
        left: 50,
        right: 545,
        width: 495,
        top: 50,
        bottom: 760, // last usable y before footer zone
      };

      const REPORT_ID = `ROHA-${Date.now()}`;
      const GENERATED_ON = new Date();

      // ======================================================
      // LOW-LEVEL TEXT HELPERS
      // ======================================================

      const setFont = (
        weight = FONT.regular,
        size = 10,
        color = COLORS.text,
      ) => {
        doc.font(weight).fontSize(size).fillColor(color);
      };

      const labelStyle = () => setFont(FONT.bold, 9.5, COLORS.primary);
      const valueStyle = () => setFont(FONT.regular, 9.5, COLORS.text);
      const mutedStyle = () => setFont(FONT.regular, 8.5, COLORS.textMuted);

      const fmtDate = (d) => {
        if (!d) return "-";
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return "-";
        return dt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      const fmtDateTime = (d) => {
        const dt = new Date(d);
        return `${dt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} \u00B7 ${dt.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      };

      // ======================================================
      // PAGE FLOW HELPERS
      // ======================================================

      const addSpace = (space = 12) => {
        doc.y += space;
      };

      // Ensures `required` vertical space remains before the footer zone.
      // Returns true if a new page was started.
      const ensureSpace = (required = 80) => {
        if (doc.y + required > PAGE.bottom) {
          doc.addPage();
          drawHeader(false);
          return true;
        }
        return false;
      };

      // ======================================================
      // SECTION HEADING
      // ======================================================

      let sectionIndex = 0;

      // `minBodyHeight` reserves room for (at least the start of) the
      // section's content along with the header bar itself, so a section
      // title never gets stranded alone at the bottom of a page with its
      // body pushed to the next one.
      const section = (title, minBodyHeight = 46) => {
        ensureSpace(38 + minBodyHeight);
        sectionIndex += 1;
        addSpace(6);

        const y = doc.y;
        const barHeight = 22;

        doc
          .roundedRect(PAGE.left, y, PAGE.width, barHeight, 2)
          .fill(COLORS.primary);

        // thin gold tick on the left edge of the bar
        doc.rect(PAGE.left, y, 3, barHeight).fill(COLORS.accent);

        setFont(FONT.bold, 10.5, COLORS.white);
        doc.text(title.toUpperCase(), PAGE.left + 14, y + 6.5, {
          characterSpacing: 0.4,
        });

        doc.y = y + barHeight + 10;
      };

      // ======================================================
      // TWO-COLUMN KEY/VALUE TABLE (info / patient / exam blocks)
      // ======================================================

      const LABEL_W = 165;
      const VALUE_W = PAGE.width - LABEL_W;

      const drawKeyValueRows = (
        rows,
        { zebra = true, minRowHeight = 26 } = {},
      ) => {
        rows.forEach(([label, value], index) => {
          valueStyle();
          const valueText =
            value === undefined || value === null || value === ""
              ? "-"
              : String(value);

          const textHeight = doc.heightOfString(valueText, {
            width: VALUE_W - 24,
          });
          const rowHeight = Math.max(minRowHeight, textHeight + 14);

          ensureSpace(rowHeight + 4);
          const y = doc.y;

          const rowBg = zebra && index % 2 === 1 ? COLORS.zebra : COLORS.white;

          doc
            .rect(PAGE.left, y, LABEL_W, rowHeight)
            .fillAndStroke(COLORS.headerTint, COLORS.border);

          doc
            .rect(PAGE.left + LABEL_W, y, VALUE_W, rowHeight)
            .fillAndStroke(rowBg, COLORS.border);

          const textY = y + rowHeight / 2 - 5;

          labelStyle();
          doc.text(label, PAGE.left + 12, textY, { width: LABEL_W - 20 });

          valueStyle();
          doc.text(valueText, PAGE.left + LABEL_W + 12, textY, {
            width: VALUE_W - 24,
          });

          doc.y = y + rowHeight;
        });
      };

      // ======================================================
      // GENERIC DATA TABLE (history / treatment plan)
      // ======================================================

      const drawTable = (
        columns,
        widths,
        rows,
        { align = [], cellPadding = 10 } = {},
      ) => {
        const headerHeight = 30;

        const drawTableHeader = () => {
          ensureSpace(headerHeight + 34); // header + at least one row's worth of room
          const y = doc.y;
          let x = PAGE.left;

          columns.forEach((col, i) => {
            doc
              .rect(x, y, widths[i], headerHeight)
              .fillAndStroke(COLORS.primary, COLORS.primary);
            setFont(FONT.bold, 10, COLORS.white);
            doc.text(col, x + 6, y + 10, {
              width: widths[i] - 12,
              align: "center",
              characterSpacing: 0.2,
            });
            x += widths[i];
          });

          doc.y = y + headerHeight;
        };

        drawTableHeader();

        if (!rows || rows.length === 0) {
          const emptyHeight = 36;
          const y = doc.y;
          doc
            .rect(PAGE.left, y, PAGE.width, emptyHeight)
            .fillAndStroke(COLORS.white, COLORS.border);
          mutedStyle();
          doc.text("No records available", PAGE.left, y + 13, {
            width: PAGE.width,
            align: "center",
          });
          doc.y = y + emptyHeight;
          return;
        }

        rows.forEach((row, rowIndex) => {
          // Compute the row height first so we can decide about pagination accurately.
          setFont(FONT.regular, 10);
          let maxLines = 1;
          const cellHeights = row.map((val, i) => {
            const w = widths[i] - cellPadding * 2;
            return doc.heightOfString(String(val ?? "-"), { width: w });
          });
          const rowHeight = Math.max(
            34,
            Math.max(...cellHeights) + cellPadding * 2,
          );

          if (doc.y + rowHeight > PAGE.bottom) {
            doc.addPage();
            drawHeader(false);
            drawTableHeader();
          }

          const y = doc.y;
          let x = PAGE.left;
          const bg = rowIndex % 2 === 0 ? COLORS.white : COLORS.zebra;

          row.forEach((val, i) => {
            doc
              .rect(x, y, widths[i], rowHeight)
              .fillAndStroke(bg, COLORS.border);

            setFont(FONT.regular, 10, COLORS.text);
            const cellAlign = align[i] || "center";
            doc.text(String(val ?? "-"), x + cellPadding, y + cellPadding - 1, {
              width: widths[i] - cellPadding * 2,
              align: cellAlign,
            });

            x += widths[i];
          });

          doc.y = y + rowHeight;
        });
      };

      // ======================================================
      // HEADER (letterhead)
      // ======================================================

      const drawHeader = (firstPage = true) => {
        if (firstPage) {
          const bandHeight = 100;

          doc.rect(0, 0, doc.page.width, bandHeight).fill(COLORS.primary);
          doc.rect(0, bandHeight, doc.page.width, 3).fill(COLORS.accent);

          // Clinic name + tagline (left)
          setFont(FONT.bold, 21, COLORS.white);
          doc.text("ROHA VetAssist", PAGE.left, 26);

          doc.fillOpacity(0.75);
          setFont(FONT.regular, 9.5, COLORS.white);
          doc.text("Veterinary Diagnostics & Clinical Care", PAGE.left, 50);
          doc.fillOpacity(1);

          // Document title pill (right, top)
          setFont(FONT.bold, 12.5, COLORS.white);
          doc.text("GI PARASITE CLINICAL REPORT", PAGE.left, 26, {
            width: PAGE.width,
            align: "right",
          });

          doc.fillOpacity(0.75);
          setFont(FONT.regular, 9, COLORS.white);
          doc.text(`Report ID: ${REPORT_ID}`, PAGE.left, 48, {
            width: PAGE.width,
            align: "right",
          });
          doc.text(`Generated: ${fmtDateTime(GENERATED_ON)}`, PAGE.left, 61, {
            width: PAGE.width,
            align: "right",
          });
          doc.fillOpacity(1);

          doc.y = bandHeight + 3 + 22;
        } else {
          setFont(FONT.bold, 11.5, COLORS.primary);
          doc.text(
            "ROHA VetAssist \u00B7 GI Parasite Clinical Report",
            PAGE.left,
            32,
          );

          mutedStyle();
          doc.text(REPORT_ID, PAGE.left, 32, {
            width: PAGE.width,
            align: "right",
          });

          doc
            .moveTo(PAGE.left, 50)
            .lineTo(PAGE.right, 50)
            .lineWidth(0.75)
            .strokeColor(COLORS.border)
            .stroke();

          doc.y = 64;
        }
      };

      // ======================================================
      // FOOTER
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

          mutedStyle();

          // NOTE: text sitting this close to the physical bottom of the page
          // must never go through pdfkit's line-wrapper (i.e. never pass a
          // `width` option here), because the wrapper's own page-overflow
          // check would misfire this close to the edge and silently inject
          // extra blank pages. Plain, unwrapped text + manual alignment
          // math sidesteps that entirely.
          const leftText =
            "ROHA VetAssist  \u2022  Confidential Veterinary Clinical Report";
          doc.text(leftText, PAGE.left, y + 9, { lineBreak: false });

          const centerText = fmtDate(GENERATED_ON);
          const centerWidth = doc.widthOfString(centerText);
          doc.text(
            centerText,
            PAGE.left + (PAGE.width - centerWidth) / 2,
            y + 9,
            {
              lineBreak: false,
            },
          );

          const rightText = `Page ${i + 1} of ${pages.count}`;
          const rightWidth = doc.widthOfString(rightText);
          doc.text(rightText, PAGE.right - rightWidth, y + 9, {
            lineBreak: false,
          });
        }
      };

      // ======================================================
      // START REPORT
      // ======================================================

      drawHeader(true);

      // ------------------------------------------------------
      // Report information
      // ------------------------------------------------------
      section("Report Information");
      drawKeyValueRows(
        [
          ["Report ID", REPORT_ID],
          ["Generated On", fmtDateTime(GENERATED_ON)],
          ["Screening Date", fmtDate(reportData.screeningDate || GENERATED_ON)],
          ["Attending Veterinarian", "To be signed below"],
        ],
        { zebra: false },
      );

      addSpace(16);

      // ------------------------------------------------------
      // Patient information
      // ------------------------------------------------------
      section("Patient Information");
      const cow = reportData.cow || {};
      drawKeyValueRows([
        ["Cow Number", cow.cowNumber],
        ["Cow Name", cow.name],
        ["Breed", cow.breed],
        [
          "Age",
          cow.age !== undefined && cow.age !== null ? `${cow.age} Years` : "-",
        ],
        ["Gender", cow.gender],
        ["Owner", cow.ownerName],
        ["Owner Contact", cow.ownerPhone],
        ["Village", cow.village],
        ["District", cow.district],
        ["State", cow.state],
      ]);

      addSpace(16);

      // ------------------------------------------------------
      // Current clinical examination
      // ------------------------------------------------------
      section("Current Clinical Examination");
      drawKeyValueRows([
        ["Current GI Parasite", reportData.currentInfection],
        ["Parasite Load", reportData.parasiteLoad],
        ["EPG (Eggs Per Gram)", reportData.epg],
        [
          "Clinical Symptoms",
          reportData.symptoms && reportData.symptoms.length
            ? reportData.symptoms.join(", ")
            : "No clinical symptoms reported",
        ],
      ]);

      addSpace(18);

      // ------------------------------------------------------
      // Clinical assessment
      // ------------------------------------------------------
      const remarks =
        (reportData.doctorRemarks && reportData.doctorRemarks.trim()) ||
        "No clinical assessment has been provided by the attending veterinarian.";

      setFont(FONT.regular, 10);
      const remarksHeight = doc.heightOfString(remarks, {
        width: PAGE.width - 34,
        align: "justify",
        lineGap: 4,
      });
      const assessmentMinHeight = Math.max(90, remarksHeight + 46);

      // Reserve space for the header AND at least the text's own height,
      // so they always move to the next page as one unit if they don't fit.
      section("Clinical Assessment", assessmentMinHeight);
      const assessY = doc.y;

      // Stretch the box down to fill the rest of the page — it never
      // shrinks below what the text itself needs, but if there's blank
      // room left on the page, the box grows to cover it.
      const assessmentHeight = Math.max(
        assessmentMinHeight,
        PAGE.bottom - assessY,
      );

      doc
        .roundedRect(PAGE.left, assessY, PAGE.width, assessmentHeight, 4)
        .fillAndStroke(COLORS.panel, COLORS.border);
      doc.rect(PAGE.left, assessY, 3, assessmentHeight).fill(COLORS.primary);

      setFont(FONT.bold, 10, COLORS.primary);
      doc.text(
        "Veterinarian's Clinical Assessment",
        PAGE.left + 16,
        assessY + 14,
        {
          characterSpacing: 0.2,
        },
      );

      setFont(FONT.regular, 10, COLORS.text);
      doc.text(remarks, PAGE.left + 16, assessY + 34, {
        width: PAGE.width - 34,
        align: "justify",
        lineGap: 4,
      });

      doc.y = assessY + assessmentHeight + 18;

      // ------------------------------------------------------
      // Previous medical history + Approved treatment plan +
      // Veterinarian approval — kept together as one block on their
      // own page. Forcing a fresh page here means these three
      // sections always start together at the top of the same page
      // instead of possibly being split apart by an automatic
      // mid-section page break.
      // ------------------------------------------------------
      doc.addPage();
      drawHeader(false);

      section("Previous Medical History", 60);
      drawTable(
        ["Date", "Parasite", "Load", "EPG", "Medicine", "Outcome"],
        [80, 95, 65, 50, 100, 100],
        (reportData.history || []).map((h) => [
          fmtDate(h.screeningDate),
          h.infection ?? "-",
          h.parasiteLoad ?? "-",
          h.epg ?? "-",
          h.medicine ?? "-",
          h.outcome ?? "-",
        ]),
        { align: ["center", "center", "center", "center", "center", "center"] },
      );

      addSpace(18);

      // ------------------------------------------------------
      // Approved treatment plan
      // ------------------------------------------------------
      section("Approved Treatment Plan", 60);
      drawTable(
        ["Medicine", "Dosage", "Duration", "Clinical Reason"],
        [120, 95, 80, 200],
        (reportData.doctorRecommendation || []).map((item) => [
          item.medicine || "-",
          item.dosage || "-",
          item.duration || "-",
          item.reason || "-",
        ]),
        { align: ["center", "center", "center", "left"] },
      );

      addSpace(18);

      // ------------------------------------------------------
      // Veterinarian approval — pinned to the bottom of the page,
      // directly beneath History / Treatment Plan. If there's room
      // left on the page, the block is pushed down so its bottom
      // edge lands right at the page's usable bottom edge; if the
      // tables above already run long, it just continues in the
      // normal flow (paginating via `section`'s own space check,
      // same as before).
      // ------------------------------------------------------
      const approvalHeight = 118;
      const approvalBlockHeight = 38 + approvalHeight; // section header + box
      const approvalPinnedY = PAGE.bottom - approvalBlockHeight;
      if (doc.y < approvalPinnedY) {
        doc.y = approvalPinnedY;
      }

      section("Veterinarian Approval", approvalHeight);
      const approvalY = doc.y;

      doc
        .roundedRect(PAGE.left, approvalY, PAGE.width, approvalHeight, 4)
        .fillAndStroke(COLORS.panel, COLORS.border);

      const sigLine = (label, x, y, width) => {
        setFont(FONT.regular, 8.5, COLORS.textMuted);
        doc.text(label, x, y);
        doc
          .moveTo(x, y + 26)
          .lineTo(x + width, y + 26)
          .lineWidth(0.75)
          .dash(2, { space: 2 })
          .strokeColor(COLORS.borderStrong)
          .stroke();
        doc.undash();
      };

      setFont(FONT.bold, 10.5, COLORS.primary);
      doc.text("Attending Veterinarian", PAGE.left + 20, approvalY + 16, {
        characterSpacing: 0.2,
      });

      sigLine("Full Name", PAGE.left + 20, approvalY + 42, 190);
      sigLine("Registration No.", PAGE.left + 20, approvalY + 80, 190);

      setFont(FONT.bold, 10.5, COLORS.primary);
      doc.text("Signature & Date", PAGE.left + 235, approvalY + 16, {
        characterSpacing: 0.2,
      });
      sigLine("Signature", PAGE.left + 235, approvalY + 42, 100);

      setFont(FONT.regular, 8.5, COLORS.textMuted);
      doc.text("Date", PAGE.left + 345, approvalY + 42);
      setFont(FONT.regular, 9.5, COLORS.text);
      doc.text(fmtDate(GENERATED_ON), PAGE.left + 345, approvalY + 54);

      // Official seal box
      const sealX = PAGE.left + 235;
      doc
        .roundedRect(sealX, approvalY + 76, 195, 32, 3)
        .lineWidth(0.75)
        .dash(3, { space: 2 })
        .strokeColor(COLORS.borderStrong)
        .stroke();
      doc.undash();
      setFont(FONT.regular, 8.5, COLORS.textMuted);
      doc.text("Official Clinic Seal", sealX, approvalY + 88, {
        width: 195,
        align: "center",
      });

      doc.y = approvalY + approvalHeight + 6;

      // ======================================================
      // FOOTER (all pages)
      // ======================================================
      drawFooter();

      // ======================================================
      // FINISH
      // ======================================================
      doc.end();

      stream.on("finish", () => resolve(fileName));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};