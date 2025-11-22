import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAttendance } from '../services/students.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function StudentAttendancePage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const studentId = id ? Number(id) : (currentUser?.id ? Number(currentUser.id) : null);
  
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && studentId) {
      fetchAttendance();
    } else if (!authLoading && !studentId) {
      setError('Student ID not found. Please log in again.');
      setLoading(false);
    }
  }, [studentId, authLoading]);

  const fetchAttendance = async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getAttendance(studentId);
      setAttendance(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load attendance';
      setError(errorMsg);
      console.error('Error fetching attendance:', err);
      if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to view this student\'s attendance, or the student record may not exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  const summary = attendance?.summary || {};
  const courses = attendance?.courses || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      case 'excused':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Attendance records and summary</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Overall Summary</CardTitle>
          </div>
          <CardDescription>Total attendance across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <label className="text-sm text-muted-foreground">Present</label>
              </div>
              <p className="text-2xl font-bold">{summary.present || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <label className="text-sm text-muted-foreground">Absent</label>
              </div>
              <p className="text-2xl font-bold">{summary.absent || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <label className="text-sm text-muted-foreground">Late</label>
              </div>
              <p className="text-2xl font-bold">{summary.late || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <label className="text-sm text-muted-foreground">Excused</label>
              </div>
              <p className="text-2xl font-bold">{summary.excused || 0}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <label className="text-sm text-muted-foreground">Total Sessions</label>
            <p className="text-2xl font-bold">{summary.total || 0}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Course</CardTitle>
          <CardDescription>Attendance breakdown per course</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance records found</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                const presentRate = course.total > 0 
                  ? ((course.present / course.total) * 100).toFixed(1) 
                  : 0;
                return (
                  <div key={course.course_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{course.course_name}</h3>
                      <Badge variant="secondary">
                        {presentRate}% Present
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">Present:</span>
                        <span className="font-medium">{course.present || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-muted-foreground">Absent:</span>
                        <span className="font-medium">{course.absent || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-muted-foreground">Late:</span>
                        <span className="font-medium">{course.late || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">Excused:</span>
                        <span className="font-medium">{course.excused || 0}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Total: {course.total || 0} sessions
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

