const { query } = require('../db/pool');

// Messaging
const listMessages = async ({ userId, box = 'inbox', limit, offset, unread }) => {
  const column = box === 'inbox' ? 'recipient_id' : 'sender_id';
  const conditions = [`${column} = $1`];
  const values = [userId];
  let idx = 2;

  if (unread !== undefined) {
    conditions.push(`is_read = $${idx}`);
    values.push(!unread);
    idx += 1;
  }

  const limitPlaceholder = `$${idx++}`;
  const offsetPlaceholder = `$${idx}`;
  values.push(limit, offset);

  const result = await query(
    `SELECT id, sender_id, recipient_id, subject, body, is_read, sent_at
     FROM common_app.messages
     WHERE ${conditions.join(' AND ')}
     ORDER BY sent_at DESC
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    values
  );
  return result.rows;
};

const getMessageById = async (messageId, userId) => {
  const result = await query(
    `SELECT id, sender_id, recipient_id, subject, body, is_read, sent_at
     FROM common_app.messages
     WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)`,
    [messageId, userId]
  );
  return result.rows[0] || null;
};

const sendMessage = async ({ senderId, recipientId, subject, body }) => {
  const result = await query(
    `INSERT INTO common_app.messages (sender_id, recipient_id, subject, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [senderId, recipientId, subject, body]
  );
  return result.rows[0];
};

const markMessageRead = async (messageId, userId) => {
  const result = await query(
    `UPDATE common_app.messages
     SET is_read = TRUE
     WHERE id = $1 AND recipient_id = $2
     RETURNING *`,
    [messageId, userId]
  );
  return result.rows[0] || null;
};

// Global announcements
const listGlobalAnnouncements = async () => {
  const result = await query(
    `SELECT id, title, body, creator_id, target_role, published_at, expires_at
     FROM common_app.announcements
     WHERE course_id IS NULL
     ORDER BY published_at DESC`
  );
  return result.rows;
};

const createGlobalAnnouncement = async ({ title, body, creator_id: creatorId, target_role: targetRole, expires_at: expiresAt }) => {
  const result = await query(
    `INSERT INTO common_app.announcements (title, body, creator_id, target_role, published_at, expires_at)
     VALUES ($1, $2, $3, $4, NOW(), $5)
     RETURNING *`,
    [title, body, creatorId, targetRole ?? null, expiresAt ?? null]
  );
  return result.rows[0];
};

const updateAnnouncement = async (id, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });

  if (!fields.length) {
    const existing = await query('SELECT * FROM common_app.announcements WHERE id = $1', [id]);
    return existing.rows[0] || null;
  }

  values.push(id);
  const result = await query(
    `UPDATE common_app.announcements SET ${fields.join(', ')}, published_at = NOW()
     WHERE id = $${idx}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteAnnouncement = async (id) => {
  await query('DELETE FROM common_app.announcements WHERE id = $1', [id]);
};

// Clubs admin
const listClubsAdmin = async () => {
  const result = await query(
    `SELECT c.id, c.name, c.description, c.admin_student, c.faculty_advisor, c.created_at,
            u.full_name AS admin_name
     FROM student_app.clubs c
     LEFT JOIN common_app.users u ON u.id = c.admin_student
     ORDER BY c.name ASC`
  );
  return result.rows;
};

const createClub = async ({ name, description, admin_student: adminStudent, faculty_advisor: facultyAdvisor }) => {
  const result = await query(
    `INSERT INTO student_app.clubs (name, description, admin_student, faculty_advisor)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description, adminStudent, facultyAdvisor]
  );
  return result.rows[0];
};

const updateClub = async (id, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });

  if (!fields.length) {
    const existing = await query('SELECT * FROM student_app.clubs WHERE id = $1', [id]);
    return existing.rows[0] || null;
  }

  values.push(id);
  const result = await query(
    `UPDATE student_app.clubs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteClub = async (id) => {
  await query('DELETE FROM student_app.clubs WHERE id = $1', [id]);
};

const listClubMembers = async (clubId) => {
  const result = await query(
    `SELECT cm.student_id, cm.role, cm.joined_at, u.full_name, u.email
     FROM student_app.club_members cm
     JOIN common_app.users u ON u.id = cm.student_id
     WHERE cm.club_id = $1
     ORDER BY cm.joined_at DESC`,
    [clubId]
  );
  return result.rows;
};

const addClubMember = async (clubId, studentId, role = 'member') => {
  await query(
    `INSERT INTO student_app.club_members (club_id, student_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (club_id, student_id) DO NOTHING`,
    [clubId, studentId, role]
  );
  return listClubMembers(clubId);
};

const removeClubMember = async (clubId, studentId) => {
  await query('DELETE FROM student_app.club_members WHERE club_id = $1 AND student_id = $2', [clubId, studentId]);
  return listClubMembers(clubId);
};

// Events
const listEventsAdmin = async ({ category, upcoming, limit, offset }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (category) {
    conditions.push(`e.category = $${idx++}`);
    values.push(category);
  }
  if (upcoming) {
    conditions.push('e.start_at >= NOW()');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitPlaceholder = `$${idx++}`;
  const offsetPlaceholder = `$${idx}`;
  values.push(limit, offset);

  const result = await query(
    `SELECT e.*, u.full_name AS organizer_name
     FROM student_app.events e
     JOIN common_app.users u ON u.id = e.organizer_id
     ${where}
     ORDER BY e.start_at DESC
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    values
  );
  return result.rows;
};

const createEvent = async ({ title, description, category, start_at: startAt, end_at: endAt, location, organizer_id: organizerId }) => {
  const result = await query(
    `INSERT INTO student_app.events (title, description, category, start_at, end_at, location, organizer_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, description, category, startAt, endAt, location, organizerId]
  );
  return result.rows[0];
};

const updateEvent = async (id, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });

  if (!fields.length) {
    const existing = await query('SELECT * FROM student_app.events WHERE id = $1', [id]);
    return existing.rows[0] || null;
  }

  values.push(id);
  const result = await query(
    `UPDATE student_app.events SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteEvent = async (id) => {
  await query('DELETE FROM student_app.events WHERE id = $1', [id]);
};

const listParticipants = async (eventId) => {
  const result = await query(
    `SELECT ep.user_id, ep.status, u.full_name, u.email
     FROM student_app.event_participants ep
     JOIN common_app.users u ON u.id = ep.user_id
     WHERE ep.event_id = $1`,
    [eventId]
  );
  return result.rows;
};

const registerParticipant = async (eventId, userId, status = 'registered') => {
  await query(
    `INSERT INTO student_app.event_participants (event_id, user_id, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, user_id) DO UPDATE
       SET status = EXCLUDED.status`,
    [eventId, userId, status]
  );
  return listParticipants(eventId);
};

const removeParticipant = async (eventId, userId) => {
  await query('DELETE FROM student_app.event_participants WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
  return listParticipants(eventId);
};

// Forum moderation
const listThreads = async ({ locked, limit, offset }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (locked !== undefined) {
    conditions.push(`is_locked = $${idx}`);
    values.push(locked);
    idx += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitPlaceholder = `$${idx++}`;
  const offsetPlaceholder = `$${idx}`;
  values.push(limit, offset);

  const result = await query(
    `SELECT dt.*, u.full_name AS creator_name
     FROM student_app.discussion_threads dt
     JOIN common_app.users u ON u.id = dt.creator_id
     ${where}
     ORDER BY dt.created_at DESC
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    values
  );
  return result.rows;
};

const lockThread = async (threadId, isLocked) => {
  const result = await query(
    `UPDATE student_app.discussion_threads
     SET is_locked = $2
     WHERE id = $1
     RETURNING *`,
    [threadId, isLocked]
  );
  return result.rows[0] || null;
};

const deleteThread = async (threadId) => {
  await query('DELETE FROM student_app.discussion_threads WHERE id = $1', [threadId]);
};

const listPendingPosts = async ({ limit, offset }) => {
  const result = await query(
    `SELECT fp.*, u.full_name
     FROM student_app.forum_posts fp
     JOIN common_app.users u ON u.id = fp.user_id
     ORDER BY fp.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

const deletePost = async (postId) => {
  await query('DELETE FROM student_app.forum_posts WHERE id = $1', [postId]);
};

module.exports = {
  listMessages,
  getMessageById,
  sendMessage,
  markMessageRead,
  listGlobalAnnouncements,
  createGlobalAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  listClubsAdmin,
  createClub,
  updateClub,
  deleteClub,
  listClubMembers,
  addClubMember,
  removeClubMember,
  listEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  listParticipants,
  registerParticipant,
  removeParticipant,
  listThreads,
  lockThread,
  deleteThread,
  listPendingPosts,
  deletePost
};
