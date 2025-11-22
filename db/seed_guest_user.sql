-- Create guest user for chatbot access
-- Guest users can use chatbot but data is not stored or linked to professors

BEGIN;

-- Add 'guest' role to the enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND 
                   EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'guest' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role'))) THEN
        ALTER TYPE common_app.user_role ADD VALUE 'guest';
    END IF;
END $$;

-- Create guest user (password: guest123)
-- Using bcrypt hash for password 'guest123'
INSERT INTO common_app.users (email, password_hash, full_name, role, is_active)
VALUES (
    'guest@schoodle.edu',
    '$2a$10$rKqJ8qJ8qJ8qJ8qJ8qJ8qO8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
    'Guest User',
    'guest',
    TRUE
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email, full_name, role;

COMMIT;

