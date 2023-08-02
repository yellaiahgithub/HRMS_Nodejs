const express = require("express");

const router = express.Router();
const AutoNumberingController = require("../controllers/autoNumberingController");

//all autoNumbering routes
router.post("/save", AutoNumberingController.saveAutoNumberings);
router.get("/fetchAll", AutoNumberingController.getAllAutoNumberings);

router.post("/byType", AutoNumberingController.getAutoNumberingByType);
router.put("/update", AutoNumberingController.updateAutoNumbering);
router.post("/getNextSequence", AutoNumberingController.getNextsequence);

module.exports = router;
