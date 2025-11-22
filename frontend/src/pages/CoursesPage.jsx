import { useState, useEffect } from 'react';
import { listCourses, createCourse, deleteCourse } from '../services/courses.service';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/courses/CourseCard';
import CourseForm from '../components/courses/CourseForm';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { BookOpen, Search, Plus, Trash2 } from 'lucide-react';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await listCourses(params);
      
      // Handle response structure: response.data.items or response.items or response
      const coursesData = response?.data?.items || response?.items || response?.data || response || [];
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to load courses';
      const errorDetails = err?.response?.data?.details || [];
      setError(errorDetails.length > 0 ? `${errorMessage}: ${errorDetails.join(', ')}` : errorMessage);
      console.error('Error fetching courses:', err);
      if (err?.response?.data) {
        console.error('Error response:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses(search);
  };

  const handleCreateCourse = async (data) => {
    await createCourse(data);
    fetchCourses(search);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(courseId);
      fetchCourses(search);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Browse all available courses</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Browse all available courses</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => fetchCourses()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">Browse all available courses</p>
      </div>

      <div className="flex gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch('');
                fetchCourses();
              }}
            >
              Clear
            </Button>
          )}
        </form>
        {isAdmin && (
          <Button onClick={() => {
            setEditingCourse(null);
            setCourseFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        )}
      </div>

      <CourseForm
        open={courseFormOpen}
        onClose={() => {
          setCourseFormOpen(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
        onSubmit={handleCreateCourse}
        teachers={[]}
      />

      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'No courses found matching your search.' : 'No courses available.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

