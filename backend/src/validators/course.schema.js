const Joi = require('joi');

const wrapper = (body = Joi.object({}), params = Joi.object({}), query = Joi.object({})) =>
  Joi.object({ body, params, query });

const pagination = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional().allow(''),
  pageSize: Joi.number().integer().min(1).max(100).default(25).optional().allow('')
});

const courseIdParams = Joi.object({
  courseId: Joi.number().integer().required()
});

const courseListSchema = wrapper(
  Joi.object({}).unknown(true), // Allow unknown fields in body (GET requests shouldn't have body anyway)
  Joi.object({}),
  pagination.keys({
    department: Joi.number().integer().optional().allow(null, ''),
    teacherId: Joi.number().integer().optional().allow(null, ''),
    search: Joi.string().optional().allow(null, '')
  })
);

const courseIdOnlySchema = wrapper(Joi.object({}), courseIdParams);

const courseCreateSchema = wrapper(
  Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    syllabus: Joi.string().allow(null, ''),
    credits: Joi.number().integer().default(3),
    teacher_id: Joi.number().integer().required(),
    department_id: Joi.number().integer().allow(null)
  })
);

const courseUpdateSchema = wrapper(
  Joi.object({
    code: Joi.string(),
    name: Joi.string(),
    syllabus: Joi.string().allow(null, ''),
    credits: Joi.number().integer(),
    teacher_id: Joi.number().integer(),
    department_id: Joi.number().integer().allow(null)
  }).min(1),
  Joi.object({
    courseId: Joi.number().integer().required()
  })
);

const materialCreateSchema = wrapper(
  Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    file_url: Joi.string().uri().required(),
    created_by: Joi.number().integer().required(),
    is_published: Joi.boolean()
  }),
  courseIdParams
);

const materialIdParams = wrapper(
  Joi.object({}),
  Joi.object({ materialId: Joi.number().integer().required() })
);

const enrollmentCreateSchema = wrapper(
  Joi.object({
    student_ids: Joi.array().items(Joi.number().integer()).min(1).required()
  }),
  courseIdParams
);

const enrollmentDeleteSchema = wrapper(
  Joi.object({}),
  Joi.object({
    courseId: Joi.number().integer().required(),
    studentId: Joi.number().integer().required()
  })
);

const sessionCreateSchema = wrapper(
  Joi.object({
    starts_at: Joi.date().required(),
    duration_min: Joi.number().integer().default(60),
    topic: Joi.string().allow(null, ''),
    room_name: Joi.string().allow(null, ''),
    recording_url: Joi.string().uri().allow(null, '')
  }),
  courseIdParams
);

const sessionIdSchema = wrapper(Joi.object({}), Joi.object({ sessionId: Joi.number().integer().required() }));

const sessionUpdateSchema = wrapper(
  Joi.object({
    starts_at: Joi.date(),
    duration_min: Joi.number().integer(),
    topic: Joi.string().allow(null, ''),
    room_name: Joi.string().allow(null, ''),
    recording_url: Joi.string().uri().allow(null, '')
  }).min(1),
  Joi.object({ sessionId: Joi.number().integer().required() })
);

const attendanceBulkSchema = wrapper(
  Joi.object({
    entries: Joi.array()
      .items(
        Joi.object({
          student_id: Joi.number().integer().required(),
          status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
          method: Joi.string().valid('manual', 'qr', 'nfc', 'ai').required(),
          confidence: Joi.number().min(0).max(1).allow(null),
          notes: Joi.string().allow(null, '')
        })
      )
      .min(1)
      .required()
  }),
  Joi.object({ sessionId: Joi.number().integer().required() })
);

const attendanceUpdateSchema = wrapper(
  Joi.object({
    status: Joi.string().valid('present', 'absent', 'late', 'excused'),
    method: Joi.string().valid('manual', 'qr', 'nfc', 'ai'),
    confidence: Joi.number().min(0).max(1).allow(null),
    notes: Joi.string().allow(null, '')
  }).min(1),
  Joi.object({ attendanceId: Joi.number().integer().required() })
);

const attendanceIdSchema = wrapper(Joi.object({}), Joi.object({ attendanceId: Joi.number().integer().required() }));

const assignmentCreateSchema = wrapper(
  Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    status: Joi.string().valid('draft', 'published', 'archived'),
    due_at: Joi.date().allow(null),
    max_score: Joi.number().default(100),
    attachment_url: Joi.string().uri().allow(null, '')
  }),
  courseIdParams
);

const assignmentIdSchema = wrapper(Joi.object({}), Joi.object({ assignmentId: Joi.number().integer().required() }));

const assignmentUpdateSchema = wrapper(
  Joi.object({
    title: Joi.string(),
    description: Joi.string().allow(null, ''),
    status: Joi.string().valid('draft', 'published', 'archived'),
    due_at: Joi.date().allow(null),
    max_score: Joi.number(),
    attachment_url: Joi.string().uri().allow(null, '')
  }).min(1),
  Joi.object({ assignmentId: Joi.number().integer().required() })
);

const submissionGradeSchema = wrapper(
  Joi.object({
    grade: Joi.number().allow(null),
    feedback: Joi.string().allow(null, ''),
    status: Joi.string().valid('graded', 'returned'),
    graded_by: Joi.number().integer().required()
  }),
  Joi.object({ submissionId: Joi.number().integer().required() })
);

const submissionListSchema = wrapper(
  Joi.object({}),
  Joi.object({ assignmentId: Joi.number().integer().required() })
);

const announcementCreateSchema = wrapper(
  Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    creator_id: Joi.number().integer().required(),
    expires_at: Joi.date().allow(null)
  }),
  courseIdParams
);

module.exports = {
  courseListSchema,
  courseCreateSchema,
  courseUpdateSchema,
  courseIdOnlySchema,
  materialCreateSchema,
  materialIdParams,
  enrollmentCreateSchema,
  enrollmentDeleteSchema,
  sessionCreateSchema,
  sessionUpdateSchema,
  sessionIdSchema,
  attendanceBulkSchema,
  attendanceUpdateSchema,
  attendanceIdSchema,
  assignmentCreateSchema,
  assignmentUpdateSchema,
  assignmentIdSchema,
  submissionGradeSchema,
  submissionListSchema,
  announcementCreateSchema
};

