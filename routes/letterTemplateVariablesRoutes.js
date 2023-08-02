const express = require("express");

const router = express.Router();
const LetterTemplateVariablesController = require("../controllers/letterTemplateVariablesController");

// Place your user routes here
router.post("/save", LetterTemplateVariablesController.createLetterTemplateVariables);
router.put("/update", LetterTemplateVariablesController.updateLetterTemplateVariables);
router.get("/fetch", LetterTemplateVariablesController.find);
router.delete("/delete/:uuid", LetterTemplateVariablesController.deleteLetterTemplateVariables);

module.exports = router;
