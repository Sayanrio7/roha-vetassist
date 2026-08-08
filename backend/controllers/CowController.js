const Cow = require("../models/Cow");

module.exports = class CowController {
  static create = async (req, res) => {
    try {
      const {
        cowNumber,
        name,
        breed,
        age,
        gender,
        ownerName,
        ownerPhone,
        village,
        district,
        state,
      } = req.body;

      if (
        !cowNumber ||
        !name ||
        !breed ||
        !age ||
        !ownerName ||
        !village ||
        !district
      ) {
        throw new Error("Please fill all required fields.");
      }

      const existingCow = await Cow.findOne({ cowNumber });

      if (existingCow) {
        throw new Error("Cow Number already exists.");
      }

      const cow = await Cow.create({
        cowNumber,
        name,
        breed,
        age,
        gender,
        ownerName,
        ownerPhone,
        village,
        district,
        state,
      });

      return res.status(201).json({
        success: true,
        message: "Cow added successfully.",
        data: cow,
      });
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
  };

  static fetchAll = async (req, res) => {
    try {
      const cows = await Cow.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: cows,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

  static fetchById = async (req, res) => {
    try {
      const { id } = req.params;

      const cow = await Cow.findById(id);

      if (!cow) {
        throw new Error("Cow not found.");
      }

      return res.status(200).json({
        success: true,
        data: cow,
      });
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
  };
};
