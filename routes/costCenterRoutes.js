const express = require('express')

const router = express.Router()
const CostCenterController = require('../controllers/costCenterController')

// Place your user routes here
router.post('/save', CostCenterController.createCostCenter)
router.put('/update', CostCenterController.updateCostCenter)
router.post('/fetchAll', CostCenterController.findAll)
router.get('/byId/:id', CostCenterController.findCostCenterById)
router.get('/byName/:name', CostCenterController.findCostCenterByName)

module.exports = router
