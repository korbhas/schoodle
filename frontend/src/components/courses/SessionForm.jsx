import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/Dialog';

export default function SessionForm({ open, onClose, session, onSubmit }) {
  const [formData, setFormData] = useState({
    starts_at: '',
    duration_min: 60,
    topic: '',
    room_name: '',
    recording_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      const startDate = session.starts_at ? new Date(session.starts_at).toISOString().slice(0, 16) : '';
      setFormData({
        starts_at: startDate,
        duration_min: session.duration_min || 60,
        topic: session.topic || '',
        room_name: session.room_name || '',
        recording_url: session.recording_url || ''
      });
    } else {
      setFormData({
        starts_at: '',
        duration_min: 60,
        topic: '',
        room_name: '',
        recording_url: ''
      });
    }
    setError('');
  }, [session, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration_min' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.starts_at) {
      setError('Please select a start date and time');
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        starts_at: new Date(formData.starts_at).toISOString(),
        topic: formData.topic || null,
        room_name: formData.room_name || null,
        recording_url: formData.recording_url || null
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Session' : 'Create Session'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="starts_at" className="text-sm font-medium">
              Start Date & Time <span className="text-destructive">*</span>
            </label>
            <Input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              value={formData.starts_at}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="duration_min" className="text-sm font-medium">
              Duration (minutes)
            </label>
            <Input
              id="duration_min"
              name="duration_min"
              type="number"
              value={formData.duration_min}
              onChange={handleChange}
              min="1"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium">
              Topic
            </label>
            <Input
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., Introduction to React"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="room_name" className="text-sm font-medium">
              Room
            </label>
            <Input
              id="room_name"
              name="room_name"
              value={formData.room_name}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., Room 101"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="recording_url" className="text-sm font-medium">
              Recording URL
            </label>
            <Input
              id="recording_url"
              name="recording_url"
              type="url"
              value={formData.recording_url}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://example.com/recording"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : session ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose onClick={onClose} />
      </DialogContent>
    </Dialog>
  );
}
