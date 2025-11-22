const Joi = require('joi');

const wrapper = (body = Joi.object({}), params = Joi.object({}), query = Joi.object({})) =>
  Joi.object({ body, params, query });

const pagination = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25)
});

// Messaging
const messageListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  pagination.keys({
    box: Joi.string().valid('inbox', 'outbox').default('inbox'),
    unread: Joi.boolean()
  })
);

const messageIdSchema = wrapper(Joi.object({}), Joi.object({ messageId: Joi.number().integer().required() }));

const messageSendSchema = wrapper(
  Joi.object({
    recipient_id: Joi.number().integer().required(),
    subject: Joi.string().allow('', null),
    body: Joi.string().required()
  })
);

// Announcements
const announcementCreateSchema = wrapper(
  Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    creator_id: Joi.number().integer().required(),
    target_role: Joi.string().valid('student', 'teacher', 'employee', 'admin').allow(null),
    expires_at: Joi.date().allow(null)
  })
);

const announcementUpdateSchema = wrapper(
  Joi.object({
    title: Joi.string(),
    body: Joi.string(),
    target_role: Joi.string().valid('student', 'teacher', 'employee', 'admin').allow(null),
    expires_at: Joi.date().allow(null)
  }).min(1),
  Joi.object({ announcementId: Joi.number().integer().required() })
);

const announcementIdSchema = wrapper(Joi.object({}), Joi.object({ announcementId: Joi.number().integer().required() }));

// Clubs
const clubIdSchema = wrapper(Joi.object({}), Joi.object({ clubId: Joi.number().integer().required() }));

const clubCreateSchema = wrapper(
  Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    admin_student: Joi.number().integer().allow(null),
    faculty_advisor: Joi.number().integer().allow(null)
  })
);

const clubUpdateSchema = wrapper(
  Joi.object({
    name: Joi.string(),
    description: Joi.string().allow('', null),
    admin_student: Joi.number().integer().allow(null),
    faculty_advisor: Joi.number().integer().allow(null)
  }).min(1),
  Joi.object({ clubId: Joi.number().integer().required() })
);

const clubMemberSchema = wrapper(
  Joi.object({
    student_id: Joi.number().integer().required(),
    role: Joi.string().default('member')
  }),
  Joi.object({ clubId: Joi.number().integer().required() })
);

const clubMemberIdSchema = wrapper(
  Joi.object({}),
  Joi.object({
    clubId: Joi.number().integer().required(),
    studentId: Joi.number().integer().required()
  })
);

// Events
const eventListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  pagination.keys({
    category: Joi.string(),
    upcoming: Joi.boolean()
  })
);

const eventIdSchema = wrapper(Joi.object({}), Joi.object({ eventId: Joi.number().integer().required() }));

const eventCreateSchema = wrapper(
  Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('', null),
    category: Joi.string().required(),
    start_at: Joi.date().required(),
    end_at: Joi.date().allow(null),
    location: Joi.string().allow('', null),
    organizer_id: Joi.number().integer().required()
  })
);

const eventUpdateSchema = wrapper(
  Joi.object({
    title: Joi.string(),
    description: Joi.string().allow('', null),
    category: Joi.string(),
    start_at: Joi.date(),
    end_at: Joi.date().allow(null),
    location: Joi.string().allow('', null)
  }).min(1),
  Joi.object({ eventId: Joi.number().integer().required() })
);

const participantSchema = wrapper(
  Joi.object({
    user_id: Joi.number().integer().required(),
    status: Joi.string().valid('registered', 'waitlisted', 'cancelled').default('registered')
  }),
  Joi.object({ eventId: Joi.number().integer().required() })
);

const participantIdSchema = wrapper(
  Joi.object({}),
  Joi.object({ eventId: Joi.number().integer().required(), userId: Joi.number().integer().required() })
);

// Forum
const threadListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  pagination.keys({
    locked: Joi.boolean()
  })
);

const threadIdSchema = wrapper(Joi.object({}), Joi.object({ threadId: Joi.number().integer().required() }));

const threadLockSchema = wrapper(
  Joi.object({
    is_locked: Joi.boolean().required()
  }),
  Joi.object({ threadId: Joi.number().integer().required() })
);

const postListSchema = wrapper(Joi.object({}), Joi.object({}), pagination);

const postIdSchema = wrapper(Joi.object({}), Joi.object({ postId: Joi.number().integer().required() }));

module.exports = {
  messageListSchema,
  messageIdSchema,
  messageSendSchema,
  announcementCreateSchema,
  announcementUpdateSchema,
  announcementIdSchema,
  clubCreateSchema,
  clubUpdateSchema,
  clubIdSchema,
  clubMemberSchema,
  clubMemberIdSchema,
  eventListSchema,
  eventCreateSchema,
  eventUpdateSchema,
  eventIdSchema,
  participantSchema,
  participantIdSchema,
  threadListSchema,
  threadLockSchema,
  threadIdSchema,
  postListSchema,
  postIdSchema
};

