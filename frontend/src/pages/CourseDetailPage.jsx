import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCourse,
  listMaterials,
  listAssignments,
  listAnnouncements,
  updateCourse,
  deleteCourse,
  addMaterial,
  deleteMaterial,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createAnnouncement,
  listEnrollments,
  addEnrollments,
  removeEnrollment,
  listSessions,
  createSession,
  updateSession,
  deleteSession,
  listAttendance,
  markAttendance,
  updateAttendance,
  listSubmissions,
  gradeSubmission
} from '../services/courses.service';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import CourseForm from '../components/courses/CourseForm';
import MaterialForm from '../components/courses/MaterialForm';
import AssignmentForm from '../components/courses/AssignmentForm';
import AnnouncementForm from '../components/courses/AnnouncementForm';
import SessionForm from '../components/courses/SessionForm';
import { BookOpen, ArrowLeft, FileText, ClipboardList, Megaphone, User, Edit, Trash2, Plus, Users, Calendar, CheckSquare } from 'lucide-react';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [announcementFormOpen, setAnnouncementFormOpen] = useState(false);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const canEdit = isAdmin || isTeacher;

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = [
        getCourse(courseId),
        listMaterials(courseId),
        listAssignments(courseId),
        listAnnouncements(courseId)
      ];

      if (canEdit) {
        promises.push(listEnrollments(courseId));
      }
      if (isAdmin || isTeacher || user?.role === 'employee') {
        promises.push(listSessions(courseId));
      }

      const results = await Promise.all(promises);
      setCourse(results[0].data || results[0]);
      
      const mats = results[1].data?.items || results[1].data || results[1].items || [];
      setMaterials(Array.isArray(mats) ? mats : []);

      const assigns = results[2].data?.items || results[2].data || results[2].items || [];
      setAssignments(Array.isArray(assigns) ? assigns : []);

      const anns = results[3].data?.items || results[3].data || results[3].items || [];
      setAnnouncements(Array.isArray(anns) ? anns : []);

      if (canEdit && results[4]) {
        const enrolls = results[4].data?.items || results[4].data || results[4].items || [];
        setEnrollments(Array.isArray(enrolls) ? enrolls : []);
      }
      if ((isAdmin || isTeacher || user?.role === 'employee') && results[canEdit ? 5 : 4]) {
        const sess = results[canEdit ? 5 : 4].data?.items || results[canEdit ? 5 : 4].data || results[canEdit ? 5 : 4].items || [];
        setSessions(Array.isArray(sess) ? sess : []);
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load course details');
      console.error('Error fetching course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleUpdateCourse = async (data) => {
    await updateCourse(courseId, data);
    fetchCourseDetails();
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(courseId);
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleAddMaterial = async (data) => {
    await addMaterial(courseId, data);
    fetchCourseDetails();
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await deleteMaterial(materialId);
      fetchCourseDetails();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete material');
    }
  };

  const handleCreateAssignment = async (data) => {
    await createAssignment(courseId, data);
    fetchCourseDetails();
  };

  const handleUpdateAssignment = async (assignmentId, data) => {
    await updateAssignment(assignmentId, data);
    fetchCourseDetails();
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(assignmentId);
      fetchCourseDetails();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete assignment');
    }
  };

  const handleCreateAnnouncement = async (data) => {
    await createAnnouncement(courseId, data);
    fetchCourseDetails();
  };

  const handleAddEnrollments = async (data) => {
    await addEnrollments(courseId, data);
    fetchCourseDetails();
  };

  const handleRemoveEnrollment = async (studentId) => {
    if (!window.confirm('Remove this student from the course?')) return;
    await removeEnrollment(courseId, studentId);
    fetchCourseDetails();
  };

  const handleCreateSession = async (data) => {
    await createSession(courseId, data);
    fetchCourseDetails();
  };

  const handleUpdateSession = async (sessionId, data) => {
    await updateSession(sessionId, data);
    fetchCourseDetails();
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Delete this session?')) return;
    await deleteSession(sessionId);
    fetchCourseDetails();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error || 'Course not found'}</p>
              <Button onClick={fetchCourseDetails}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold">{course.name}</CardTitle>
                  <CardDescription className="text-lg mt-1">{course.code}</CardDescription>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCourseFormOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteCourse}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{course.credits || 3} credits</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {course.teacher_name && (
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Instructor: {course.teacher_name}</span>
            </div>
          )}
          {course.syllabus && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Syllabus</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{course.syllabus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Course Materials
              </CardTitle>
              <CardDescription>
                {materials.length} material{materials.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {canEdit && (
              <Button size="sm" onClick={() => setMaterialFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials available.</p>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-3 hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{material.title}</h4>
                      {material.description && (
                        <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(material.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {material.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(material.file_url, '_blank')}
                        >
                          View
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Assignments
              </CardTitle>
              <CardDescription>
                {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {canEdit && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingAssignment(null);
                  setAssignmentFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments available.</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-3 hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{assignment.title}</h4>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {assignment.due_at && (
                          <span>Due: {formatDate(assignment.due_at)}</span>
                        )}
                        {assignment.max_score && (
                          <span>Max Score: {assignment.max_score}</span>
                        )}
                        {assignment.status && (
                          <span className="capitalize">Status: {assignment.status}</span>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAssignment(assignment);
                            setAssignmentFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Announcements
              </CardTitle>
              <CardDescription>
                {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {canEdit && (
              <Button size="sm" onClick={() => setAnnouncementFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements available.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-3 hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{announcement.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(announcement.published_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms */}
      <CourseForm
        open={courseFormOpen}
        onClose={() => setCourseFormOpen(false)}
        course={course}
        onSubmit={handleUpdateCourse}
        teachers={[]}
      />

      <MaterialForm
        open={materialFormOpen}
        onClose={() => setMaterialFormOpen(false)}
        onSubmit={handleAddMaterial}
      />

      <AssignmentForm
        open={assignmentFormOpen}
        onClose={() => {
          setAssignmentFormOpen(false);
          setEditingAssignment(null);
        }}
        assignment={editingAssignment}
        onSubmit={editingAssignment
          ? (data) => handleUpdateAssignment(editingAssignment.id, data)
          : handleCreateAssignment
        }
      />

      <AnnouncementForm
        open={announcementFormOpen}
        onClose={() => setAnnouncementFormOpen(false)}
        onSubmit={handleCreateAnnouncement}
      />

      <SessionForm
        open={sessionFormOpen}
        onClose={() => {
          setSessionFormOpen(false);
          setEditingSession(null);
        }}
        session={editingSession}
        onSubmit={editingSession
          ? (data) => handleUpdateSession(editingSession.id, data)
          : handleCreateSession
        }
      />
    </div>
  );
}

