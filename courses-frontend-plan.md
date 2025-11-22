# Courses Module - Frontend Implementation Plan (Revised)

## Overview

Build a focused, incremental frontend interface for the Courses module, starting with essential viewing capabilities and gradually adding management features.

## Strategy: Incremental MVP Approach

Start simple, build incrementally:
1. **Phase 1 (MVP)**: View courses - list and detail pages (read-only)
2. **Phase 2**: Add create/edit/delete operations (admin/teacher only)
3. **Phase 3**: Advanced features (enrollments, sessions, attendance) - if needed later

---

## Phase 1: MVP - View Courses Only (Read-Only)

**Goal**: Users can browse and view courses with basic information.

### 1.1 Create Basic API Service Functions
- **File**: `frontend/src/services/courses.service.js`
- **Functions for Phase 1**:
  - `listCourses(params?)` - Get courses list (supports search filter)
  - `getCourse(courseId)` - Get single course details
  - `listMaterials(courseId)` - Get course materials (read-only)
  - `listAssignments(courseId)` - Get course assignments (read-only)
  - `listAnnouncements(courseId)` - Get course announcements (read-only)

### 1.2 Create Simple Course Card Component
- **File**: `frontend/src/components/courses/CourseCard.jsx`
- **Purpose**: Display course in card format
- **Shows**: Course code, name, teacher name, credits
- **Click**: Navigate to course detail page

### 1.3 Create Courses List Page
- **File**: `frontend/src/pages/CoursesPage.jsx`
- **Route**: `/courses`
- **Features**:
  - Display list of courses in grid/card layout
  - Basic search bar (optional - can add later)
  - Loading state
  - Error handling
  - Click card to view details

### 1.4 Create Course Detail Page (Read-Only)
- **File**: `frontend/src/pages/CourseDetailPage.jsx`
- **Route**: `/courses/:courseId`
- **Features**:
  - Display course header (code, name, teacher, credits, syllabus)
  - Display materials list (simple list)
  - Display assignments list (simple list)
  - Display announcements list (simple list)
  - Back button to courses list
  - Loading and error states
  - **NO edit/delete/create buttons yet**

### 1.5 Add Routing
- **File**: `frontend/src/App.jsx`
- Add routes:
  - `/courses` -> `<CoursesPage />`
  - `/courses/:courseId` -> `<CourseDetailPage />`
- Ensure routes are inside `DashboardLayout` protected route

### Phase 1 Files to Create:
1. `frontend/src/services/courses.service.js` (5 basic functions)
2. `frontend/src/components/courses/CourseCard.jsx`
3. `frontend/src/pages/CoursesPage.jsx`
4. `frontend/src/pages/CourseDetailPage.jsx`

### Phase 1 Files to Modify:
1. `frontend/src/App.jsx` - Add routes

### Phase 1 Success Criteria:
- [ ] Can navigate to `/courses` and see list
- [ ] Can click course to see details
- [ ] Course detail shows materials, assignments, announcements
- [ ] Loading and error states work
- [ ] Responsive design

---

## Phase 2: Add Management Features (Create/Edit/Delete)

**Goal**: Admins and teachers can create/edit/delete courses and related content.

### 2.1 Extend API Service Functions
- Add to `courses.service.js`:
  - `createCourse(data)`
  - `updateCourse(courseId, data)`
  - `deleteCourse(courseId)`
  - `addMaterial(courseId, data)`
  - `deleteMaterial(materialId)`
  - `createAssignment(courseId, data)`
  - `updateAssignment(assignmentId, data)`
  - `deleteAssignment(assignmentId)`
  - `createAnnouncement(courseId, data)`

### 2.2 Create Form Components
- **CourseForm.jsx** - Create/edit course form
- **MaterialForm.jsx** - Add material form
- **AssignmentForm.jsx** - Create/edit assignment form
- **AnnouncementForm.jsx** - Create announcement form

### 2.3 Add Action Buttons
- Add "Create Course" button to CoursesPage (admin only)
- Add "Edit/Delete" buttons to CourseDetailPage (admin/teacher only)
- Add "Add Material" button (admin/teacher only)
- Add "Create Assignment" button (admin/teacher only)
- Add "Create Announcement" button (admin/teacher only)

### Phase 2 Files to Create:
1. `frontend/src/components/courses/CourseForm.jsx`
2. `frontend/src/components/courses/MaterialForm.jsx`
3. `frontend/src/components/courses/AssignmentForm.jsx`
4. `frontend/src/components/courses/AnnouncementForm.jsx`

### Phase 2 Files to Modify:
1. `frontend/src/services/courses.service.js` - Add management functions
2. `frontend/src/pages/CoursesPage.jsx` - Add create button
3. `frontend/src/pages/CourseDetailPage.jsx` - Add edit/delete buttons

### Phase 2 Success Criteria:
- [ ] Admin can create new courses
- [ ] Admin/teacher can edit/delete courses
- [ ] Admin/teacher can add materials
- [ ] Admin/teacher can create/edit/delete assignments
- [ ] Admin/teacher can create announcements
- [ ] Forms have validation
- [ ] Success/error notifications work

---

## Phase 3: Advanced Features (Optional/Future)

Add when needed:
- Enrollment management
- Session management
- Attendance tracking
- Assignment submissions and grading

---

## Implementation Notes

### UI Components Needed
Check if these shadcn/ui components exist, create if missing:
- **Dialog** - For modals/forms
- **Select** - For dropdowns (teacher selection, etc.)
- **Textarea** - For syllabus, descriptions
- **Badge** - For status indicators
- **Table** - For materials/assignments lists (optional, can use simple divs)

### Code Patterns
- Use existing `apiClient` from `frontend/src/lib/api.js`
- Follow patterns from `LoginPage` and `RegisterPage`
- Use shadcn/ui components for consistent styling
- Handle loading states with spinners
- Show error messages for failed operations
- Use React Router `useNavigate` for navigation

### Role-Based Permissions
- **Admin**: Full access (create, read, update, delete)
- **Teacher**: Can create/update courses and content
- **Employee/Student**: Read-only access

---

## Benefits of This Approach

✅ Start with minimal complexity  
✅ Get something working quickly  
✅ Incrementally add features  
✅ Easier to test and debug  
✅ Less overwhelming  
✅ Can stop after Phase 1 if needed
