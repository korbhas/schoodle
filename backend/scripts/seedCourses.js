const { query } = require('../src/db/pool');

async function seedCourses() {
  try {
    console.log('Starting course seeding...');

    // Get the first available teacher, or create one if none exists
    let teacherResult = await query(
      'SELECT user_id FROM staff_app.teachers LIMIT 1'
    );

    let teacherId = teacherResult.rows[0]?.user_id;

    if (!teacherId) {
      console.log('No teachers found. Creating a sample teacher...');
      
      // Create a sample user for the teacher
      const userResult = await query(
        `INSERT INTO common_app.users (email, password_hash, role, full_name, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          'sample.teacher@schoodle.edu',
          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password: "password123"
          'teacher',
          'Sample Teacher',
          true
        ]
      );

      const userId = userResult.rows[0].id;

      // Create the teacher record
      await query(
        `INSERT INTO staff_app.teachers (user_id, department, designation)
         VALUES ($1, $2, $3)`,
        [userId, 'Computer Science', 'Professor']
      );

      teacherId = userId;
      console.log(`Sample teacher created with user_id: ${teacherId}`);
    } else {
      console.log(`Using existing teacher with user_id: ${teacherId}`);
    }

    // Insert the courses
    const courses = [
      {
        code: 'CS401',
        name: 'Software Engineering',
        syllabus: 'This course covers software engineering principles, methodologies, and practices. Topics include requirements analysis, system design, software architecture, testing strategies, project management, and software maintenance. Students will learn about agile methodologies, version control, CI/CD pipelines, and software quality assurance.',
        credits: 3
      },
      {
        code: 'CS402',
        name: 'Database Management Systems',
        syllabus: 'This course provides a comprehensive introduction to database systems. Topics include relational database design, SQL programming, normalization, indexing, transaction management, concurrency control, and database security. Students will work with modern database systems and learn about NoSQL databases and distributed database architectures.',
        credits: 3
      },
      {
        code: 'CS403',
        name: 'Artificial Intelligence',
        syllabus: 'This course explores the fundamentals of artificial intelligence and machine learning. Topics include search algorithms, knowledge representation, reasoning, machine learning algorithms (supervised, unsupervised, and reinforcement learning), neural networks, natural language processing, and AI ethics. Students will implement AI algorithms and work on practical projects.',
        credits: 3
      }
    ];

    for (const course of courses) {
      await query(
        `INSERT INTO common_app.courses (code, name, syllabus, credits, teacher_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (code) DO UPDATE
         SET name = EXCLUDED.name,
             syllabus = EXCLUDED.syllabus,
             credits = EXCLUDED.credits,
             teacher_id = EXCLUDED.teacher_id,
             updated_at = NOW()`,
        [course.code, course.name, course.syllabus, course.credits, teacherId]
      );
      console.log(`✓ Added/Updated course: ${course.code} - ${course.name}`);
    }

    console.log('\nCourses seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
