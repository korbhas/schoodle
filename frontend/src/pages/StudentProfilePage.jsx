import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStudent, updateStudent, getDigitalCard, updateDigitalCard } from '../services/students.service';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { User, Save, Edit, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const studentId = id ? Number(id) : (currentUser?.id ? Number(currentUser.id) : null);
  
  const [student, setStudent] = useState(null);
  const [digitalCard, setDigitalCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [cardEditing, setCardEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [cardData, setCardData] = useState({});

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'employee' || currentUser?.id === studentId;

  useEffect(() => {
    if (!authLoading && studentId) {
      fetchStudent();
      fetchDigitalCard();
    } else if (!authLoading && !studentId) {
      setError('Student ID not found. Please log in again.');
      setLoading(false);
    }
  }, [studentId, authLoading]);

  const fetchStudent = async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getStudent(studentId);
      setStudent(response.data);
      setFormData({
        enrollment_no: response.data?.enrollment_no || '',
        academic_year: response.data?.academic_year || '',
        program: response.data?.program || '',
        library_id: response.data?.library_id || ''
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load student profile';
      setError(errorMsg);
      console.error('Error fetching student:', err);
      console.error('Student ID used:', studentId);
      if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to view this student\'s profile, or the student record may not exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDigitalCard = async () => {
    try {
      const response = await getDigitalCard(studentId);
      setDigitalCard(response.data?.digital_card || null);
      setCardData(response.data?.digital_card || {});
    } catch (err) {
      console.error('Error fetching digital card:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      setError('');
      await updateStudent(studentId, formData);
      setEditing(false);
      fetchStudent();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update student');
    }
  };

  const handleUpdateCard = async () => {
    try {
      setError('');
      await updateDigitalCard(studentId, cardData);
      setCardEditing(false);
      fetchDigitalCard();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update digital card');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Profile</h1>
          <p className="text-muted-foreground">
            {student?.full_name || 'Loading...'} - {student?.enrollment_no || ''}
          </p>
        </div>
        {canEdit && !editing && (
          <Button onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Student personal and academic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input value={student?.full_name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={student?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enrollment Number</label>
                  <Input
                    value={formData.enrollment_no}
                    onChange={(e) => setFormData({ ...formData, enrollment_no: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Academic Year</label>
                  <Input
                    type="number"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Program</label>
                  <Input
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Library ID</label>
                  <Input
                    value={formData.library_id || ''}
                    onChange={(e) => setFormData({ ...formData, library_id: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditing(false);
                    fetchStudent();
                  }}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium">{student?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{student?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium">{student?.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Enrollment Number</label>
                  <p className="font-medium">{student?.enrollment_no || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Academic Year</label>
                  <p className="font-medium">{student?.academic_year || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Program</label>
                  <p className="font-medium">{student?.program || 'N/A'}</p>
                </div>
                {student?.library_id && (
                  <div>
                    <label className="text-sm text-muted-foreground">Library ID</label>
                    <p className="font-medium">{student.library_id}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Digital Card</CardTitle>
              </div>
              {canEdit && (
                <Dialog open={cardEditing} onOpenChange={setCardEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Digital Card</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Card Data (JSON)</label>
                        <Textarea
                          value={JSON.stringify(cardData, null, 2)}
                          onChange={(e) => {
                            try {
                              setCardData(JSON.parse(e.target.value));
                            } catch (err) {
                              // Invalid JSON, keep as is
                            }
                          }}
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateCard}>Save</Button>
                        <Button variant="outline" onClick={() => setCardEditing(false)}>Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <CardDescription>Student digital identification card</CardDescription>
          </CardHeader>
          <CardContent>
            {digitalCard ? (
              <div className="p-4 border rounded-lg bg-muted/50">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(digitalCard, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No digital card configured</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

