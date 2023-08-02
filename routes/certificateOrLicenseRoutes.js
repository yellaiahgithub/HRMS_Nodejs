const express = require('express')
const router = express.Router()
const CertificateOrlicenseController = require('../controllers/certificateOrLicenseController')

// Place your routes here
router.post('/', CertificateOrlicenseController.createCertificateOrlicense)
router.patch('/', CertificateOrlicenseController.updateCertificateOrlicense)
router.get('/byEmployeeUUID', CertificateOrlicenseController.findCertificateOrlicenseById)
router.delete('/', CertificateOrlicenseController.deleteCertificateOrlicenseDetail)

router.get("/CSVHeader", CertificateOrlicenseController.generateCSVHeader);
router.post("/saveAll", CertificateOrlicenseController.createAllLicense);

module.exports = router
