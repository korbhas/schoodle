const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const userService = require('../services/user.service');

const me = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    console.error('[users/me] Missing user or user.id:', { user: req.user });
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userId = Number(req.user.id);
  if (!userId || isNaN(userId)) {
    console.error('[users/me] Invalid user ID:', { 
      rawId: req.user.id, 
      userId, 
      user: req.user 
    });
    return res.status(400).json({ error: 'Invalid user ID', details: `User ID: ${req.user.id}` });
  }

  const profile = await userService.getUserProfile(userId);
  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }
  return success(res, profile);
});

const updateMe = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserProfile(req.user.id, req.body);
  return success(res, updated);
});

const createUser = asyncHandler(async (req, res) => {
  const { email, password, full_name: fullName, role, phone_number: phoneNumber, avatar_url: avatarUrl, is_active: isActive = true } = req.body;

  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const user = await userService.createUserByAdmin({
    email,
    password,
    full_name: fullName,
    role,
    phone_number: phoneNumber,
    avatar_url: avatarUrl,
    is_active: isActive
  });

  const profile = await userService.getUserProfile(user.id);
  return created(res, profile);
});

module.exports = {
  me,
  updateMe,
  createUser
};

