const express = require('express')
const router = express.Router()
const storeController = require('../controllers/StorageController')
var multer = require('multer');
const upload = multer({dest:'controllers/mnt/repo/HRMS'});

// Place your user routes here
router.post('/uploadFile', upload.single('file'), storeController.uploadFileS3)
router.get('/',  storeController.getFile)
router.delete('/',  storeController.deleteFileS3)



module.exports = router
