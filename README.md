# Schoodle Platform

A comprehensive school management platform built as an Electron desktop application with a Node.js/Express backend and PostgreSQL database.

## Project Structure

```
schoodle/
├── backend/          # Node.js/Express API server
├── frontend/         # Electron + React frontend
├── db/              # PostgreSQL schema and migrations
└── package.json     # Root package.json for workspace scripts
```

## Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (see `backend/.env.example` for reference):
```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=schoodle_db
DB_USER=postgres
DB_PASSWORD=your-password
```

4. Set up database:
```bash
# Create database
createdb schoodle_db

# Run schema
psql -d schoodle_db -f ../db/schema.sql
```

5. Start backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_URL=http://localhost:3000/api
```

4. Start development server:
```bash
npm run dev
```

5. In another terminal, run Electron:
```bash
npm run electron:dev
```

### Running Everything Together

From the root directory:
```bash
npm run dev
```

This will start both backend and frontend concurrently.

## Features

### Backend APIs
- Authentication & User Management
- Staff Management (Teachers, Employees, Payroll, Leaves)
- Student Management (Profiles, Grades, Attendance)
- Course/Academics (Courses, Sessions, Assignments)
- Community (Messages, Clubs, Events, Forum)
- Marketplace (Listings, Bounties, Transactions)
- Notifications

### Frontend
- Electron desktop application
- React + Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- Authentication flow with JWT tokens

## Development

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run electron:dev` - Run Electron app
- `npm run lint` - Run ESLint

## Database Schema

The database uses three schemas:
- `common_app` - Shared tables (users, courses, messages, etc.)
- `staff_app` - Staff-specific tables (teachers, employees, payroll, etc.)
- `student_app` - Student-specific tables (students, grades, clubs, etc.)

See `db/schema.sql` for complete schema definition.

## License

MIT

