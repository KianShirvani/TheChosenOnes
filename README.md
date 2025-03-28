# TheChosenOnes

A project repository for UBCO COSC 310 Software Engineering Course.  
It is dedicated to building and enhancing various features for both frontend and backend of Collabium - a Team Management Service Website.

## Current Status and Progress

| Kanban Column     | Number of Issues |
|-------------------|------------------|
| **Backlog**       | 27               |
| **Sprint Backlog**| 6                |
| **In Progress**   | 4               |
| **In Review**     | 1                |
| **Done**          | 121               |

- Development for the frontend UI is complete  
- Backend functionality and database development are complete
- Integration between frontend and backend is completed but just minor bug fixes remaining

## Description

TheChosenOnes' Collabium is an ongoing project aiming to integrate features such as:

- Backend task management (assigning users, CRUD operations, etc.)
- Frontend UI enhancements
- Database and infrastructure optimizations
- Additional administrative functionalities

## Features

- **User Management**: Register, authenticate, and manage user roles  
- **Task Management**: Create, read, update, and delete tasks with advanced features (e.g., locking tasks, assigning multiple users)  
- **Kanban Board**: Track issues through stages (Backlog, Sprint Backlog, In Progress, In Review, Done)  
- **Admin Tools**: Specialized routes and controls for administrators  
- **CI/CD Integration**: Automated testing and deployment with Docker  

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL  
- **Frontend**: React (Create React App)  
- **Database**: Postgres 15 (Dockerized)  
- **Containerization**: Docker & Docker Compose  
- **Testing**: Jest & Supertest  

## Setup

```bash
git clone https://github.com/KianShirvani/TheChosenOnes.git
cd TheChosenOnes
```

### Environment Variables

Create a `.env` file in the root directory with:

```env
BACKEND_HOST_PORT=5000
BACKEND_CONTAINER_PORT=5000
DATABASE_URL=postgres://postgres:password@db:5432/mydatabase
JWT_SECRET=your_jwt_secret
```

### Docker Setup

```bash
docker-compose up -d
```

### Manual Installation (Optional)

**Backend**
```bash
cd backend
npm install
npm start
```

**Frontend**
```bash
cd ../frontend
npm install
npm start
```

## Requirements Completion

Completed requirements are indicated by the `[COMPLETE]` tag.

### Functional Requirements

[COMPLETE] User Authentication: Secure login/logout using encryption  
Role-based Access Control:  
- Admin Capabilities  
- Team Member Capabilities  

[COMPLETE] Manage user accounts & roles by promoting or demoting team members  
[COMPLETE] Search tasks by date, assigned users, priority, and status  
[COMPLETE] Lock tasks to prevent further changes either by priority or status  
[COMPLETE] Create & delete tasks  
[COMPLETE] View & update their assigned tasks  
[COMPLETE] Task Management: Task details include title, description, priority, due date, assignee, and status  
[COMPLETE] Tasks can be assigned to one or more team members  
[COMPLETE] In-app notifications for assigned tasks  
[COMPLETE] Task details editable by admins and assigned users  
[COMPLETE] Tasks can be deleted by assigned users  
[COMPLETE] Tasks can be deleted by admins regardless of assignment  

Completed: 13/13 = 100%

### Additional Functional Requirements (Added After Milestone 1)

[COMPLETE] Home Page with summary and navigation  
[COMPLETE] Sign Up Page for new users  
[COMPLETE] Admin Dashboard with task metrics and deadlines  
[COMPLETE] Live Messaging between team members  

Completed: 4/4 = 100%

### Clarifications


## Known Bugs & Issues

| Bug Description                                             | Issue # |
|-------------------------------------------------------------|---------|
| Mismatched variable name causing compile error              | 152     |
| Scaling issue when creating task on small screens           | 176     |
| Task movement between columns not working                   | 188     |
| Admin & Task page deletion connection issues                | 210     |
| Fix task locking functionality                              | 214     |
| Fix deleting locked tasks                                   | 226     |
| Messages icon routes to signup instead of login             | 234     |
| Auth token not cleared on logout                            | 228     |
| Admin cannot promote/demote oneself                         | 232     |
| Column color not persistent                                 | 219     |
| Use toast notifications for task feedback                   | 225     |
| Dashboard UI mismatch                                       | 220     |
| Add/Update Task buttons not working as expected             | 209     |
| Admin page formatting (HCI) needs improvement               | 227     |
| Assigned users not visible in task cards                    | 229     |
| Edit user not working correctly                             | 230     |
| Task dashboard assign user functionality missing            | 216     |
| Group chat users not loading from DB                        | 222     |
| Notifications for user assignments not working              | 223     |
| Add toast on task addition                                  | 242     |
| Update task position issue                                  | 243     |
| Task movement bug                                           | 244     |
| Admin assign user restriction                               | 245     |
| Any user can assign others to tasks                         | 248     |
| TaskBoard should restrict users by team                     | 251     |
| Kanban ID not inserting into database                       | 255     |
| Tasks not moving columns correctly                          | 253     |

### Fixed Before Final Submission

Issue numbers:  
152, 176, 188, 210, 214, 226, 234, 228, 225, 216, 230, 232, 219, 220, 209, 229, 248, 251

Remaining:  
222, 227, 242, 223, 255

## Test Coverage

### Frontend Coverage

```text
Statements: 19.77%
Branches:   12.90%
Functions:  14.19%
Lines:      21.01%
```

Files with low coverage:
- `AdminDashboard.js`: 0.58%
- `TaskBoard.js`: 1.45%
- `TaskList.js`: 5.26%

### Backend Coverage

```text
Statements: 65.63%
Branches:   61.90%
Functions:  73.68%
Lines:      65.54%
```

Highlights:
- `taskController.js`: 63.69%
- `authController.js`: 67.53%
- `messageController.js`: 70.58%
- Routes: 100%

## License

This project is licensed under the MIT License.
