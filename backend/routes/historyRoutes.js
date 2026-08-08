const router = require("express").Router();
const HistoryController = require("../controllers/HistoryController");

router.post("/create", HistoryController.create);
router.get("/:cowId", HistoryController.fetchByCow);

module.exports = router;