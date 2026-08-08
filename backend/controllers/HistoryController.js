const History = require("../models/History");
const Cow = require("../models/Cow");

module.exports = class HistoryController {
  static create = async (req, res) => {
    try {
      const {
        cow,
        screeningDate,
        infection,
        parasiteLoad,
        epg,
        symptoms,
        treatmentGroup,
        medicine,
        outcome,
        notes,
      } = req.body;

      if (
        !cow ||
        !screeningDate ||
        !infection ||
        !parasiteLoad ||
        epg == null ||
        !treatmentGroup ||
        !medicine
      ) {
        throw new Error("Please fill all required fields.");
      }

      const cowExists = await Cow.findById(cow);

      if (!cowExists) {
        throw new Error("Cow not found.");
      }

      if (!Array.isArray(symptoms) || symptoms.length === 0) {
        throw new Error("Please select at least one symptom.");
      }

      const history = await History.create({
        cow,
        screeningDate,
        season: getSeason(screeningDate),
        infection,
        parasiteLoad,
        epg,
        symptoms: symptoms || [],
        treatmentGroup,
        medicine,
        outcome,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: "History added successfully.",
        data: history,
      });
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
  };

  static fetchByCow = async (req, res) => {
    try {
      const { cowId } = req.params;

      const history = await History.find({
        cow: cowId,
      })
        .sort({
          screeningDate: -1,
        })
        .populate("cow");

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
};

function getSeason(date) {
  const month = new Date(date).getMonth() + 1;

  if (month >= 3 && month <= 5) return "Summer";

  if (month >= 6 && month <= 9) return "Monsoon";

  if (month >= 10 && month <= 11) return "Autumn";

  if (month === 12 || month <= 2) return "Winter";

  return "Unknown";
}
