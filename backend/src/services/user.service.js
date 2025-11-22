const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');

const baseFields =
  'id, email, role, full_name, avatar_url, phone_number, is_active, last_login_at, created_at, updated_at';

const getUserByEmail = async (email) => {
  const result = await query(
    `SELECT ${baseFields}, password_hash FROM common_app.users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
};

const getUserById = async (id) => {
  const result = await query(`SELECT ${baseFields} FROM common_app.users WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] || null;
};

const getUserWithPasswordById = async (id) => {
  const result = await query(
    `SELECT ${baseFields}, password_hash FROM common_app.users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

const getRoleProfile = async (role, userId) => {
  switch (role) {
    case 'student': {
      const res = await query(
        `SELECT user_id, enrollment_no, academic_year, program, advisor_id, digital_card, library_id
         FROM student_app.students WHERE user_id = $1`,
        [userId]
      );
      return res.rows[0] || null;
    }
    case 'teacher': {
      const res = await query(
        `SELECT user_id, department, designation, office_location, bio, joined_at
         FROM staff_app.teachers WHERE user_id = $1`,
        [userId]
      );
      return res.rows[0] || null;
    }
    case 'employee': {
      const res = await query(
        `SELECT user_id, role_title, department, reporting_to, joined_at
         FROM staff_app.employees WHERE user_id = $1`,
        [userId]
      );
      return res.rows[0] || null;
    }
    default:
      return null;
  }
};

const getUserProfile = async (id) => {
  const base = await getUserById(id);
  if (!base) return null;
  const profile = await getRoleProfile(base.role, base.id);
  return { ...base, profile };
};

const updateLastLogin = async (id) => {
  await query('UPDATE common_app.users SET last_login_at = NOW() WHERE id = $1', [id]);
};

const updateUserProfile = async (id, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx += 1;
  });

  if (!fields.length) {
    return getUserProfile(id);
  }

  values.push(id);
  await query(`UPDATE common_app.users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, values);
  return getUserProfile(id);
};

const updatePassword = async (id, hash) => {
  await query('UPDATE common_app.users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, id]);
};

const createUser = async ({ email, password, full_name: fullName, role = 'student', phone_number: phoneNumber, avatar_url: avatarUrl, is_active: isActive = true }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO common_app.users (email, password_hash, full_name, role, phone_number, avatar_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${baseFields}`,
    [email.toLowerCase(), passwordHash, fullName, role, phoneNumber || null, avatarUrl || null, isActive]
  );
  return result.rows[0];
};

const createUserByAdmin = async ({ email, password, full_name: fullName, role = 'student', phone_number: phoneNumber, avatar_url: avatarUrl, is_active: isActive = true }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO common_app.users (email, password_hash, full_name, role, phone_number, avatar_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${baseFields}`,
    [email.toLowerCase(), passwordHash, fullName, role, phoneNumber || null, avatarUrl || null, isActive]
  );
  return result.rows[0];
};

module.exports = {
  getUserByEmail,
  getUserById,
  getUserWithPasswordById,
  getUserProfile,
  updateLastLogin,
  updateUserProfile,
  updatePassword,
  createUser,
  createUserByAdmin
};

