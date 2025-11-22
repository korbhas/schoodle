-- schoodle multi-schema database setup
-- PostgreSQL dialect

BEGIN;

-- -------------------------------------------------------------------
-- 1. Schemas
-- -------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS common_app;
CREATE SCHEMA IF NOT EXISTS staff_app;
CREATE SCHEMA IF NOT EXISTS student_app;

-- -------------------------------------------------------------------
-- 2. Common enums & reusable types
-- -------------------------------------------------------------------
CREATE TYPE common_app.user_role AS ENUM ('student', 'teacher', 'employee', 'admin');
CREATE TYPE common_app.leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE common_app.attendance_method AS ENUM ('manual', 'qr', 'nfc', 'ai');
CREATE TYPE common_app.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE common_app.assignment_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE common_app.submission_status AS ENUM ('submitted', 'graded', 'returned');
CREATE TYPE common_app.market_status AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE common_app.bounty_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE common_app.event_category AS ENUM ('academic', 'club', 'seminar', 'exam', 'social');
CREATE TYPE common_app.notification_channel AS ENUM ('push', 'email', 'sms', 'in_app');
CREATE TYPE student_app.chat_session_status AS ENUM ('active', 'completed', 'summarized');
CREATE TYPE student_app.message_role AS ENUM ('user', 'assistant');

-- -------------------------------------------------------------------
-- 3. Common schema core tables
-- -------------------------------------------------------------------
CREATE TABLE common_app.users (
    id             BIGSERIAL PRIMARY KEY,
    email          CITEXT UNIQUE NOT NULL,
    password_hash  TEXT NOT NULL,
    role           common_app.user_role NOT NULL DEFAULT 'student',
    full_name      TEXT NOT NULL,
    avatar_url     TEXT,
    phone_number   TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON common_app.users (role);

-- -------------------------------------------------------------------
-- 4. Staff & student profile tables
-- -------------------------------------------------------------------
CREATE TABLE staff_app.teachers (
    user_id         BIGINT PRIMARY KEY REFERENCES common_app.users (id) ON DELETE CASCADE,
    department      TEXT,
    designation     TEXT,
    office_location TEXT,
    bio             TEXT,
    joined_at       DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_app.employees (
    user_id      BIGINT PRIMARY KEY REFERENCES common_app.users (id) ON DELETE CASCADE,
    role_title   TEXT,
    department   TEXT,
    reporting_to BIGINT REFERENCES staff_app.employees (user_id),
    joined_at    DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_app.students (
    user_id        BIGINT PRIMARY KEY REFERENCES common_app.users (id) ON DELETE CASCADE,
    enrollment_no  TEXT UNIQUE NOT NULL,
    academic_year  SMALLINT,
    program        TEXT,
    advisor_id     BIGINT REFERENCES staff_app.teachers (user_id),
    digital_card   JSONB,
    library_id     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------------
-- 5. Common schema tables
-- -------------------------------------------------------------------
CREATE TABLE common_app.courses (
    id            BIGSERIAL PRIMARY KEY,
    code          TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    syllabus      TEXT,
    credits       SMALLINT DEFAULT 3,
    teacher_id    BIGINT NOT NULL REFERENCES staff_app.teachers (user_id),
    department_id BIGINT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE common_app.course_materials (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT NOT NULL REFERENCES common_app.courses (id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    file_url    TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  BIGINT NOT NULL REFERENCES common_app.users (id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE common_app.course_enrollments (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT NOT NULL REFERENCES common_app.courses (id) ON DELETE CASCADE,
    student_id  BIGINT NOT NULL REFERENCES student_app.students (user_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, student_id)
);

CREATE TABLE common_app.class_sessions (
    id           BIGSERIAL PRIMARY KEY,
    course_id    BIGINT NOT NULL REFERENCES common_app.courses (id) ON DELETE CASCADE,
    starts_at    TIMESTAMPTZ NOT NULL,
    duration_min SMALLINT NOT NULL DEFAULT 60,
    topic        TEXT,
    room_name    TEXT,
    recording_url TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE common_app.attendance_logs (
    id          BIGSERIAL PRIMARY KEY,
    session_id  BIGINT NOT NULL REFERENCES common_app.class_sessions (id) ON DELETE CASCADE,
    student_id  BIGINT NOT NULL REFERENCES student_app.students (user_id) ON DELETE CASCADE,
    status      common_app.attendance_status NOT NULL,
    method      common_app.attendance_method NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confidence  NUMERIC(4,3),
    notes       TEXT,
    UNIQUE (session_id, student_id)
);

CREATE TABLE common_app.assignments (
    id            BIGSERIAL PRIMARY KEY,
    course_id     BIGINT NOT NULL REFERENCES common_app.courses (id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT,
    status        common_app.assignment_status NOT NULL DEFAULT 'draft',
    due_at        TIMESTAMPTZ,
    max_score     NUMERIC(5,2) DEFAULT 100,
    attachment_url TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at  TIMESTAMPTZ
);

CREATE TABLE common_app.assignment_submissions (
    id            BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES common_app.assignments (id) ON DELETE CASCADE,
    student_id    BIGINT NOT NULL REFERENCES student_app.students (user_id) ON DELETE CASCADE,
    file_url      TEXT NOT NULL,
    submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grade         NUMERIC(5,2),
    feedback      TEXT,
    status        common_app.submission_status NOT NULL DEFAULT 'submitted',
    graded_by     BIGINT REFERENCES staff_app.teachers (user_id),
    UNIQUE (assignment_id, student_id)
);

CREATE TABLE common_app.messages (
    id           BIGSERIAL PRIMARY KEY,
    sender_id    BIGINT NOT NULL REFERENCES common_app.users (id) ON DELETE CASCADE,
    recipient_id BIGINT NOT NULL REFERENCES common_app.users (id) ON DELETE CASCADE,
    subject      TEXT,
    body         TEXT NOT NULL,
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_recipient ON common_app.messages (recipient_id, is_read);

CREATE TABLE common_app.announcements (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    creator_id  BIGINT NOT NULL REFERENCES common_app.users (id),
    target_role common_app.user_role,
    course_id   BIGINT REFERENCES common_app.courses (id),
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ
);

CREATE TABLE common_app.map_locations (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    description TEXT,
    latitude    NUMERIC(10,8),
    longitude   NUMERIC(11,8),
    created_by  BIGINT REFERENCES common_app.users (id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE common_app.location_reviews (
    id          BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL REFERENCES common_app.map_locations (id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES common_app.users (id) ON DELETE CASCADE,
    rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (location_id, user_id)
);

CREATE TABLE common_app.market_listings (
    id          BIGSERIAL PRIMARY KEY,
    seller_id   BIGINT NOT NULL REFERENCES common_app.users (id),
    title       TEXT NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL,
    status      common_app.market_status NOT NULL DEFAULT 'available',
    photos      TEXT[],
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE common_app.bounties (
    id             BIGSERIAL PRIMARY KEY,
    poster_id      BIGINT NOT NULL REFERENCES common_app.users (id),
    accepter_id    BIGINT REFERENCES common_app.users (id),
    description    TEXT NOT NULL,
    reward_amount  NUMERIC(10,2) NOT NULL,
    location_pickup TEXT,
    location_drop  TEXT,
    due_at         TIMESTAMPTZ,
    status         common_app.bounty_status NOT NULL DEFAULT 'open',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE common_app.transactions (
    id             BIGSERIAL PRIMARY KEY,
    payer_id       BIGINT NOT NULL REFERENCES common_app.users (id),
    payee_id       BIGINT NOT NULL REFERENCES common_app.users (id),
    amount         NUMERIC(10,2) NOT NULL,
    reference_type TEXT NOT NULL,
    reference_id   BIGINT,
    processed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes          TEXT
);

CREATE INDEX idx_transactions_payer ON common_app.transactions (payer_id);
CREATE INDEX idx_transactions_payee ON common_app.transactions (payee_id);

CREATE TABLE common_app.notifications (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT NOT NULL REFERENCES common_app.users (id) ON DELETE CASCADE,
    channel   common_app.notification_channel NOT NULL DEFAULT 'in_app',
    title     TEXT,
    body      TEXT NOT NULL,
    payload   JSONB,
    sent_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at   TIMESTAMPTZ
);

CREATE TABLE common_app.auth_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES common_app.users (id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    user_agent  TEXT,
    ip_address  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_user ON common_app.auth_tokens (user_id);

-- -------------------------------------------------------------------
-- 6. Staff schema tables
-- -------------------------------------------------------------------
CREATE TABLE staff_app.departments (
    id           BIGSERIAL PRIMARY KEY,
    name         TEXT UNIQUE NOT NULL,
    head_teacher BIGINT REFERENCES staff_app.teachers (user_id),
    office_phone TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_app.payroll_records (
    id           BIGSERIAL PRIMARY KEY,
    employee_id  BIGINT NOT NULL REFERENCES staff_app.employees (user_id) ON DELETE CASCADE,
    pay_period   DATE NOT NULL,
    gross_salary NUMERIC(12,2) NOT NULL,
    deductions   NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_salary   NUMERIC(12,2) NOT NULL,
    tax_info     JSONB,
    payslip_url  TEXT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (employee_id, pay_period)
);

CREATE TABLE staff_app.leave_requests (
    id           BIGSERIAL PRIMARY KEY,
    employee_id  BIGINT NOT NULL REFERENCES staff_app.employees (user_id) ON DELETE CASCADE,
    type         TEXT NOT NULL,
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    reason       TEXT,
    status       common_app.leave_status NOT NULL DEFAULT 'pending',
    approver_id  BIGINT REFERENCES staff_app.employees (user_id),
    decided_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leave_employee ON staff_app.leave_requests (employee_id, status);

CREATE TABLE staff_app.student_feedback (
    id         BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL REFERENCES staff_app.teachers (user_id),
    student_id BIGINT NOT NULL REFERENCES student_app.students (user_id),
    course_id  BIGINT REFERENCES common_app.courses (id),
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_app.teacher_analytics_cache (
    cache_id      BIGSERIAL PRIMARY KEY,
    teacher_id    BIGINT NOT NULL REFERENCES staff_app.teachers (user_id) ON DELETE CASCADE,
    course_id     BIGINT NOT NULL REFERENCES common_app.courses (id) ON DELETE CASCADE,
    analysis_data JSONB NOT NULL,
    generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_analytics_cache_teacher_course ON staff_app.teacher_analytics_cache (teacher_id, course_id, expires_at);

-- -------------------------------------------------------------------
-- 7. Student schema tables
-- -------------------------------------------------------------------
CREATE TABLE student_app.grade_records (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT NOT NULL REFERENCES student_app.students (user_id) ON DELETE CASCADE,
    course_id   BIGINT NOT NULL REFERENCES common_app.courses (id),
    grade       TEXT,
    gpa_points  NUMERIC(4,2),
    graded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

CREATE TABLE student_app.clubs (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT UNIQUE NOT NULL,
    description     TEXT,
    admin_student   BIGINT NOT NULL REFERENCES student_app.students (user_id),
    faculty_advisor BIGINT REFERENCES staff_app.teachers (user_id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_app.club_members (
    id         BIGSERIAL PRIMARY KEY,
    club_id    BIGINT NOT NULL REFERENCES student_app.clubs (id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES student_app.students (user_id) ON DELETE CASCADE,
    role       TEXT DEFAULT 'member',
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (club_id, student_id)
);

CREATE TABLE student_app.events (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    category    common_app.event_category NOT NULL,
    start_at    TIMESTAMPTZ NOT NULL,
    end_at      TIMESTAMPTZ,
    location    TEXT,
    organizer_id BIGINT NOT NULL REFERENCES common_app.users (id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_app.event_participants (
    id        BIGSERIAL PRIMARY KEY,
    event_id  BIGINT NOT NULL REFERENCES student_app.events (id) ON DELETE CASCADE,
    user_id   BIGINT NOT NULL REFERENCES common_app.users (id) ON DELETE CASCADE,
    status    TEXT DEFAULT 'registered',
    UNIQUE (event_id, user_id)
);

CREATE TABLE student_app.discussion_threads (
    id         BIGSERIAL PRIMARY KEY,
    topic      TEXT NOT NULL,
    creator_id BIGINT NOT NULL REFERENCES common_app.users (id),
    category   TEXT,
    is_locked  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_app.forum_posts (
    id         BIGSERIAL PRIMARY KEY,
    thread_id  BIGINT NOT NULL REFERENCES student_app.discussion_threads (id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES common_app.users (id),
    content    TEXT NOT NULL,
    parent_id  BIGINT REFERENCES student_app.forum_posts (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_forum_thread ON student_app.forum_posts (thread_id);

CREATE TABLE student_app.attendance_alerts (
    id         BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_app.students (user_id),
    course_id  BIGINT NOT NULL REFERENCES common_app.courses (id),
    sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason     TEXT,
    delivery   common_app.notification_channel DEFAULT 'in_app'
);

-- Student chat requests table
CREATE TABLE student_app.student_requests (
    request_id      BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES student_app.students (user_id) ON DELETE CASCADE,
    course_id       BIGINT NOT NULL REFERENCES common_app.courses (id) ON DELETE CASCADE,
    prompt          TEXT NOT NULL,
    ai_response     TEXT NOT NULL,
    reasoning_details JSONB,
    tokens_used     INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_requests_student_course ON student_app.student_requests (student_id, course_id, created_at);
CREATE INDEX idx_student_requests_course ON student_app.student_requests (course_id, created_at);

-- Student chat sessions table
CREATE TABLE student_app.student_chat_sessions (
    session_id      BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES student_app.students (user_id) ON DELETE CASCADE,
    course_id       BIGINT NOT NULL REFERENCES common_app.courses (id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    message_count   INTEGER NOT NULL DEFAULT 0,
    total_tokens    INTEGER NOT NULL DEFAULT 0,
    summary         TEXT,
    status          student_app.chat_session_status NOT NULL DEFAULT 'active'
);

CREATE INDEX idx_chat_sessions_student ON student_app.student_chat_sessions (student_id, status);
CREATE INDEX idx_chat_sessions_course ON student_app.student_chat_sessions (course_id, status);

-- Student chat messages table
CREATE TABLE student_app.student_chat_messages (
    message_id      BIGSERIAL PRIMARY KEY,
    session_id      BIGINT NOT NULL REFERENCES student_app.student_chat_sessions (session_id) ON DELETE CASCADE,
    role            student_app.message_role NOT NULL,
    content         TEXT NOT NULL,
    reasoning_details JSONB,
    message_order   INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON student_app.student_chat_messages (session_id, message_order);

-- -------------------------------------------------------------------
-- 8. Analytics & helpers
-- -------------------------------------------------------------------
CREATE TABLE common_app.analytics_snapshots (
    id          BIGSERIAL PRIMARY KEY,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload     JSONB NOT NULL,
    category    TEXT NOT NULL
);

CREATE OR REPLACE FUNCTION common_app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON common_app.users
    FOR EACH ROW EXECUTE FUNCTION common_app.set_updated_at();

CREATE TRIGGER trg_courses_updated
    BEFORE UPDATE ON common_app.courses
    FOR EACH ROW EXECUTE FUNCTION common_app.set_updated_at();

CREATE TRIGGER trg_market_listings_updated
    BEFORE UPDATE ON common_app.market_listings
    FOR EACH ROW EXECUTE FUNCTION common_app.set_updated_at();

COMMIT;

