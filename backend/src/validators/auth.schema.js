const Joi = require('joi');

const baseWrapper = (body = Joi.object({}), params = Joi.object({}), query = Joi.object({})) =>
  Joi.object({ body, params, query });

const loginSchema = baseWrapper(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
);

const tokenSchema = baseWrapper(
  Joi.object({
    refreshToken: Joi.string().min(10).required()
  })
);

const changePasswordSchema = baseWrapper(
  Joi.object({
    currentPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(8).required()
  })
);

const resetRequestSchema = baseWrapper(
  Joi.object({
    email: Joi.string().email().required()
  })
);

const resetConfirmSchema = baseWrapper(
  Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  })
);

const registerSchema = baseWrapper(
  Joi.object({
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().min(8).required(),
    full_name: Joi.string().min(2).max(255).required(),
    phone: Joi.string().optional().allow(null, '')
  })
);

module.exports = {
  loginSchema,
  tokenSchema,
  changePasswordSchema,
  resetRequestSchema,
  resetConfirmSchema,
  registerSchema
};

