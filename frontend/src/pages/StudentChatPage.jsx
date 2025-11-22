import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createSession, sendMessage, getSessionHistory, endSession, getSession, listSessions } from '../services/studentChat.service';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import CourseSelector from '../components/chat/CourseSelector';
import { MessageSquare, Send, X, Loader2, Bot, User, AlertCircle, Sparkles } from 'lucide-react';

export default function StudentChatPage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const studentId = (() => {
    if (id) {
      const numId = Number(id);
      return isNaN(numId) ? null : numId;
    }
    if (currentUser?.id) {
      const numId = Number(currentUser.id);
      return isNaN(numId) ? null : numId;
    }
    return null;
  })();
  
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sessionStatus, setSessionStatus] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load active session on mount
  useEffect(() => {
    if (!authLoading && studentId && !isNaN(studentId) && studentId > 0 && !sessionId) {
      loadActiveSession();
    }
  }, [authLoading, studentId, sessionId]);

  useEffect(() => {
    if (sessionId) {
      loadSessionHistory();
      loadSessionDetails();
    }
  }, [sessionId]);

  const loadActiveSession = async () => {
    // Double-check validation before making API call
    const numStudentId = Number(studentId);
    if (!studentId || isNaN(numStudentId) || numStudentId <= 0) {
      console.warn('loadActiveSession: Skipping - studentId is invalid:', studentId, '(type:', typeof studentId, ')');
      return;
    }
    
    try {
      console.log('loadActiveSession: Loading active sessions for studentId:', numStudentId);
      const response = await listSessions(numStudentId, { status: 'active', pageSize: 1 });
      const sessions = response.data?.data?.items || response.data?.items || [];
      if (sessions.length > 0) {
        const activeSession = sessions[0];
        setSessionId(activeSession.session_id || activeSession.id);
        setSelectedCourseId(activeSession.course_id);
        console.log('loadActiveSession: Found active session:', activeSession.session_id || activeSession.id);
      } else {
        console.log('loadActiveSession: No active sessions found');
      }
    } catch (err) {
      // Only log validation errors, not API errors (it's okay if there's no active session)
      if (err.message?.includes('Invalid studentId')) {
        console.warn('loadActiveSession: Validation error -', err.message);
      } else {
        console.error('loadActiveSession: API error:', err);
        if (err.response) {
          console.error('  - Status:', err.response.status);
          console.error('  - Data:', err.response.data);
        }
      }
      // Don't show error to user - it's okay if there's no active session
    }
  };

  const loadSessionDetails = async () => {
    if (!sessionId || !studentId) return;
    try {
      const response = await getSession(studentId, sessionId);
      const sessionData = response.data?.data || response.data;
      setSessionStatus(sessionData);
    } catch (err) {
      console.error('Error loading session details:', err);
    }
  };

  const loadSessionHistory = async () => {
    if (!sessionId || !studentId) return;
    try {
      setLoading(true);
      const response = await getSessionHistory(studentId, sessionId);
      const historyData = response.data?.data || response.data;
      const messages = historyData?.items || [];
      setMessages(messages.map(msg => ({
        message_id: msg.message_id,
        role: msg.role || msg.sender_type || 'user',
        content: msg.content,
        reasoning_details: msg.reasoning_details,
        created_at: msg.created_at || msg.sent_at
      })));
    } catch (err) {
      setError('Failed to load conversation history');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    // For guest users, course selection is optional
    const isGuest = currentUser?.role === 'guest';
    
    if (!isGuest && !selectedCourseId) {
      setError('Please select a course');
      return;
    }
    
    if (!studentId || isNaN(studentId) || studentId <= 0) {
      setError('Invalid student ID. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Creating session with studentId:', studentId, 'courseId:', selectedCourseId || 'null (guest)', 'isGuest:', isGuest);
      const response = await createSession(studentId, selectedCourseId || null);
      console.log('Session created successfully:', response);
      const sessionData = response.data?.data || response.data;
      setSessionId(sessionData.session_id || sessionData.id);
      setMessages([]);
    } catch (err) {
      console.error('Error creating session:', err);
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      }
      if (err.config) {
        console.error('Request URL:', err.config.url);
        console.error('Request method:', err.config.method);
      }
      const errorMessage = err.response?.data?.error || err.message || 'Failed to start chat session';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || !studentId || sending) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);
    setError('');

    // Add user message to UI immediately
    const tempUserMessage = {
      message_id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await sendMessage(studentId, sessionId, userMessage);
      const messageData = response.data?.data || response.data;
      
      const formattedUserMessage = {
        message_id: messageData.userMessage?.message_id || Date.now(),
        role: 'user',
        content: messageData.userMessage?.content || userMessage,
        created_at: messageData.userMessage?.created_at || new Date().toISOString()
      };
      
      const formattedAssistantMessage = {
        message_id: messageData.assistantMessage?.message_id || Date.now() + 1,
        role: 'assistant',
        content: messageData.assistantMessage?.content || '',
        reasoning_details: messageData.assistantMessage?.reasoning_details,
        created_at: messageData.assistantMessage?.created_at || new Date().toISOString()
      };
      
      setMessages(prev => {
        const filtered = prev.filter(m => m.message_id !== tempUserMessage.message_id);
        return [
          ...filtered,
          formattedUserMessage,
          formattedAssistantMessage
        ];
      });
      
      loadSessionDetails();
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      }
      setError(err.response?.data?.error || err.message || 'Failed to send message');
      setMessages(prev => prev.filter(m => m.message_id !== tempUserMessage.message_id));
    } finally {
      setSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId || !studentId) return;

    try {
      setLoading(true);
      await endSession(studentId, sessionId);
      setSessionId(null);
      setSelectedCourseId(null);
      setMessages([]);
      setSessionStatus(null);
    } catch (err) {
      console.error('Error ending session:', err);
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      }
      setError(err.response?.data?.error || err.message || 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!studentId) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Student ID not found. Please log in again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Chat Assistant</h1>
          </div>
          <p className="text-muted-foreground">Get instant help with your course questions</p>
        </div>
        {sessionId && (
          <Button variant="outline" onClick={handleEndSession} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            End Session
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!sessionId ? (
        /* Start Session Card */
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Start a New Chat Session
            </CardTitle>
            <CardDescription>
              {currentUser?.role === 'guest' 
                ? 'Start chatting with the AI assistant (no course selection required for guests)'
                : 'Select a course to begin chatting with the AI assistant'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentUser?.role !== 'guest' && (
              <CourseSelector
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                required
              />
            )}
            {currentUser?.role === 'guest' && (
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <p>As a guest user, you can chat without selecting a course. Your conversations are not stored for analytics.</p>
              </div>
            )}
            <Button 
              onClick={handleStartSession} 
              disabled={(!selectedCourseId && currentUser?.role !== 'guest') || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Session...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Chat Interface */
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Session Info Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Session Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionStatus && (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                    <Badge variant={sessionStatus.status === 'active' ? 'default' : 'secondary'} className="w-fit">
                      {sessionStatus.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Messages</p>
                    <p className="text-2xl font-bold">{sessionStatus.message_count || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Tokens Used</p>
                    <p className="text-2xl font-bold">{sessionStatus.total_tokens || 0}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[500px] max-h-[600px]">
                {loading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <Bot className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isUser = message.role === 'user' || message.sender_type === 'user';
                    return (
                      <div
                        key={message.message_id || message.id || Date.now()}
                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}>
                          {isUser ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`rounded-lg px-4 py-2.5 ${
                              isUser
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted text-foreground rounded-tl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>
                          
                          {/* Reasoning Details */}
                          {message.reasoning_details && !isUser && (
                            <details className="mt-1 w-full">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                Show AI reasoning
                              </summary>
                              <div className="mt-2 p-3 bg-muted/50 rounded-md border text-xs">
                                <pre className="whitespace-pre-wrap font-mono">
                                  {typeof message.reasoning_details === 'string' 
                                    ? message.reasoning_details 
                                    : JSON.stringify(message.reasoning_details, null, 2)}
                                </pre>
                              </div>
                            </details>
                          )}
                          
                          {/* Timestamp */}
                          {message.created_at && (
                            <p className={`text-xs ${isUser ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4 space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your question here... (Press Enter to send, Shift+Enter for new line)"
                    disabled={sending}
                    className="min-h-[80px] resize-none"
                    rows={3}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || sending}
                    size="lg"
                    className="self-end"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  AI responses are powered by OpenRouter API
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
