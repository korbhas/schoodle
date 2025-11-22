import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listClubs, joinClub, leaveClub } from '../services/students.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Users, UserPlus, UserMinus } from 'lucide-react';

export default function StudentClubsPage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const studentId = id ? Number(id) : (currentUser?.id ? Number(currentUser.id) : null);
  
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!authLoading && studentId) {
      fetchClubs();
    } else if (!authLoading && !studentId) {
      setError('Student ID not found. Please log in again.');
      setLoading(false);
    }
  }, [studentId, authLoading]);

  const fetchClubs = async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await listClubs(studentId);
      const clubsData = response?.data?.items || response?.items || response?.data || [];
      setClubs(Array.isArray(clubsData) ? clubsData : []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load clubs';
      setError(errorMsg);
      console.error('Error fetching clubs:', err);
      if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to view this student\'s clubs, or the student record may not exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      setActionLoading(clubId);
      setError('');
      await joinClub(studentId, clubId);
      fetchClubs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join club');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveClub = async (clubId) => {
    if (!window.confirm('Are you sure you want to leave this club?')) return;
    
    try {
      setActionLoading(clubId);
      setError('');
      await leaveClub(studentId, clubId);
      fetchClubs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave club');
    } finally {
      setActionLoading(null);
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
        <h1 className="text-3xl font-bold">Clubs</h1>
        <p className="text-muted-foreground">Student club memberships and activities</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clubs.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No club memberships found</p>
            </CardContent>
          </Card>
        ) : (
          clubs.map((club) => (
            <Card key={club.club_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{club.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {club.description || 'No description available'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{club.role || 'member'}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined: {club.joined_at ? new Date(club.joined_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {currentUser?.id === studentId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLeaveClub(club.club_id)}
                    disabled={actionLoading === club.club_id}
                    className="w-full"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    {actionLoading === club.club_id ? 'Leaving...' : 'Leave Club'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

