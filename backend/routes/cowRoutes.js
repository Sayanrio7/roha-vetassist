const router = require("express").Router();
const CowController = require("../controllers/CowController");

router.post("/create", CowController.create);
router.get("/", CowController.fetchAll);
router.get("/:id", CowController.fetchById);

module.exports = router;
