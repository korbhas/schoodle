import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/Dialog';

export default function AssignmentForm({ open, onClose, assignment, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    due_at: '',
    max_score: 100,
    attachment_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title || '',
        description: assignment.description || '',
        status: assignment.status || 'draft',
        due_at: assignment.due_at ? new Date(assignment.due_at).toISOString().slice(0, 16) : '',
        max_score: assignment.max_score || 100,
        attachment_url: assignment.attachment_url || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'draft',
        due_at: '',
        max_score: 100,
        attachment_url: ''
      });
    }
    setError('');
  }, [assignment, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'max_score' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title) {
      setError('Please fill in the title');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        due_at: formData.due_at ? new Date(formData.due_at).toISOString() : null,
        attachment_url: formData.attachment_url || null
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{assignment ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows="4"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="max_score" className="text-sm font-medium">
                Max Score
              </label>
              <Input
                id="max_score"
                name="max_score"
                type="number"
                value={formData.max_score}
                onChange={handleChange}
                min="0"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="due_at" className="text-sm font-medium">
              Due Date
            </label>
            <Input
              id="due_at"
              name="due_at"
              type="datetime-local"
              value={formData.due_at}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="attachment_url" className="text-sm font-medium">
              Attachment URL
            </label>
            <Input
              id="attachment_url"
              name="attachment_url"
              type="url"
              value={formData.attachment_url}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://example.com/file.pdf"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : assignment ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={onClose} />
      </DialogContent>
    </Dialog>
  );
}

