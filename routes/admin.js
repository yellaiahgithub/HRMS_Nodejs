const express = require('express')

const router = express.Router()
const AdminController = require('../controllers/adminController')

// Place your user routes here
router.post('/', AdminController.createUser)
router.get('/', AdminController.findAll)
router.get('/byUserId/:uuid', AdminController.findUserById)
router.post('/updateSession', AdminController.updateSession)

module.exports = router
