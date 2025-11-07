const express = require('express');
const passwordController = require('../controllers/passwordController');
const authMiddleware = require('../middleware/auth');
const { validate, passwordSchema } = require('../middleware/validation');

const router = express.Router();

// All password routes are protected
router.use(authMiddleware);

router.get('/', passwordController.getAllPasswords);
router.get('/:id', passwordController.getPasswordById);
router.post('/', validate(passwordSchema), passwordController.createPassword);
router.put('/:id', validate(passwordSchema), passwordController.updatePassword);
router.delete('/:id', passwordController.deletePassword);

module.exports = router;
