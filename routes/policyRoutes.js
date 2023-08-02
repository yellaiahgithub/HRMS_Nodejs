const express = require('express')

const router = express.Router()
const PolicyController = require('../controllers/PolicyController.js')

// Place your user routes here
router.post('/', PolicyController.createPolicy)
router.get('/', PolicyController.findAll)

module.exports = router
