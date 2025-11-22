const Joi = require('joi');

const wrapper = (body = Joi.object({}), params = Joi.object({}), query = Joi.object({})) =>
  Joi.object({ body, params, query });

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25)
});

const teachersListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  paginationQuery.keys({
    department: Joi.string(),
    search: Joi.string().min(2)
  })
);

const teacherIdSchema = wrapper(Joi.object({}), Joi.object({ id: Joi.number().integer().required() }));

const teacherCreateSchema = wrapper(
  Joi.object({
    user_id: Joi.number().integer().required(),
    department: Joi.string().allow(null, ''),
    designation: Joi.string().allow(null, ''),
    office_location: Joi.string().allow(null, ''),
    bio: Joi.string().allow(null, ''),
    joined_at: Joi.date().allow(null)
  })
);

const teacherUpdateSchema = wrapper(
  Joi.object({
    department: Joi.string().allow(null, ''),
    designation: Joi.string().allow(null, ''),
    office_location: Joi.string().allow(null, ''),
    bio: Joi.string().allow(null, ''),
    joined_at: Joi.date().allow(null)
  }).min(1),
  Joi.object({ id: Joi.number().integer().required() })
);

const employeesListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  paginationQuery.keys({
    department: Joi.string(),
    search: Joi.string().min(2)
  })
);

const employeeIdSchema = wrapper(Joi.object({}), Joi.object({ id: Joi.number().integer().required() }));
const employeeReportsSchema = employeeIdSchema;

const employeeCreateSchema = wrapper(
  Joi.object({
    user_id: Joi.number().integer().required(),
    role_title: Joi.string().required(),
    department: Joi.string().allow(null, ''),
    reporting_to: Joi.number().integer().allow(null),
    joined_at: Joi.date().allow(null)
  })
);

const employeeUpdateSchema = wrapper(
  Joi.object({
    role_title: Joi.string(),
    department: Joi.string().allow(null, ''),
    reporting_to: Joi.number().integer().allow(null),
    joined_at: Joi.date().allow(null)
  }).min(1),
  Joi.object({ id: Joi.number().integer().required() })
);

const departmentCreateSchema = wrapper(
  Joi.object({
    name: Joi.string().required(),
    head_teacher: Joi.number().integer().allow(null),
    office_phone: Joi.string().allow(null, '')
  })
);

const departmentUpdateSchema = wrapper(
  Joi.object({
    name: Joi.string(),
    head_teacher: Joi.number().integer().allow(null),
    office_phone: Joi.string().allow(null, '')
  }).min(1),
  Joi.object({ id: Joi.number().integer().required() })
);

const departmentIdSchema = wrapper(Joi.object({}), Joi.object({ id: Joi.number().integer().required() }));

const payrollListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  paginationQuery.keys({
    month: Joi.string().pattern(/^\d{4}-\d{2}$/),
    department: Joi.string()
  })
);

const payrollCreateSchema = wrapper(
  Joi.object({
    employee_id: Joi.number().integer().required(),
    pay_period: Joi.date().required(),
    gross_salary: Joi.number().required(),
    deductions: Joi.number().default(0),
    net_salary: Joi.number().required(),
    tax_info: Joi.object().unknown(true).allow(null),
    payslip_url: Joi.string().uri().allow(null, '')
  })
);

const payrollUpdateSchema = wrapper(
  Joi.object({
    gross_salary: Joi.number(),
    deductions: Joi.number(),
    net_salary: Joi.number(),
    tax_info: Joi.object().unknown(true).allow(null),
    payslip_url: Joi.string().uri().allow(null, '')
  }).min(1),
  Joi.object({ id: Joi.number().integer().required() })
);

const payrollIdSchema = wrapper(Joi.object({}), Joi.object({ id: Joi.number().integer().required() }));

const leaveListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  paginationQuery.keys({
    status: Joi.string(),
    employeeId: Joi.number().integer()
  })
);

const leaveCreateSchema = wrapper(
  Joi.object({
    type: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    reason: Joi.string().allow(null, ''),
    employee_id: Joi.number().integer()
  })
);

const leaveUpdateSchema = wrapper(
  Joi.object({
    type: Joi.string(),
    start_date: Joi.date(),
    end_date: Joi.date(),
    reason: Joi.string().allow(null, ''),
    status: Joi.string()
  }).min(1),
  Joi.object({ id: Joi.number().integer().required() })
);

const leaveIdSchema = wrapper(Joi.object({}), Joi.object({ id: Joi.number().integer().required() }));
const leaveActionSchema = leaveIdSchema;

const feedbackListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  paginationQuery.keys({
    studentId: Joi.number().integer(),
    courseId: Joi.number().integer(),
    teacherId: Joi.number().integer()
  })
);

const feedbackCreateSchema = wrapper(
  Joi.object({
    teacher_id: Joi.number().integer(),
    student_id: Joi.number().integer().required(),
    course_id: Joi.number().integer().allow(null),
    content: Joi.string().min(3).required()
  })
);

const feedbackIdSchema = wrapper(Joi.object({}), Joi.object({ id: Joi.number().integer().required() }));

module.exports = {
  teachersListSchema,
  teacherIdSchema,
  teacherCreateSchema,
  teacherUpdateSchema,
  employeesListSchema,
  employeeIdSchema,
  employeeReportsSchema,
  employeeCreateSchema,
  employeeUpdateSchema,
  departmentCreateSchema,
  departmentUpdateSchema,
  departmentIdSchema,
  payrollListSchema,
  payrollCreateSchema,
  payrollUpdateSchema,
  payrollIdSchema,
  leaveListSchema,
  leaveCreateSchema,
  leaveUpdateSchema,
  leaveIdSchema,
  leaveActionSchema,
  feedbackListSchema,
  feedbackCreateSchema,
  feedbackIdSchema
};

