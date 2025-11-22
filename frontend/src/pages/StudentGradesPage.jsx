import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGrades } from '../services/students.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { GraduationCap, Award } from 'lucide-react';

export default function StudentGradesPage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const studentId = id ? Number(id) : (currentUser?.id ? Number(currentUser.id) : null);
  
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && studentId) {
      fetchGrades();
    } else if (!authLoading && !studentId) {
      setError('Student ID not found. Please log in again.');
      setLoading(false);
    }
  }, [studentId, authLoading]);

  const fetchGrades = async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getGrades(studentId);
      setGrades(response.data?.items || []);
      setSummary(response.data?.summary || null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load grades';
      setError(errorMsg);
      console.error('Error fetching grades:', err);
      console.error('Student ID used:', studentId);
      console.error('Current user:', currentUser);
      if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to view this student\'s grades, or the student record may not exist.');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grades</h1>
        <p className="text-muted-foreground">Academic performance and grade records</p>
      </div>

      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <CardTitle>Academic Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">GPA</label>
                <p className="text-2xl font-bold">
                  {summary.gpa ? summary.gpa.toFixed(2) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Courses Completed</label>
                <p className="text-2xl font-bold">{summary.course_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <CardTitle>Course Grades</CardTitle>
          </div>
          <CardDescription>Individual course grades and GPA points</CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grades recorded yet</p>
          ) : (
            <div className="space-y-4">
              {grades.map((grade) => (
                <div key={grade.course_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{grade.course_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Graded on: {new Date(grade.graded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {grade.grade}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        GPA: {grade.gpa_points?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

