const { query } = require('../db/pool');

const baseStudentSelect =
  's.user_id, u.full_name, u.email, u.phone_number, s.enrollment_no, s.academic_year, s.program, s.advisor_id, s.digital_card, s.library_id, s.created_at';

const listStudents = async ({ year, program, advisorId, limit, offset }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (year) {
    conditions.push(`s.academic_year = $${idx++}`);
    values.push(year);
  }
  if (program) {
    conditions.push(`s.program ILIKE $${idx++}`);
    values.push(`%${program}%`);
  }
  if (advisorId) {
    conditions.push(`s.advisor_id = $${idx++}`);
    values.push(advisorId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT ${baseStudentSelect}
     FROM student_app.students s
     JOIN common_app.users u ON u.id = s.user_id
     ${where}
     ORDER BY s.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );

  return result.rows;
};

const getStudentProfile = async (userId) => {
  const result = await query(
    `SELECT ${baseStudentSelect}
     FROM student_app.students s
     JOIN common_app.users u ON u.id = s.user_id
     WHERE s.user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const createStudent = async (payload) => {
  const {
    user_id: userId,
    enrollment_no: enrollmentNo,
    academic_year: academicYear,
    program,
    advisor_id: advisorId,
    digital_card: digitalCard,
    library_id: libraryId
  } = payload;

  await query(
    `INSERT INTO student_app.students
      (user_id, enrollment_no, academic_year, program, advisor_id, digital_card, library_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id) DO UPDATE
       SET enrollment_no = EXCLUDED.enrollment_no,
           academic_year = EXCLUDED.academic_year,
           program = EXCLUDED.program,
           advisor_id = EXCLUDED.advisor_id,
           digital_card = EXCLUDED.digital_card,
           library_id = EXCLUDED.library_id`,
    [userId, enrollmentNo, academicYear, program, advisorId, digitalCard, libraryId]
  );

  return getStudentProfile(userId);
};

const updateStudent = async (userId, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });

  if (!fields.length) {
    return getStudentProfile(userId);
  }

  values.push(userId);
  await query(`UPDATE student_app.students SET ${fields.join(', ')} WHERE user_id = $${idx}`, values);
  return getStudentProfile(userId);
};

const listGrades = async (studentId) => {
  const result = await query(
    `SELECT gr.course_id, c.name AS course_name, gr.grade, gr.gpa_points, gr.graded_at
     FROM student_app.grade_records gr
     JOIN common_app.courses c ON c.id = gr.course_id
     WHERE gr.student_id = $1
     ORDER BY gr.graded_at DESC`,
    [studentId]
  );

  const summary = await query(
    `SELECT AVG(gpa_points) AS gpa, COUNT(*) AS course_count
     FROM student_app.grade_records
     WHERE student_id = $1`,
    [studentId]
  );

  return {
    items: result.rows,
    summary: summary.rows[0] || { gpa: null, course_count: 0 }
  };
};

const upsertGrade = async (studentId, courseId, { grade, gpa_points: gpaPoints }) => {
  await query(
    `INSERT INTO student_app.grade_records (student_id, course_id, grade, gpa_points)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id, course_id) DO UPDATE
       SET grade = EXCLUDED.grade,
           gpa_points = EXCLUDED.gpa_points,
           graded_at = NOW()`,
    [studentId, courseId, grade, gpaPoints]
  );
  return listGrades(studentId);
};

const bulkUpsertGrades = async (studentId, records = []) => {
  await Promise.all(
    records.map((record) => upsertGrade(studentId, record.course_id, record))
  );
  return listGrades(studentId);
};

const getAttendanceSummary = async (studentId) => {
  const perCourse = await query(
    `SELECT
        c.id AS course_id,
        c.name AS course_name,
        COUNT(*) FILTER (WHERE al.status = 'present') AS present,
        COUNT(*) FILTER (WHERE al.status = 'absent') AS absent,
        COUNT(*) FILTER (WHERE al.status = 'late') AS late,
        COUNT(*) FILTER (WHERE al.status = 'excused') AS excused,
        COUNT(*) AS total
     FROM common_app.attendance_logs al
     JOIN common_app.class_sessions cs ON cs.id = al.session_id
     JOIN common_app.courses c ON c.id = cs.course_id
     WHERE al.student_id = $1
     GROUP BY c.id, c.name
     ORDER BY c.name`,
    [studentId]
  );

  const totals = perCourse.rows.reduce(
    (acc, row) => ({
      present: acc.present + Number(row.present),
      absent: acc.absent + Number(row.absent),
      late: acc.late + Number(row.late),
      excused: acc.excused + Number(row.excused),
      total: acc.total + Number(row.total)
    }),
    { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
  );

  return { summary: totals, courses: perCourse.rows };
};

const listAlerts = async (studentId) => {
  const result = await query(
    `SELECT id, course_id, sent_at, reason, delivery
     FROM student_app.attendance_alerts
     WHERE student_id = $1
     ORDER BY sent_at DESC`,
    [studentId]
  );
  return result.rows;
};

const createAlert = async (studentId, { course_id: courseId, reason, delivery }) => {
  const result = await query(
    `INSERT INTO student_app.attendance_alerts (student_id, course_id, reason, delivery)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [studentId, courseId, reason, delivery]
  );
  return result.rows[0];
};

const listAssignments = async (studentId, { limit, offset }) => {
  const result = await query(
    `SELECT
        a.id,
        a.course_id,
        c.name AS course_name,
        a.title,
        a.description,
        a.due_at,
        a.status,
        sub.id AS submission_id,
        sub.status AS submission_status,
        sub.grade,
        sub.submitted_at
     FROM common_app.assignments a
     JOIN common_app.course_enrollments ce ON ce.course_id = a.course_id
     JOIN common_app.courses c ON c.id = a.course_id
     LEFT JOIN common_app.assignment_submissions sub
       ON sub.assignment_id = a.id AND sub.student_id = $1
     WHERE ce.student_id = $1
     ORDER BY COALESCE(sub.submitted_at, a.due_at) DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [studentId]
  );

  return result.rows;
};

const ensureAssignmentAccess = async (studentId, assignmentId) => {
  const result = await query(
    `SELECT 1
     FROM common_app.assignments a
     JOIN common_app.course_enrollments ce ON ce.course_id = a.course_id
     WHERE a.id = $1 AND ce.student_id = $2`,
    [assignmentId, studentId]
  );
  return Boolean(result.rowCount);
};

const createSubmission = async ({ studentId, assignmentId, fileUrl }) => {
  const allowed = await ensureAssignmentAccess(studentId, assignmentId);
  if (!allowed) {
    const error = new Error('Assignment not accessible for this student');
    error.status = 403;
    throw error;
  }

  const result = await query(
    `INSERT INTO common_app.assignment_submissions (assignment_id, student_id, file_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (assignment_id, student_id) DO UPDATE
       SET file_url = EXCLUDED.file_url,
           submitted_at = NOW(),
           status = 'submitted'
     RETURNING *`,
    [assignmentId, studentId, fileUrl]
  );
  return result.rows[0];
};

const getSubmission = async ({ studentId, submissionId }) => {
  const result = await query(
    `SELECT *
     FROM common_app.assignment_submissions
     WHERE id = $1 AND student_id = $2`,
    [submissionId, studentId]
  );
  return result.rows[0] || null;
};

const listClubs = async (studentId) => {
  const result = await query(
    `SELECT cm.club_id, cm.role, cm.joined_at, c.name, c.description
     FROM student_app.club_members cm
     JOIN student_app.clubs c ON c.id = cm.club_id
     WHERE cm.student_id = $1
     ORDER BY cm.joined_at DESC`,
    [studentId]
  );
  return result.rows;
};

const joinClub = async (studentId, clubId, role = 'member') => {
  await query(
    `INSERT INTO student_app.club_members (club_id, student_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (club_id, student_id) DO NOTHING`,
    [clubId, studentId, role]
  );
  return listClubs(studentId);
};

const leaveClub = async (studentId, clubId) => {
  await query('DELETE FROM student_app.club_members WHERE club_id = $1 AND student_id = $2', [clubId, studentId]);
  return listClubs(studentId);
};

const listEvents = async (studentId) => {
  const result = await query(
    `SELECT ep.event_id, ep.status, e.title, e.start_at, e.location, e.category
     FROM student_app.event_participants ep
     JOIN student_app.events e ON e.id = ep.event_id
     WHERE ep.user_id = $1
     ORDER BY e.start_at DESC`,
    [studentId]
  );
  return result.rows;
};

const listForumActivity = async (studentId) => {
  const threads = await query(
    `SELECT id, topic, category, created_at
     FROM student_app.discussion_threads
     WHERE creator_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [studentId]
  );

  const posts = await query(
    `SELECT fp.id, fp.thread_id, fp.content, fp.created_at, dt.topic
     FROM student_app.forum_posts fp
     JOIN student_app.discussion_threads dt ON dt.id = fp.thread_id
     WHERE fp.user_id = $1
     ORDER BY fp.created_at DESC
     LIMIT 20`,
    [studentId]
  );

  return { threads: threads.rows, posts: posts.rows };
};

const getDigitalCard = async (studentId) => {
  const result = await query('SELECT digital_card FROM student_app.students WHERE user_id = $1', [studentId]);
  return result.rows[0]?.digital_card || null;
};

const updateDigitalCard = async (studentId, digitalCard) => {
  await query('UPDATE student_app.students SET digital_card = $1 WHERE user_id = $2', [digitalCard, studentId]);
  return getDigitalCard(studentId);
};

module.exports = {
  listStudents,
  getStudentProfile,
  createStudent,
  updateStudent,
  listGrades,
  upsertGrade,
  bulkUpsertGrades,
  getAttendanceSummary,
  listAlerts,
  createAlert,
  listAssignments,
  createSubmission,
  getSubmission,
  listClubs,
  joinClub,
  leaveClub,
  listEvents,
  listForumActivity,
  getDigitalCard,
  updateDigitalCard
};

