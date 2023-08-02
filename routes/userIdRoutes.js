const express = require('express')

const router = express.Router()
const UserIdSetupController = require('../controllers/useridController')

// Place your user routes here
router.post('/', UserIdSetupController.createUserId)
router.patch('/update', UserIdSetupController.updateUserId)
router.get('/', UserIdSetupController.findAll)
router.get('/byId/:uuid', UserIdSetupController.findUserIdById)
router.delete('/:employeeUUID', UserIdSetupController.deleteUserId)
module.exports = router
