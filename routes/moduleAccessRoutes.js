const express = require('express')

const router = express.Router()
const ModuleAccessController = require('../controllers/moduleAccessController.js')

// Place your user routes here
router.post('/', ModuleAccessController.createModuleAccess)
router.patch('/', ModuleAccessController.updateModuleAccess)
router.get('/', ModuleAccessController.findAll)
router.get('/by', ModuleAccessController.findModuleAccessByCompanyId)
router.get('/names', ModuleAccessController.getModuleNames)

module.exports = router
