-- Migration to support guest users in chatbot
-- Allows guests to use chatbot without storing data linked to courses/professors

BEGIN;

-- Add 'guest' role to the enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'guest' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE common_app.user_role ADD VALUE 'guest';
    END IF;
END $$;

-- Modify student_chat_sessions to allow NULL course_id (for guests)
ALTER TABLE student_app.student_chat_sessions 
    ALTER COLUMN course_id DROP NOT NULL;

-- Modify student_chat_sessions to reference users instead of students (to support guests)
-- First, find and drop the existing foreign key constraint
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'student_app.student_chat_sessions'::regclass
    AND confrelid = 'student_app.students'::regclass
    AND contype = 'f';
    
    -- Drop it if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE student_app.student_chat_sessions DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

-- Add new foreign key to users table (supports both students and guests)
ALTER TABLE student_app.student_chat_sessions 
    ADD CONSTRAINT student_chat_sessions_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES common_app.users(id) ON DELETE CASCADE;

-- Modify student_chat_sessions to allow NULL course_id in foreign key
ALTER TABLE student_app.student_chat_sessions 
    DROP CONSTRAINT IF EXISTS student_chat_sessions_course_id_fkey;

ALTER TABLE student_app.student_chat_sessions 
    ADD CONSTRAINT student_chat_sessions_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES common_app.courses(id) ON DELETE CASCADE;

-- Create guest user (password: guest123)
INSERT INTO common_app.users (email, password_hash, full_name, role, is_active)
VALUES (
    'guest@schoodle.edu',
    '$2a$10$bC3bqf3418AOFZ2SsdGUBOBfqVeyk8KUQmPs1iawGYcaGjDqccR0a', -- bcrypt hash for 'guest123'
    'Guest User',
    'guest',
    TRUE
)
ON CONFLICT (email) DO UPDATE 
SET role = 'guest', is_active = TRUE
RETURNING id, email, full_name, role;

COMMIT;

