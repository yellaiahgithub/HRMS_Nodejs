const express = require("express");

const router = express.Router();
const uploadDocumentController = require("../controllers/uploadDocumentController");
var multer = require("multer");
const upload = multer({ dest: "controllers/mnt/repo/HRMS" });

// Place your user routes here
router.post(
  "/saveAll",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "documentType", maxCount: 1 },
    { name: "forValidationOnly", maxCount: 1 },
  ]),
  uploadDocumentController.uploadDocument
);

module.exports = router;
