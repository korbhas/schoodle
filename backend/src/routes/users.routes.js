const { Router } = require('express');

const userController = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema, createUserSchema } = require('../validators/user.schema');

const router = Router();

router.use(authenticate);
router.get('/me', userController.me);
router.patch('/me', validate(updateProfileSchema), userController.updateMe);
router.post('/', authorize('admin'), validate(createUserSchema), userController.createUser);

module.exports = router;

