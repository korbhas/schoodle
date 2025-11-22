import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/Dialog';
import { useAuth } from '../../contexts/AuthContext';

export default function AnnouncementForm({ open, onClose, onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    expires_at: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        body: '',
        expires_at: ''
      });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.body) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        creator_id: user?.id,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
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
            <label htmlFor="body" className="text-sm font-medium">
              Content <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              required
              disabled={loading}
              rows="6"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expires_at" className="text-sm font-medium">
              Expires At (Optional)
            </label>
            <Input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Announcement'}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={onClose} />
      </DialogContent>
    </Dialog>
  );
}

