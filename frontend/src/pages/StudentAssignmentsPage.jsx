import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listAssignments, submitAssignment, getSubmission } from '../services/students.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { FileText, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const studentId = id ? Number(id) : (currentUser?.id ? Number(currentUser.id) : null);
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (!authLoading && studentId) {
      fetchAssignments();
    } else if (!authLoading && !studentId) {
      setError('Student ID not found. Please log in again.');
      setLoading(false);
    }
  }, [studentId, authLoading]);

  const fetchAssignments = async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await listAssignments(studentId);
      const assignmentsData = response?.data?.items || response?.items || response?.data || [];
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load assignments';
      setError(errorMsg);
      console.error('Error fetching assignments:', err);
      if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to view this student\'s assignments, or the student record may not exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !fileUrl) {
      setError('Please provide a file URL');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await submitAssignment(studentId, {
        assignment_id: selectedAssignment.id,
        file_url: fileUrl
      });
      setSubmissionDialogOpen(false);
      setFileUrl('');
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmissionDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setFileUrl(assignment.submission_id ? assignment.file_url || '' : '');
    setSubmissionDialogOpen(true);
  };

  const getStatusBadge = (assignment) => {
    if (assignment.submission_status === 'graded') {
      return <Badge variant="default" className="bg-green-500">Graded</Badge>;
    }
    if (assignment.submission_id) {
      return <Badge variant="secondary">Submitted</Badge>;
    }
    if (new Date(assignment.due_at) < new Date()) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
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
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">View and submit course assignments</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No assignments found</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle>{assignment.title}</CardTitle>
                      {getStatusBadge(assignment)}
                    </div>
                    <CardDescription>{assignment.course_name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.description && (
                  <p className="text-sm">{assignment.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleString() : 'No due date'}
                    </span>
                  </div>
                  {assignment.grade !== null && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Grade: {assignment.grade}</span>
                    </div>
                  )}
                </div>
                {assignment.submission_id && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Submitted:</span>{' '}
                      {assignment.submitted_at 
                        ? new Date(assignment.submitted_at).toLocaleString() 
                        : 'N/A'}
                    </p>
                    {assignment.file_url && (
                      <a 
                        href={assignment.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Submission
                      </a>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openSubmissionDialog(assignment)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {assignment.submission_id ? 'Update Submission' : 'Submit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAssignment?.submission_id ? 'Update' : 'Submit'} Assignment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{selectedAssignment?.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedAssignment?.course_name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File URL</label>
              <Input
                type="url"
                placeholder="https://example.com/file.pdf"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL of your submission file
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={submitting || !fileUrl}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button variant="outline" onClick={() => setSubmissionDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

