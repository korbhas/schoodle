import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/Dialog';
import { useAuth } from '../../contexts/AuthContext';

export default function MaterialForm({ open, onClose, onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    is_published: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        file_url: '',
        is_published: true
      });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.file_url) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        created_by: user?.id
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add material');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Course Material</DialogTitle>
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
              placeholder="e.g., Chapter 1 Notes"
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
              rows="3"
              placeholder="Optional description..."
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="file_url" className="text-sm font-medium">
              File URL <span className="text-destructive">*</span>
            </label>
            <Input
              id="file_url"
              name="file_url"
              type="url"
              value={formData.file_url}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="https://example.com/file.pdf"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_published" className="text-sm font-medium">
              Publish immediately
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={onClose} />
      </DialogContent>
    </Dialog>
  );
}

