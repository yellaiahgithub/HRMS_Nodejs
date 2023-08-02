const express = require('express')

const router = express.Router()
const ActionController = require('../controllers/actionController')

// Place your user routes here
router.post('/', ActionController.createAction)
router.patch('/:actionCode', ActionController.updateAction)
router.get('/find', ActionController.find)
router.get('/byActionCode', ActionController.findActionByActionCode)
router.get('/byActionCodeLite', ActionController.findActionByActionCodeLite)

module.exports = router
