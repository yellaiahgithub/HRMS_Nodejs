const express = require("express");

const router = express.Router();
const LetterTemplateController = require("../controllers/letterTemplateController");

// Place your user routes here
router.post("/save", LetterTemplateController.createLetterTemplate);
router.put("/update", LetterTemplateController.updateLetterTemplate);
router.get("/fetch", LetterTemplateController.find);
router.delete("/delete/:uuid", LetterTemplateController.deleteLetterTemplate);

module.exports = router;
