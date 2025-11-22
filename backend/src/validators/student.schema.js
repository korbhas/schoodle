const Joi = require('joi');

const wrapper = (body = Joi.object({}), params = Joi.object({}), query = Joi.object({})) =>
  Joi.object({ body, params, query });

const pagination = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25)
});

const studentIdParams = Joi.object({
  id: Joi.number().integer().required()
});

const listStudentsSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  pagination.keys({
    year: Joi.number().integer(),
    program: Joi.string(),
    advisorId: Joi.number().integer()
  })
);

const createStudentSchema = wrapper(
  Joi.object({
    user_id: Joi.number().integer().required(),
    enrollment_no: Joi.string().required(),
    academic_year: Joi.number().integer().required(),
    program: Joi.string().required(),
    advisor_id: Joi.number().integer().allow(null),
    digital_card: Joi.object().unknown(true).allow(null),
    library_id: Joi.string().allow(null, '')
  })
);

const updateStudentSchema = wrapper(
  Joi.object({
    enrollment_no: Joi.string(),
    academic_year: Joi.number().integer(),
    program: Joi.string(),
    advisor_id: Joi.number().integer().allow(null),
    digital_card: Joi.object().unknown(true).allow(null),
    library_id: Joi.string().allow(null, '')
  }).min(1),
  studentIdParams
);

const gradesBulkSchema = wrapper(
  Joi.object({
    records: Joi.array()
      .items(
        Joi.object({
          course_id: Joi.number().integer().required(),
          grade: Joi.string().required(),
          gpa_points: Joi.number().required()
        })
      )
      .min(1)
      .required()
  }),
  studentIdParams
);

const gradeUpdateSchema = wrapper(
  Joi.object({
    grade: Joi.string().required(),
    gpa_points: Joi.number().required()
  }),
  Joi.object({
    id: Joi.number().integer().required(),
    courseId: Joi.number().integer().required()
  })
);

const attendanceSchema = wrapper(Joi.object({}), studentIdParams);

const alertsListSchema = wrapper(Joi.object({}), studentIdParams);

const alertCreateSchema = wrapper(
  Joi.object({
    course_id: Joi.number().integer().required(),
    reason: Joi.string().required(),
    delivery: Joi.string().valid('push', 'email', 'sms', 'in_app').default('in_app')
  }),
  studentIdParams
);

const assignmentsListSchema = wrapper(Joi.object({}), studentIdParams, pagination);

const submissionCreateSchema = wrapper(
  Joi.object({
    assignment_id: Joi.number().integer().required(),
    file_url: Joi.string().uri().required()
  }),
  studentIdParams
);

const submissionDetailSchema = wrapper(
  Joi.object({}),
  Joi.object({
    id: Joi.number().integer().required(),
    submissionId: Joi.number().integer().required()
  })
);

const clubsListSchema = wrapper(Joi.object({}), studentIdParams);
const clubActionSchema = wrapper(
  Joi.object({}),
  Joi.object({
    id: Joi.number().integer().required(),
    clubId: Joi.number().integer().required()
  })
);

const eventsListSchema = wrapper(Joi.object({}), studentIdParams);
const forumActivitySchema = wrapper(Joi.object({}), studentIdParams);

const digitalCardUpdateSchema = wrapper(
  Joi.object({
    digital_card: Joi.object().unknown(true).required()
  }),
  studentIdParams
);

// Chat schemas
const createChatSessionSchema = wrapper(
  Joi.object({
    course_id: Joi.number().integer().allow(null).optional()
  }),
  studentIdParams
);

const sendMessageSchema = wrapper(
  Joi.object({
    message: Joi.string().trim().min(1).max(5000).required()
  }),
  Joi.object({
    id: Joi.number().integer().required(),
    sessionId: Joi.number().integer().required()
  })
);

const chatSessionIdSchema = wrapper(
  Joi.object({}),
  Joi.object({
    id: Joi.number().integer().required(),
    sessionId: Joi.number().integer().required()
  })
);

const listChatSessionsSchema = wrapper(
  Joi.object({}),
  studentIdParams,
  pagination.keys({
    course_id: Joi.number().integer(),
    status: Joi.string().valid('active', 'completed', 'summarized')
  })
);

const endSessionSchema = wrapper(
  Joi.object({}),
  Joi.object({
    id: Joi.number().integer().required(),
    sessionId: Joi.number().integer().required()
  })
);

module.exports = {
  listStudentsSchema,
  createStudentSchema,
  updateStudentSchema,
  gradesBulkSchema,
  gradeUpdateSchema,
  attendanceSchema,
  alertsListSchema,
  alertCreateSchema,
  assignmentsListSchema,
  submissionCreateSchema,
  submissionDetailSchema,
  clubsListSchema,
  clubActionSchema,
  eventsListSchema,
  forumActivitySchema,
  digitalCardUpdateSchema,
  createChatSessionSchema,
  sendMessageSchema,
  chatSessionIdSchema,
  listChatSessionsSchema,
  endSessionSchema
};

