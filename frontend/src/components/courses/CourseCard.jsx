import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { BookOpen, User } from 'lucide-react';

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{course.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {course.code}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{course.credits || 3} credits</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {course.teacher_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{course.teacher_name}</span>
          </div>
        )}
        {course.syllabus && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {course.syllabus}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

