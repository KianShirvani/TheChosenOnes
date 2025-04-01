# API Documentation

This document outlines the available API endpoints in the Task Management System. It is built using React.js, Node.js, Express.js, and PostgreSQL, with JWT-based authentication and role-based access control.

---

## Base URL

All API requests are made to:

```
http://localhost:5000
```

---

## Table of Contents

1. [Auth Routes](#auth-routes)
2. [User Routes](#user-routes)
3. [Admin Routes](#admin-routes)
4. [Task Routes](#task-routes)
5. [Message Routes (Firebase)](#message-routes-firebase)
6. [Notification Routes](#notification-routes)
7. [DTO and Validation](#dto-and-validation)
8. [Error Handling](#error-handling)
9. [Authentication with Postman](#authentication-with-postman)

---

## Auth Routes

**Base:** `/api/auth`

### `POST /login`
- **Description:** Authenticates a user.
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "token": "JWT_TOKEN_HERE",
  "role": "user"
}
```

### `POST /request-password-reset`
- Sends reset link via email using Mailgun.

### `POST /reset-password`
- Resets the user's password.

---

## User Routes

**Base:** `/api/users`

### `POST /`
- **Description:** Register a new user.
- **Middleware:** `validateRegistration`

### `GET /`
- **Description:** Get all users.

---

## Admin Routes

**Base:** `/api/admin`

- **All routes require**: `authenticatedUser` + `validateAdmin`

### `GET /users`
- Fetch all users (with `is_admin` flag)

### `POST /promote`
- Promote a user to admin.

### `POST /demote`
- Demote a user from admin.

### `PUT /update/:id`
- Update a user's name/email.

### `DELETE /delete/:id`
- Delete a user.

### `GET /stats`
- Returns task stats (e.g., todo count, in progress, done, completion rate, etc.)

---

## Task Routes

**Base:** `/api/tasks`

### `GET /`
- Fetch all tasks (with `assignedUsers` list)

### `GET /filter`
- Filter by `dueDate`, `userId`, `priority`, `status`

### `POST /`
- Create a new task
- **Required Fields:** `title`, `description`, `due_date`, `start_date`, `end_date`
- **Optional:** `assignedUsers: []`

### `PUT /:taskId`
- Update a task (also updates assigned users)

### `PUT /:taskId/lock`
- Lock/unlock a task (disables editing/moving if locked)

### `PUT /:taskId/move`
- Move task left/right across statuses: `"todo" -> "in progress" -> "done"`

### `DELETE /:taskId`
- Delete a task

### `GET /assigned/:userId`
- Get all tasks assigned to a specific user

### `PUT /assigned/:taskId`
- Update assigned task (partial task editor)

### `POST /:taskId/assign-users`
- Assign users to a task and trigger notifications

### `GET /:taskId/users`
- Get users assigned to a task

### `DELETE /:taskId/remove-users`
- Remove users from a task (note: logic pending)

---

## Message Routes (Firebase)

**Base:** `/api/messages`

### `POST /send-message`
- Send message via Firebase
```json
{
  "text": "Hello!",
  "senderId": "abc123",
  "chatId": "xyz789",
  "imageUrl": ""
}
```

### `GET /messages/:chatId`
- Fetch messages by chat ID

### `POST /like-message/:messageId`
- Like a message (ensures `userId` is unique per like)

---

## Notification Routes

**Base:** `/api/notifications`

- **All routes require:** `authenticatedUser`

### `GET /`
- Get unread notifications for the logged-in user

### `POST /:id/read`
- Mark a notification as read

---

## DTO and Validation

### `User Registration DTO`
| Field         | Type     | Required | Notes                          |
|---------------|----------|----------|--------------------------------|
| firstName     | string   | Yes       |                                |
| lastName      | string   | Yes       |                                |
| email         | string   | Yes       | Must be valid email            |
| phoneNum      | string   | Yes       | Must be valid phone format     |
| country       | string   | Yes       |                                |
| displayName   | string   | Yes       |                                |
| password      | string   | Yes       | Min 8 chars, 1 number, 1 upper |
| confirmPassword | string | Yes       | Must match password            |

### `Login DTO`
| Field     | Type   | Required |
|-----------|--------|----------|
| email     | string | Yes       |
| password  | string | Yes       |

---

## Error Handling

| Code | Description                      |
|------|----------------------------------|
| 200  | OK                               |
| 201  | Created                          |
| 204  | No Content                       |
| 400  | Bad Request                      |
| 401  | Unauthorized                     |
| 403  | Forbidden                        |
| 404  | Not Found                        |
| 500  | Internal Server Error            |

**Example Error Response:**
```json
{
  "error": "Invalid token"
}
```

---

here’s your fixed and cleaned-up section with proper formatting, indentation, and the corrected base url (`http://localhost:5000`):


## Authentication & Roles

- Routes requiring authentication use the `Authorization: Bearer <JWT>` header.
- Admin-only routes use middleware `validateAdmin`.
- Tasks have role-restricted editing based on lock status.

---

## Authentication with Postman

To access protected routes, you must include a valid JWT token in the request header.

### Step 1: Log in to get your token

Send a `POST` request to:

```
POST http://localhost:5000/api/auth/login
```

With the following JSON body:

```json
{
  "email": "your-email@example.com",
  "password": "yourPassword"
}
```

The response will include a `token` field like:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user"
}
```

---

### Step 2: Use the token in Postman

For any route that requires authentication:

1. Go to the **Headers** tab in Postman.
2. Add a new header:
    - **Key:** `Authorization`
    - **Value:** `Bearer YOUR_TOKEN_HERE` (replace with actual token)

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Now you're authenticated and can access protected routes like `/api/tasks`, `/api/admin/users`, etc.

---

## Notes

- `task_users` is the junction table for assigning tasks.
- `notifications` table is auto-populated on assignment.
- Message system uses Firebase Firestore — `db.collection("messages")`.

---

_Last updated: April 1, 2025_
```
