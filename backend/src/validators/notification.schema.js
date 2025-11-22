const Joi = require('joi');

const notificationListSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    unread: Joi.boolean(),
    channel: Joi.string().valid('push', 'email', 'sms', 'in_app')
  })
};

const notificationIdSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

const notificationCreateSchema = {
  body: Joi.object({
    user_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
    channel: Joi.string().valid('push', 'email', 'sms', 'in_app').default('in_app'),
    title: Joi.string().max(255).required(),
    body: Joi.string().required(),
    payload: Joi.object().optional()
  })
};

const notificationUpdateSchema = {
  body: Joi.object({
    read: Joi.boolean().optional()
  })
};

module.exports = {
  notificationListSchema,
  notificationIdSchema,
  notificationCreateSchema,
  notificationUpdateSchema
};

