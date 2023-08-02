const express = require('express')

const router = express.Router()
const AnnouncementController = require('../controllers/AnnouncementController.js')

// Place your user routes here
router.post('/', AnnouncementController.createAnnouncement)
router.get('/', AnnouncementController.findAll)

module.exports = router
