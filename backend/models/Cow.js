const mongoose = require("../database/dbConnection");

module.exports = mongoose.model(
  "cow",
  mongoose.Schema(
    {
      cowNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      breed: {
        type: String,
        required: true,
      },

      age: {
        type: Number,
        required: true,
        min: 0,
      },

      gender: {
        type: String,
        enum: ["Male", "Female"],
        default: "Female",
      },

      ownerName: {
        type: String,
        required: true,
      },

      ownerPhone: {
        type: String,
      },

      village: {
        type: String,
        required: true,
      },

      district: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        default: "West Bengal",
      },
    },
    {
      timestamps: true,
    },
  ),
);
