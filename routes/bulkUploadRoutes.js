const express = require('express')

const router = express.Router()
const bulkUploadController = require('../controllers/bulkUploadController')

// Place your user routes here
router.post('/', bulkUploadController.findBulkUploadDisplay)

module.exports = router
