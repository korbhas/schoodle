const Joi = require('joi');

const wrapper = (body = Joi.object({}), params = Joi.object({}), query = Joi.object({})) =>
  Joi.object({ body, params, query });

const updateProfileSchema = wrapper(
  Joi.object({
    full_name: Joi.string().min(2).max(120),
    avatar_url: Joi.string().uri(),
    phone_number: Joi.string().max(20)
  }).min(1)
);

const createUserSchema = wrapper(
  Joi.object({
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().min(8).required(),
    full_name: Joi.string().min(2).max(255).required(),
    role: Joi.string().valid('student', 'teacher', 'employee', 'admin').required(),
    phone_number: Joi.string().optional().allow(null, ''),
    avatar_url: Joi.string().uri().optional().allow(null, ''),
    is_active: Joi.boolean().default(true)
  })
);

module.exports = {
  updateProfileSchema,
  createUserSchema
};

