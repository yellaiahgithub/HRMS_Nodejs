const express = require('express')
const router = express.Router()
const passwordRuleController = require('../controllers/passwordRuleController')

router.post('/', passwordRuleController.createPasswordRule)
router.get('/:companyUUID', passwordRuleController.getPasswordRule)
router.patch('/:companyUUID', passwordRuleController.updatePasswordRule)


module.exports = router
