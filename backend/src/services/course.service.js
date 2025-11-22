const { query } = require('../db/pool');

const buildFilters = (filters) => {
  const clauses = [];
  const values = [];
  let idx = 1;

  filters.forEach(({ condition, values: entryValues = [] }) => {
    if (!condition) return;
    const placeholders = entryValues.map(() => `$${idx++}`);
    let normalizedCondition = condition;
    placeholders.forEach((placeholder) => {
      normalizedCondition = normalizedCondition.replace('??', placeholder);
    });
    clauses.push(normalizedCondition);
    values.push(...entryValues);
  });

  return {
    where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values
  };
};

const listCourses = async ({ department, teacherId, search, limit, offset }) => {
  const filters = [];
  if (department) {
    filters.push({ condition: 'c.department_id = ??', values: [department] });
  }
  if (teacherId) {
    filters.push({ condition: 'c.teacher_id = ??', values: [teacherId] });
  }
  if (search) {
    filters.push({
      condition: '(c.name ILIKE ?? OR c.code ILIKE ??)',
      values: [`%${search}%`, `%${search}%`]
    });
  }

  const { where, values } = buildFilters(filters);

  const result = await query(
    `SELECT c.id, c.code, c.name, c.syllabus, c.credits, c.teacher_id,
            c.created_at, c.updated_at, u.full_name AS teacher_name
     FROM common_app.courses c
     LEFT JOIN staff_app.teachers t ON t.user_id = c.teacher_id
     LEFT JOIN common_app.users u ON u.id = t.user_id
     ${where}
     ORDER BY c.code ASC
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );
  return result.rows;
};

const getCourseById = async (courseId) => {
  const result = await query(
    `SELECT c.*, u.full_name AS teacher_name
     FROM common_app.courses c
     LEFT JOIN staff_app.teachers t ON t.user_id = c.teacher_id
     LEFT JOIN common_app.users u ON u.id = t.user_id
     WHERE c.id = $1`,
    [courseId]
  );
  return result.rows[0] || null;
};

const createCourse = async (payload) => {
  const { code, name, syllabus, credits, teacher_id: teacherId, department_id: departmentId } = payload;
  const result = await query(
    `INSERT INTO common_app.courses (code, name, syllabus, credits, teacher_id, department_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [code, name, syllabus, credits, teacherId, departmentId]
  );
  return getCourseById(result.rows[0].id);
};

const updateCourse = async (courseId, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });
  if (!fields.length) {
    return getCourseById(courseId);
  }
  values.push(courseId);
  await query(`UPDATE common_app.courses SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, values);
  return getCourseById(courseId);
};

const deleteCourse = async (courseId) => {
  await query('DELETE FROM common_app.courses WHERE id = $1', [courseId]);
};

const listMaterials = async (courseId) => {
  const result = await query(
    `SELECT id, title, description, file_url, is_published, created_by, created_at
     FROM common_app.course_materials
     WHERE course_id = $1
     ORDER BY created_at DESC`,
    [courseId]
  );
  return result.rows;
};

const addMaterial = async (courseId, payload) => {
  const { title, description, file_url: fileUrl, created_by: createdBy, is_published: isPublished } = payload;
  const result = await query(
    `INSERT INTO common_app.course_materials (course_id, title, description, file_url, created_by, is_published)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [courseId, title, description, fileUrl, createdBy, isPublished ?? true]
  );
  return result.rows[0];
};

const removeMaterial = async (materialId) => {
  await query('DELETE FROM common_app.course_materials WHERE id = $1', [materialId]);
};

const listEnrollments = async (courseId) => {
  const result = await query(
    `SELECT ce.student_id, u.full_name, u.email, s.enrollment_no, ce.enrolled_at
     FROM common_app.course_enrollments ce
     JOIN student_app.students s ON s.user_id = ce.student_id
     JOIN common_app.users u ON u.id = ce.student_id
     WHERE ce.course_id = $1
     ORDER BY u.full_name ASC`,
    [courseId]
  );
  return result.rows;
};

const enrollStudents = async (courseId, studentIds = []) => {
  await query(
    `INSERT INTO common_app.course_enrollments (course_id, student_id)
     SELECT $1, UNNEST($2::bigint[])
     ON CONFLICT (course_id, student_id) DO NOTHING`,
    [courseId, studentIds]
  );
  return listEnrollments(courseId);
};

const removeEnrollment = async (courseId, studentId) => {
  await query('DELETE FROM common_app.course_enrollments WHERE course_id = $1 AND student_id = $2', [
    courseId,
    studentId
  ]);
  return listEnrollments(courseId);
};

const listSessions = async (courseId) => {
  const result = await query(
    `SELECT id, course_id, starts_at, duration_min, topic, room_name, recording_url, created_at
     FROM common_app.class_sessions
     WHERE course_id = $1
     ORDER BY starts_at DESC`,
    [courseId]
  );
  return result.rows;
};

const createSession = async (courseId, payload) => {
  const { starts_at: startsAt, duration_min: duration, topic, room_name: roomName, recording_url: recording } =
    payload;
  const result = await query(
    `INSERT INTO common_app.class_sessions (course_id, starts_at, duration_min, topic, room_name, recording_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [courseId, startsAt, duration, topic, roomName, recording]
  );
  return result.rows[0];
};

const updateSession = async (sessionId, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });
  if (!fields.length) {
    const existing = await query('SELECT * FROM common_app.class_sessions WHERE id = $1', [sessionId]);
    return existing.rows[0] || null;
  }
  values.push(sessionId);
  const result = await query(
    `UPDATE common_app.class_sessions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteSession = async (sessionId) => {
  await query('DELETE FROM common_app.class_sessions WHERE id = $1', [sessionId]);
};

const listAttendanceForSession = async (sessionId) => {
  const result = await query(
    `SELECT al.id, al.student_id, al.status, al.method, al.captured_at, al.confidence, u.full_name
     FROM common_app.attendance_logs al
     JOIN common_app.users u ON u.id = al.student_id
     WHERE al.session_id = $1
     ORDER BY u.full_name ASC`,
    [sessionId]
  );
  return result.rows;
};

const markAttendance = async (sessionId, entries = []) => {
  await Promise.all(
    entries.map(({ student_id: studentId, status, method, confidence, notes }) =>
      query(
        `INSERT INTO common_app.attendance_logs (session_id, student_id, status, method, confidence, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (session_id, student_id) DO UPDATE
           SET status = EXCLUDED.status,
               method = EXCLUDED.method,
               confidence = EXCLUDED.confidence,
               notes = EXCLUDED.notes,
               captured_at = NOW()`,
        [sessionId, studentId, status, method, confidence ?? null, notes ?? null]
      )
    )
  );
  return listAttendanceForSession(sessionId);
};

const updateAttendanceEntry = async (attendanceId, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });
  if (!fields.length) {
    const existing = await query('SELECT * FROM common_app.attendance_logs WHERE id = $1', [attendanceId]);
    return existing.rows[0] || null;
  }
  values.push(attendanceId);
  const result = await query(
    `UPDATE common_app.attendance_logs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const listAssignmentsForCourse = async (courseId) => {
  const result = await query(
    `SELECT id, title, description, status, due_at, max_score, attachment_url, created_at, published_at
     FROM common_app.assignments
     WHERE course_id = $1
     ORDER BY created_at DESC`,
    [courseId]
  );
  return result.rows;
};

const createAssignment = async (courseId, payload) => {
  const { title, description, status, due_at: dueAt, max_score: maxScore, attachment_url: attachment } = payload;
  const result = await query(
    `INSERT INTO common_app.assignments (course_id, title, description, status, due_at, max_score, attachment_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [courseId, title, description, status ?? 'draft', dueAt, maxScore ?? 100, attachment]
  );
  return result.rows[0];
};

const updateAssignment = async (assignmentId, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });
  if (!fields.length) {
    const existing = await query('SELECT * FROM common_app.assignments WHERE id = $1', [assignmentId]);
    return existing.rows[0] || null;
  }
  values.push(assignmentId);
  const result = await query(
    `UPDATE common_app.assignments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteAssignment = async (assignmentId) => {
  await query('DELETE FROM common_app.assignments WHERE id = $1', [assignmentId]);
};

const listSubmissionsForAssignment = async (assignmentId) => {
  const result = await query(
    `SELECT sub.id, sub.student_id, sub.status, sub.grade, sub.feedback, sub.submitted_at, u.full_name
     FROM common_app.assignment_submissions sub
     JOIN common_app.users u ON u.id = sub.student_id
     WHERE sub.assignment_id = $1
     ORDER BY sub.submitted_at DESC`,
    [assignmentId]
  );
  return result.rows;
};

const gradeSubmission = async (submissionId, payload) => {
  const { grade, feedback, status } = payload;
  const result = await query(
    `UPDATE common_app.assignment_submissions
     SET grade = COALESCE($2, grade),
         feedback = COALESCE($3, feedback),
         status = COALESCE($4, status),
         graded_by = $5
     WHERE id = $1
     RETURNING *`,
    [submissionId, grade ?? null, feedback ?? null, status ?? 'graded', payload.graded_by]
  );
  return result.rows[0];
};

const listAnnouncementsForCourse = async (courseId) => {
  const result = await query(
    `SELECT id, title, body, creator_id, published_at, expires_at
     FROM common_app.announcements
     WHERE course_id = $1
     ORDER BY published_at DESC`,
    [courseId]
  );
  return result.rows;
};

const createAnnouncement = async (courseId, payload) => {
  const { title, body, creator_id: creatorId, expires_at: expiresAt } = payload;
  const result = await query(
    `INSERT INTO common_app.announcements (title, body, creator_id, course_id, published_at, expires_at)
     VALUES ($1, $2, $3, $4, NOW(), $5)
     RETURNING *`,
    [title, body, creatorId, courseId, expiresAt]
  );
  return result.rows[0];
};

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  listMaterials,
  addMaterial,
  removeMaterial,
  listEnrollments,
  enrollStudents,
  removeEnrollment,
  listSessions,
  createSession,
  updateSession,
  deleteSession,
  listAttendanceForSession,
  markAttendance,
  updateAttendanceEntry,
  listAssignmentsForCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listSubmissionsForAssignment,
  gradeSubmission,
  listAnnouncementsForCourse,
  createAnnouncement
};

