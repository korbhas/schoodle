import { useState, useEffect } from 'react';
import { Select, SelectItem } from '../ui/Select';
import { listCourses } from '../../services/courses.service';
import { BookOpen } from 'lucide-react';

export default function CourseSelector({ value, onValueChange, required = true }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await listCourses({ pageSize: 100 });
      setCourses(response.data?.items || []);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">{error}</div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Select Course {required && <span className="text-destructive">*</span>}
      </label>
      <Select value={value ? String(value) : ''} onValueChange={(val) => onValueChange(val ? Number(val) : null)}>
        <SelectItem value="">Select a course...</SelectItem>
        {courses.map((course) => (
          <SelectItem key={course.id} value={String(course.id)}>
            {course.code} - {course.name}
          </SelectItem>
        ))}
      </Select>
      {required && !value && (
        <p className="text-xs text-destructive">Please select a course to continue</p>
      )}
    </div>
  );
}

