import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/Dialog';

export default function CourseForm({ open, onClose, course, onSubmit, teachers = [] }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    syllabus: '',
    credits: 3,
    teacher_id: '',
    department_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code || '',
        name: course.name || '',
        syllabus: course.syllabus || '',
        credits: course.credits || 3,
        teacher_id: course.teacher_id || '',
        department_id: course.department_id || ''
      });
    } else {
      setFormData({
        code: '',
        name: '',
        syllabus: '',
        credits: 3,
        teacher_id: '',
        department_id: ''
      });
    }
    setError('');
  }, [course, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'credits' || name === 'teacher_id' || name === 'department_id' 
        ? (value ? Number(value) : '') 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.code || !formData.name || !formData.teacher_id) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Create Course'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Course Code <span className="text-destructive">*</span>
            </label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., CS101"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Course Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="teacher_id" className="text-sm font-medium">
              Teacher <span className="text-destructive">*</span>
            </label>
            <select
              id="teacher_id"
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              required
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name || teacher.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="credits" className="text-sm font-medium">
                Credits
              </label>
              <Input
                id="credits"
                name="credits"
                type="number"
                value={formData.credits}
                onChange={handleChange}
                min="1"
                max="10"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="department_id" className="text-sm font-medium">
                Department ID
              </label>
              <Input
                id="department_id"
                name="department_id"
                type="number"
                value={formData.department_id || ''}
                onChange={handleChange}
                disabled={loading}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="syllabus" className="text-sm font-medium">
              Syllabus
            </label>
            <Textarea
              id="syllabus"
              name="syllabus"
              value={formData.syllabus}
              onChange={handleChange}
              disabled={loading}
              rows="6"
              placeholder="Course description and syllabus..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : course ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={onClose} />
      </DialogContent>
    </Dialog>
  );
}

