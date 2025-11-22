const { Router } = require('express');

const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  loginSchema,
  tokenSchema,
  changePasswordSchema,
  resetRequestSchema,
  resetConfirmSchema,
  registerSchema
} = require('../validators/auth.schema');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(tokenSchema), authController.refresh);
router.post('/logout', validate(tokenSchema), authController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/password-reset/request', validate(resetRequestSchema), authController.requestPasswordReset);
router.post('/password-reset/confirm', validate(resetConfirmSchema), authController.confirmPasswordReset);

module.exports = router;

