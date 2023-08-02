const express = require("express");

const router = express.Router();
const DownloadResultsController = require("../controllers/downloadResultsController");

// Place your user routes here
router.get("/fetchAll", DownloadResultsController.findAll);
router.delete("/delete", DownloadResultsController.delete);

module.exports = router;
