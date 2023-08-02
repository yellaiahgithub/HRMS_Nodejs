const express = require('express')

const router = express.Router()
const ProbationControlSetupController = require('../controllers/ProbationControlSetupController.js')

// Place your user routes here
router.post('/', ProbationControlSetupController.createProbationControlSetup)
router.get('/', ProbationControlSetupController.find)
router.patch('/', ProbationControlSetupController.update)

module.exports = router
