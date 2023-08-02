const express = require('express')

const router = express.Router()
const leavePolicyController = require('../controllers/leavePolicyController.js')

// Place your user routes here
router.post('/', leavePolicyController.createLeavePolicy)
router.patch('/:uuid', leavePolicyController.updateLeavePolicy)
router.get('/', leavePolicyController.findAll)
router.get('/filterBy', leavePolicyController.findBy)

module.exports = router
