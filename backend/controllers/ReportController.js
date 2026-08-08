const Report = require("../models/Report");
const Cow = require("../models/Cow");
const History = require("../models/History");

const generatePDF = require("../utils/pdfGenerator");
const generatePrescription = require("../utils/prescriptionGenerator");

module.exports = class ReportController {
  static generate = async (req, res) => {
    try {
      const {
        cowId,
        currentInfection,
        parasiteLoad,
        epg,
        symptoms,
        aiRecommendation,
        doctorRecommendation,
        doctorRemarks,
      } = req.body;

      // =============================
      // Validation
      // =============================

      if (!cowId || !currentInfection || !parasiteLoad || epg == null) {
        throw new Error(
          "Cow, Current Infection, Parasite Load and EPG are required.",
        );
      }

      if (
        !Array.isArray(doctorRecommendation) ||
        doctorRecommendation.length === 0
      ) {
        throw new Error("Doctor recommendation is required.");
      }

      // =============================
      // Fetch Cow
      // =============================

      const cow = await Cow.findById(cowId);

      if (!cow) {
        throw new Error("Cow not found.");
      }

      // =============================
      // Fetch Previous History
      // =============================

      const history = await History.find({
        cow: cowId,
      }).sort({
        screeningDate: -1,
      });

      // =============================
      // Generate Clinical Report PDF
      // =============================

      const reportPdf = await generatePDF({
        cow,
        history,
        currentInfection,
        parasiteLoad,
        epg,
        symptoms,
        doctorRecommendation,
        doctorRemarks,
      });

      // =============================
      // Generate Prescription PDF
      // =============================

      const prescriptionPdf = await generatePrescription({
        cow,
        currentInfection,
        parasiteLoad,
        epg,
        symptoms,
        doctorRecommendation,
        doctorRemarks,
      });

      // =============================
      // Save Report
      // =============================

      const report = await Report.create({
        cow: cow._id,
        screeningDate: new Date(),
        currentInfection,
        parasiteLoad,
        epg,
        symptoms,
        aiRecommendation,
        doctorRecommendation,
        doctorRemarks,
        pdfPath: reportPdf,
        prescriptionPath: prescriptionPdf,
      });

      // =============================
      // Response
      // =============================

      return res.status(201).json({
        success: true,
        message: "Clinical Report and Prescription generated successfully.",
        report,
        files: {
          clinicalReport: reportPdf,
          prescription: prescriptionPdf,
        },
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };

  static fetchAll = async (req, res) => {
    try {
      const reports = await Report.find().populate("cow").sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
};
