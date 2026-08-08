const router = require("express").Router();
const ReportController = require("../controllers/ReportController");

router.post("/generate", ReportController.generate);
router.get("/", ReportController.fetchAll);

module.exports = router;
