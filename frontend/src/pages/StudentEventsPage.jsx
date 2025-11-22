import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listEvents } from '../services/students.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Calendar, MapPin, Tag } from 'lucide-react';

export default function StudentEventsPage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const studentId = id ? Number(id) : (currentUser?.id ? Number(currentUser.id) : null);
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && studentId) {
      fetchEvents();
    } else if (!authLoading && !studentId) {
      setError('Student ID not found. Please log in again.');
      setLoading(false);
    }
  }, [studentId, authLoading]);

  const fetchEvents = async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await listEvents(studentId);
      const eventsData = response?.data?.items || response?.items || response?.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load events';
      setError(errorMsg);
      console.error('Error fetching events:', err);
      if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to view this student\'s events, or the student record may not exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'registered':
        return <Badge variant="default">Registered</Badge>;
      case 'attended':
        return <Badge variant="default" className="bg-green-500">Attended</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground">Student events and participation</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No events found</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.event_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {event.category && (
                        <div className="flex items-center gap-2 mt-2">
                          <Tag className="h-4 w-4" />
                          <span>{event.category}</span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {event.start_at ? new Date(event.start_at).toLocaleString() : 'Date TBA'}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

