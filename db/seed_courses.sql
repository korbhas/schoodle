-- Seed script to add sample courses
-- This script adds Software Engineering, Database Management Systems, and Artificial Intelligence courses
-- 
-- Usage: psql -d schoodle_db -f db/seed_courses.sql
-- Or run this in your database client

BEGIN;

-- Get the first available teacher, or use a specific teacher_id
-- If you want to use a specific teacher, replace the subquery with the teacher's user_id
DO $$
DECLARE
    sample_teacher_id BIGINT;
    sample_user_id BIGINT;
    teacher_count INTEGER;
BEGIN
    -- Check if any teachers exist
    SELECT COUNT(*) INTO teacher_count FROM staff_app.teachers;
    
    -- Try to get an existing teacher
    SELECT user_id INTO sample_teacher_id
    FROM staff_app.teachers
    LIMIT 1;

    -- If no teacher exists, create a sample teacher
    IF sample_teacher_id IS NULL THEN
        RAISE NOTICE 'No teachers found. Creating a sample teacher...';
        
        -- Create a sample user for the teacher
        -- Note: Password hash is a placeholder - update this with actual hashed password
        INSERT INTO common_app.users (email, password_hash, role, full_name, is_active)
        VALUES (
            'sample.teacher@schoodle.edu',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: "password123"
            'teacher',
            'Sample Teacher',
            TRUE
        )
        RETURNING id INTO sample_user_id;

        -- Create the teacher record
        INSERT INTO staff_app.teachers (user_id, department, designation)
        VALUES (sample_user_id, 'Computer Science', 'Professor')
        RETURNING user_id INTO sample_teacher_id;
        
        RAISE NOTICE 'Sample teacher created with user_id: %', sample_user_id;
    ELSE
        RAISE NOTICE 'Using existing teacher with user_id: %', sample_teacher_id;
    END IF;

    -- Insert the courses
    INSERT INTO common_app.courses (code, name, syllabus, credits, teacher_id)
    VALUES
        (
            'CS401',
            'Software Engineering',
            'This course covers software engineering principles, methodologies, and practices. Topics include requirements analysis, system design, software architecture, testing strategies, project management, and software maintenance. Students will learn about agile methodologies, version control, CI/CD pipelines, and software quality assurance.',
            3,
            sample_teacher_id
        ),
        (
            'CS402',
            'Database Management Systems',
            'This course provides a comprehensive introduction to database systems. Topics include relational database design, SQL programming, normalization, indexing, transaction management, concurrency control, and database security. Students will work with modern database systems and learn about NoSQL databases and distributed database architectures.',
            3,
            sample_teacher_id
        ),
        (
            'CS403',
            'Artificial Intelligence',
            'This course explores the fundamentals of artificial intelligence and machine learning. Topics include search algorithms, knowledge representation, reasoning, machine learning algorithms (supervised, unsupervised, and reinforcement learning), neural networks, natural language processing, and AI ethics. Students will implement AI algorithms and work on practical projects.',
            3,
            sample_teacher_id
        )
    ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name,
        syllabus = EXCLUDED.syllabus,
        credits = EXCLUDED.credits,
        teacher_id = EXCLUDED.teacher_id,
        updated_at = NOW();

    RAISE NOTICE 'Courses inserted/updated successfully. Teacher ID used: %', sample_teacher_id;
END $$;

COMMIT;

