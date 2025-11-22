# Guest User Setup for Chatbot

## Overview
A guest user has been added to the system that can use the chatbot feature without:
- Storing data for teacher analytics
- Being bound to any professors/courses
- Requiring course selection

## Database Migration

Run the migration script to:
1. Add 'guest' role to the user_role enum
2. Modify student_chat_sessions table to allow NULL course_id
3. Update foreign key to reference users table (supports guests)
4. Create guest user account

```bash
psql -U your_user -d your_database -f db/migrate_guest_support.sql
```

## Guest User Credentials

- **Email**: guest@schoodle.edu
- **Password**: guest123
- **Role**: guest

## Features

### What Guests Can Do:
- ✅ Access chatbot routes
- ✅ Create chat sessions without selecting a course
- ✅ Send messages and receive AI responses
- ✅ View conversation history
- ✅ End sessions

### What Guests Cannot Do:
- ❌ Data is NOT saved to `student_requests` table (used for teacher analytics)
- ❌ No course selection required
- ❌ No data linked to professors

## Implementation Details

### Backend Changes:
1. **Schema**: Added 'guest' role, made course_id nullable
2. **Service**: `isGuestUser()` function checks user role
3. **Service**: Skips saving to `student_requests` for guests
4. **Controller**: Allows guest role, makes course_id optional for guests
5. **Routes**: All chat routes now allow 'guest' role

### Frontend Changes:
1. **StudentChatPage**: Course selection is optional for guests
2. **StudentChatPage**: Shows message that guest data is not stored
3. **Validation**: Allows session creation without course_id for guests

## Testing

1. Log in as guest@schoodle.edu / guest123
2. Navigate to /student/chat
3. Click "Start Chat" without selecting a course
4. Send messages and verify they work
5. Check database - verify no entries in `student_requests` table for guest user

