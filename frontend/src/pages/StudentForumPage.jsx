import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getForumActivity } from '../services/students.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MessageSquare, FileText, Clock } from 'lucide-react';

export default function StudentForumPage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const studentId = id ? Number(id) : (currentUser?.id ? Number(currentUser.id) : null);
  
  const [activity, setActivity] = useState({ threads: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && studentId) {
      fetchForumActivity();
    } else if (!authLoading && !studentId) {
      setError('Student ID not found. Please log in again.');
      setLoading(false);
    }
  }, [studentId, authLoading]);

  const fetchForumActivity = async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getForumActivity(studentId);
      setActivity({
        threads: response.data?.threads || [],
        posts: response.data?.posts || []
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load forum activity';
      setError(errorMsg);
      console.error('Error fetching forum activity:', err);
      if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to view this student\'s forum activity, or the student record may not exist.');
      }
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold">Forum Activity</h1>
        <p className="text-muted-foreground">Your discussion threads and posts</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Discussion Threads</CardTitle>
            </div>
            <CardDescription>Threads you've created</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.threads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No threads created yet</p>
            ) : (
              <div className="space-y-3">
                {activity.threads.map((thread) => (
                  <div key={thread.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{thread.topic}</h3>
                      {thread.category && (
                        <Badge variant="outline" className="text-xs">
                          {thread.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {thread.created_at ? new Date(thread.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Forum Posts</CardTitle>
            </div>
            <CardDescription>Posts you've made</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts made yet</p>
            ) : (
              <div className="space-y-3">
                {activity.posts.map((post) => (
                  <div key={post.id} className="p-3 border rounded-lg">
                    <div className="mb-2">
                      <h3 className="font-medium text-sm">{post.topic}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

