const express = require("express");

const router = express.Router();
const UploadResultsController = require("../controllers/uploadResultsController");

// Place your user routes here
router.get("/fetchAll", UploadResultsController.findAll);

module.exports = router;
