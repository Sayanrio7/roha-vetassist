const mongoose = require("../database/dbConnection");

module.exports = mongoose.model(
  "history",
  mongoose.Schema(
    {
      cow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cow",
        required: true,
      },

      screeningDate: {
        type: Date,
        required: true,
      },

      season: {
        type: String,
        enum: ["Summer", "Monsoon", "Autumn", "Winter", "Spring"],
        required: true,
      },

      symptoms: [String],

      infection: {
        type: String,
        enum: [
          "Strongylosis",
          "Coccidiosis",
          "Fasciolosis",
          "Monieziasis",
          "Trichuriasis",
          "Paramphistomiasis",
          "Ascariasis",
        ],
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

      treatmentGroup: {
        type: String,
        required: true,
      },

      medicine: {
        type: String,
        required: true,
      },

      outcome: {
        type: String,
        enum: ["Recovered", "Improved", "Not Recovered"],
        default: "Recovered",
      },

      notes: {
        type: String,
      },
    },
    {
      timestamps: true,
    },
  ),
);
