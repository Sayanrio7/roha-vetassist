const mongoose = require("../database/dbConnection");

module.exports = mongoose.model(
  "report",
  mongoose.Schema(
    {
      cow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cow",
        required: true,
      },

      screeningDate: {
        type: Date,
        default: Date.now,
      },

      currentInfection: {
        type: String,
        required: true,
      },

      parasiteLoad: {
        type: String,
        enum: ["Low", "Moderate", "High"],
        required: true,
      },

      epg: {
        type: Number,
        required: true,
        min: 0,
      },

      symptoms: [
        {
          type: String,
        },
      ],

      aiRecommendation: {
        type: Object,
        required: true,
      },

      doctorRecommendation: [
        {
          group: {
            type: String,
            required: true,
          },

          medicine: {
            type: String,
            required: true,
          },

          dosage: {
            type: String,
            required: true,
          },

          duration: {
            type: String,
            required: true,
          },

          reason: {
            type: String,
          },
        },
      ],

      doctorRemarks: {
        type: String,
        default: "",
      },

      pdfPath: {
        type: String,
      },

      prescriptionPath: {
        type: String,
      },
    },
    {
      timestamps: true,
    },
  ),
);
