const { query } = require('../db/pool');

const buildFilterClause = (filters) => {
  const clauses = [];
  const values = [];
  let idx = 1;

  filters.forEach(({ condition, value }) => {
    clauses.push(condition.replace(/\$\?/g, () => `$${idx++}`));
    values.push(value);
  });

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
};

const listTeachers = async ({ department, search, limit, offset }) => {
  const filters = [];
  if (department) {
    filters.push({ condition: 't.department = $? ', value: department });
  }
  if (search) {
    filters.push({ condition: 'u.full_name ILIKE $? ', value: `%${search}%` });
  }

  const { where, values } = buildFilterClause(filters);

  const result = await query(
    `SELECT t.user_id, u.full_name, u.email, u.phone_number, t.department, t.designation,
            t.office_location, t.bio, t.joined_at
     FROM staff_app.teachers t
     JOIN common_app.users u ON u.id = t.user_id
     ${where}
     ORDER BY u.full_name ASC
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return result.rows;
};

const getTeacherById = async (userId) => {
  const result = await query(
    `SELECT t.user_id, u.full_name, u.email, u.phone_number, t.department, t.designation,
            t.office_location, t.bio, t.joined_at
     FROM staff_app.teachers t
     JOIN common_app.users u ON u.id = t.user_id
     WHERE t.user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const createTeacher = async (payload) => {
  const { user_id: userId, department, designation, office_location: officeLocation, bio, joined_at: joinedAt } =
    payload;
  await query(
    `INSERT INTO staff_app.teachers (user_id, department, designation, office_location, bio, joined_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id) DO UPDATE
       SET department = EXCLUDED.department,
           designation = EXCLUDED.designation,
           office_location = EXCLUDED.office_location,
           bio = EXCLUDED.bio,
           joined_at = EXCLUDED.joined_at`,
    [userId, department, designation, officeLocation, bio, joinedAt]
  );
  return getTeacherById(userId);
};

const updateTeacher = async (userId, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx += 1;
  });

  if (!fields.length) {
    return getTeacherById(userId);
  }

  values.push(userId);
  await query(`UPDATE staff_app.teachers SET ${fields.join(', ')} WHERE user_id = $${idx}`, values);
  return getTeacherById(userId);
};

const deleteTeacher = async (userId) => {
  await query('DELETE FROM staff_app.teachers WHERE user_id = $1', [userId]);
};

const listEmployees = async ({ department, search, limit, offset }) => {
  const filters = [];
  if (department) {
    filters.push({ condition: 'e.department = $? ', value: department });
  }
  if (search) {
    filters.push({ condition: 'u.full_name ILIKE $? ', value: `%${search}%` });
  }

  const { where, values } = buildFilterClause(filters);

  const result = await query(
    `SELECT e.user_id, u.full_name, u.email, u.phone_number,
            e.role_title, e.department, e.reporting_to, e.joined_at
     FROM staff_app.employees e
     JOIN common_app.users u ON u.id = e.user_id
     ${where}
     ORDER BY u.full_name ASC
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return result.rows;
};

const getEmployeeById = async (userId) => {
  const result = await query(
    `SELECT e.user_id, u.full_name, u.email, u.phone_number,
            e.role_title, e.department, e.reporting_to, e.joined_at
     FROM staff_app.employees e
     JOIN common_app.users u ON u.id = e.user_id
     WHERE e.user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const createEmployee = async (payload) => {
  const { user_id: userId, role_title: roleTitle, department, reporting_to: reportingTo, joined_at: joinedAt } =
    payload;
  await query(
    `INSERT INTO staff_app.employees (user_id, role_title, department, reporting_to, joined_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE
       SET role_title = EXCLUDED.role_title,
           department = EXCLUDED.department,
           reporting_to = EXCLUDED.reporting_to,
           joined_at = EXCLUDED.joined_at`,
    [userId, roleTitle, department, reportingTo, joinedAt]
  );
  return getEmployeeById(userId);
};

const updateEmployee = async (userId, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx += 1;
  });

  if (!fields.length) {
    return getEmployeeById(userId);
  }

  values.push(userId);
  await query(`UPDATE staff_app.employees SET ${fields.join(', ')} WHERE user_id = $${idx}`, values);
  return getEmployeeById(userId);
};

const deleteEmployee = async (userId) => {
  await query('DELETE FROM staff_app.employees WHERE user_id = $1', [userId]);
};

const getEmployeeReports = async (userId) => {
  const result = await query(
    `SELECT user_id, role_title, department, joined_at
     FROM staff_app.employees
     WHERE reporting_to = $1`,
    [userId]
  );
  return result.rows;
};

const listDepartments = async () => {
  const result = await query(
    `SELECT d.id, d.name, d.office_phone,
            d.head_teacher,
            ht.full_name AS head_name
     FROM staff_app.departments d
     LEFT JOIN common_app.users ht ON ht.id = d.head_teacher
     ORDER BY d.name ASC`
  );
  return result.rows;
};

const createDepartment = async ({ name, head_teacher: headTeacher, office_phone: officePhone }) => {
  const result = await query(
    `INSERT INTO staff_app.departments (name, head_teacher, office_phone)
     VALUES ($1, $2, $3)
     ON CONFLICT (name) DO UPDATE
       SET head_teacher = EXCLUDED.head_teacher,
           office_phone = EXCLUDED.office_phone
     RETURNING *`,
    [name, headTeacher, officePhone]
  );
  return result.rows[0];
};

const updateDepartment = async (id, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx += 1;
  });

  if (!fields.length) {
    const current = await query('SELECT * FROM staff_app.departments WHERE id = $1', [id]);
    return current.rows[0] || null;
  }

  values.push(id);
  const result = await query(
    `UPDATE staff_app.departments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteDepartment = async (id) => {
  await query('DELETE FROM staff_app.departments WHERE id = $1', [id]);
};

const listPayroll = async ({ month, department, limit, offset }) => {
  const filters = [];

  if (month) {
    filters.push({ condition: "TO_CHAR(pr.pay_period, 'YYYY-MM') = $? ", value: month });
  }
  if (department) {
    filters.push({ condition: 'e.department = $? ', value: department });
  }

  const { where, values } = buildFilterClause(filters);

  const result = await query(
    `SELECT pr.id, pr.employee_id, pr.pay_period, pr.gross_salary, pr.deductions,
            pr.net_salary, pr.tax_info, pr.payslip_url, pr.generated_at,
            u.full_name, e.role_title, e.department
     FROM staff_app.payroll_records pr
     JOIN staff_app.employees e ON e.user_id = pr.employee_id
     JOIN common_app.users u ON u.id = pr.employee_id
     ${where}
     ORDER BY pr.pay_period DESC
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return result.rows;
};

const getPayrollById = async (id) => {
  const result = await query(
    `SELECT pr.*, u.full_name, e.role_title, e.department
     FROM staff_app.payroll_records pr
     JOIN staff_app.employees e ON e.user_id = pr.employee_id
     JOIN common_app.users u ON u.id = pr.employee_id
     WHERE pr.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const createPayroll = async (payload) => {
  const {
    employee_id: employeeId,
    pay_period: payPeriod,
    gross_salary: grossSalary,
    deductions,
    net_salary: netSalary,
    tax_info: taxInfo,
    payslip_url: payslipUrl
  } = payload;

  const result = await query(
    `INSERT INTO staff_app.payroll_records
      (employee_id, pay_period, gross_salary, deductions, net_salary, tax_info, payslip_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (employee_id, pay_period) DO UPDATE
       SET gross_salary = EXCLUDED.gross_salary,
           deductions = EXCLUDED.deductions,
           net_salary = EXCLUDED.net_salary,
           tax_info = EXCLUDED.tax_info,
           payslip_url = EXCLUDED.payslip_url
     RETURNING id`,
    [employeeId, payPeriod, grossSalary, deductions, netSalary, taxInfo, payslipUrl]
  );

  return getPayrollById(result.rows[0].id);
};

const updatePayroll = async (id, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx += 1;
  });

  if (!fields.length) {
    return getPayrollById(id);
  }

  values.push(id);
  await query(`UPDATE staff_app.payroll_records SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  return getPayrollById(id);
};

const listLeaves = async ({ status, employeeId, limit, offset }) => {
  const filters = [];

  if (status) {
    filters.push({ condition: 'lr.status = $? ', value: status });
  }
  if (employeeId) {
    filters.push({ condition: 'lr.employee_id = $? ', value: employeeId });
  }

  const { where, values } = buildFilterClause(filters);

  const result = await query(
    `SELECT lr.*, u.full_name, e.role_title
     FROM staff_app.leave_requests lr
     JOIN common_app.users u ON u.id = lr.employee_id
     LEFT JOIN staff_app.employees e ON e.user_id = lr.employee_id
     ${where}
     ORDER BY lr.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return result.rows;
};

const getLeaveById = async (id) => {
  const result = await query(
    `SELECT lr.*, u.full_name, e.role_title
     FROM staff_app.leave_requests lr
     JOIN common_app.users u ON u.id = lr.employee_id
     LEFT JOIN staff_app.employees e ON e.user_id = lr.employee_id
     WHERE lr.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const createLeave = async (payload) => {
  const { employee_id: employeeId, type, start_date: startDate, end_date: endDate, reason } = payload;

  const result = await query(
    `INSERT INTO staff_app.leave_requests (employee_id, type, start_date, end_date, reason)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [employeeId, type, startDate, endDate, reason]
  );
  return getLeaveById(result.rows[0].id);
};

const updateLeave = async (id, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx += 1;
  });

  if (!fields.length) {
    return getLeaveById(id);
  }

  values.push(id);
  await query(`UPDATE staff_app.leave_requests SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  return getLeaveById(id);
};

const setLeaveStatus = async (id, status, approverId) => {
  await query(
    `UPDATE staff_app.leave_requests
     SET status = $1, approver_id = $2, decided_at = NOW()
     WHERE id = $3`,
    [status, approverId, id]
  );
  return getLeaveById(id);
};

const listFeedback = async ({ studentId, courseId, teacherId, limit, offset }) => {
  const filters = [];
  if (studentId) {
    filters.push({ condition: 'sf.student_id = $? ', value: studentId });
  }
  if (courseId) {
    filters.push({ condition: 'sf.course_id = $? ', value: courseId });
  }
  if (teacherId) {
    filters.push({ condition: 'sf.teacher_id = $? ', value: teacherId });
  }

  const { where, values } = buildFilterClause(filters);

  const result = await query(
    `SELECT sf.id, sf.teacher_id, sf.student_id, sf.course_id, sf.content, sf.created_at,
            t.full_name AS teacher_name,
            s.full_name AS student_name,
            c.name AS course_name
     FROM staff_app.student_feedback sf
     JOIN common_app.users t ON t.id = sf.teacher_id
     JOIN common_app.users s ON s.id = sf.student_id
     LEFT JOIN common_app.courses c ON c.id = sf.course_id
     ${where}
     ORDER BY sf.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return result.rows;
};

const createFeedback = async ({ teacher_id: teacherId, student_id: studentId, course_id: courseId, content }) => {
  const result = await query(
    `INSERT INTO staff_app.student_feedback (teacher_id, student_id, course_id, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [teacherId, studentId, courseId, content]
  );
  return result.rows[0];
};

const deleteFeedback = async (id) => {
  await query('DELETE FROM staff_app.student_feedback WHERE id = $1', [id]);
};

module.exports = {
  listTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeReports,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  listLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  setLeaveStatus,
  listFeedback,
  createFeedback,
  deleteFeedback
};

