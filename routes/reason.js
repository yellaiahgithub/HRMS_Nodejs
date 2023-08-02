const express = require('express')
const router = express.Router()
const ReasonController = require('../controllers/reasonController')

// Place your user routes here
router.post('/', ReasonController.createReason)
router.patch('/:reasonCode', ReasonController.updateReason)
router.get('/', ReasonController.findAll)
router.get('/by', ReasonController.findReasonById)
router.get('/fetchAll', ReasonController.findAllActionReasons)
router.get('/fetchReasonByAction/:actionCode', ReasonController.findReasonByAction)

module.exports = router
