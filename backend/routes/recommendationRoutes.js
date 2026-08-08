const router = require("express").Router();
const RecommendationController = require("../controllers/RecommendationController");

router.post("/generate", RecommendationController.generate);
router.post("/generate-remarks", RecommendationController.generateRemarks);

module.exports = router;