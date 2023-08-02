const express = require('express')

const router = express.Router()
const RoleController = require('../controllers/RoleController.js')

// Place your user routes here
router.post('/', RoleController.createRole)
router.patch('/:roleId', RoleController.updateRole)
router.get('/', RoleController.findAll)
router.get('/assignedUser', RoleController.findAssignedUsersByRoleUUID)
router.get('/unAssignedUser', RoleController.findUnAssignedUsersByRoleUUID)

//Fetch Roles by employeeUUID
router.get('/assignedRoles', RoleController.fetchRolesByEmployeeUUID)

module.exports = router
