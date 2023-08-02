const express = require('express')

const router = express.Router()
const ProbationSetupController = require('../controllers/ProbationSetupController.js')

// Place your user routes here
router.post('/', ProbationSetupController.createProbationSetup)
router.get('/', ProbationSetupController.find)
router.patch('/', ProbationSetupController.update)
router.get('/date', ProbationSetupController.getProbationDate) // fetch probation date

module.exports = router
