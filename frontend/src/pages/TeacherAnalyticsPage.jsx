import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCourseAnalytics, listTeacherCourses } from '../services/teacherAnalytics.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select, SelectItem } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { TrendingUp, TrendingDown, BookOpen, Users, RefreshCw, Loader2 } from 'lucide-react';

export default function TeacherAnalyticsPage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const teacherId = id ? Number(id) : (currentUser?.id ? Number(currentUser.id) : null);
  
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && teacherId) {
      fetchCourses();
    }
  }, [teacherId, authLoading]);

  useEffect(() => {
    if (selectedCourseId && teacherId) {
      fetchAnalytics();
    }
  }, [selectedCourseId, teacherId]);

  const fetchCourses = async () => {
    if (!teacherId) return;
    try {
      setLoading(true);
      setError('');
      const response = await listTeacherCourses(teacherId);
      setCourses(response.data?.items || []);
      if (response.data?.items?.length > 0 && !selectedCourseId) {
        setSelectedCourseId(response.data.items[0].id);
      }
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!teacherId || !selectedCourseId) return;
    try {
      setLoadingAnalytics(true);
      setError('');
      const response = await getCourseAnalytics(teacherId, selectedCourseId);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleRefresh = () => {
    if (selectedCourseId) {
      fetchAnalytics();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!teacherId) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          Teacher ID not found. Please log in again.
        </div>
      </div>
    );
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Analytics</h1>
          <p className="text-muted-foreground">Analyze student performance and engagement</p>
        </div>
        {selectedCourseId && (
          <Button onClick={handleRefresh} disabled={loadingAnalytics} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingAnalytics ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedCourseId ? String(selectedCourseId) : ''}
            onValueChange={(val) => setSelectedCourseId(val ? Number(val) : null)}
          >
            <SelectItem value="">Select a course...</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.code} - {course.name}
              </SelectItem>
            ))}
          </Select>
          {selectedCourse && (
            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{selectedCourse.student_count || 0} students</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{selectedCourse.total_requests || 0} interactions</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loadingAnalytics ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : analytics ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <CardTitle>Student Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {analytics.strengths && analytics.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {analytics.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="default" className="mt-1">+</Badge>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific strengths identified yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <CardTitle>Student Weaknesses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {analytics.weaknesses && analytics.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {analytics.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="destructive" className="mt-1">-</Badge>
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific weaknesses identified yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Topics</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.common_topics && analytics.common_topics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.common_topics.map((topic, idx) => (
                    <Badge key={idx} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No common topics identified yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.recommendations && analytics.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {analytics.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-1">{idx + 1}</Badge>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recommendations available yet.</p>
              )}
            </CardContent>
          </Card>

          {analytics.raw_analysis && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
                <CardDescription>Full AI-generated analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {analytics.raw_analysis}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{analytics.student_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interactions</p>
                  <p className="text-2xl font-bold">{analytics.total_interactions || 0}</p>
                </div>
              </div>
              {analytics.cached && (
                <p className="text-xs text-muted-foreground mt-4">
                  * Cached results. Click refresh to regenerate.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : selectedCourseId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No analytics data available for this course yet.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

