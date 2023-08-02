const express = require('express')

const router = express.Router()
const PermissionController = require('../controllers/PermissionController.js')

// Place your user routes here
router.post('/', PermissionController.createPermission)
router.patch('/:permissionId', PermissionController.updatePermission)
router.get('/', PermissionController.findAll)
router.get('/by', PermissionController.findPermissionByIdOrName)

module.exports = router
