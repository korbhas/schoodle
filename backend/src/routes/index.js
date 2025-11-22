const { Router } = require('express');
const health = require('./health.routes');
const auth = require('./auth.routes');
const users = require('./users.routes');
const staff = require('./staff.routes');
const students = require('./students.routes');
const courses = require('./courses.routes');
const community = require('./community.routes');
const market = require('./market.routes');
const notifications = require('./notifications.routes');

const router = Router();

router.use('/health', health);
router.use('/auth', auth);
router.use('/users', users);
router.use('/staff', staff);
router.use('/students', students);
router.use('/courses', courses);
router.use('/community', community);
router.use('/market', market);
router.use('/notifications', notifications);

module.exports = router;

