import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentProfilePage from './pages/StudentProfilePage';
import StudentGradesPage from './pages/StudentGradesPage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage';
import StudentClubsPage from './pages/StudentClubsPage';
import StudentEventsPage from './pages/StudentEventsPage';
import StudentForumPage from './pages/StudentForumPage';
import StudentChatPage from './pages/StudentChatPage';
import TeacherAnalyticsPage from './pages/TeacherAnalyticsPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        <Route path="students/:id/profile" element={<StudentProfilePage />} />
        <Route path="students/:id/grades" element={<StudentGradesPage />} />
        <Route path="students/:id/attendance" element={<StudentAttendancePage />} />
        <Route path="students/:id/assignments" element={<StudentAssignmentsPage />} />
        <Route path="students/:id/clubs" element={<StudentClubsPage />} />
        <Route path="students/:id/events" element={<StudentEventsPage />} />
        <Route path="students/:id/forum" element={<StudentForumPage />} />
        {/* Student self-access routes (no ID in URL) */}
        <Route path="student/profile" element={<StudentProfilePage />} />
        <Route path="student/grades" element={<StudentGradesPage />} />
        <Route path="student/attendance" element={<StudentAttendancePage />} />
        <Route path="student/assignments" element={<StudentAssignmentsPage />} />
        <Route path="student/clubs" element={<StudentClubsPage />} />
        <Route path="student/events" element={<StudentEventsPage />} />
        <Route path="student/forum" element={<StudentForumPage />} />
        <Route path="student/chat" element={<StudentChatPage />} />
        {/* Teacher routes */}
        <Route path="teacher/analytics" element={<TeacherAnalyticsPage />} />
        <Route path="teachers/:id/analytics" element={<TeacherAnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

