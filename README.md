# TheChosenOnes

A project repository for UBCO COSC 310 Software Engineering Course.  
It is dedicated to building and enhancing various features for both frontend and backend of Collabium - a Team Management Service Website.

## Current Status and Progress

| Kanban Column     | Number of Issues |
|-------------------|------------------|
| **Backlog**       | 20               |
| **Sprint Backlog**| 0                |
| **In Progress**   | 0               |
| **In Review**     | 0                |
| **Done**          | 145               |

- Development for the frontend UI is complete  
- Backend functionality and database development are complete
- Integration between frontend and backend is complete

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

### Installation Details
```bash
git clone https://github.com/KianShirvani/TheChosenOnes.git
cd TheChosenOnes
# Navigate tot he frontend and install dependencies
cd frontend
npm install
# Navigate to the backend and install dependencies
cd ../backend
npm install
# if that does not work, try installing the dependencies in the root directory
cd ..
npm install
```

### Environment Variables

Create a `.env` file in the root directory with:

```env
# Note: BACKEND_HOST_PORT should be set to 5000 if on Windows/Linux or 5001 if on Mac
BACKEND_HOST_PORT=5000
BACKEND_CONTAINER_PORT=5000
REACT_APP_API_URL=http://localhost:5000
DATABASE_URL=postgres://postgres:password@db:5432/mydatabase
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

### Docker Setup

Through CLI:
```bash
cd ..
docker-compose up -d
```

Through VSCode Docker extension:
```text
Locate docker-compose.yml in the root directory
Right click it and select "Compose up" from the available options
```

## Requirements Completion

### Functional Requirements

- User Authentication: Secure login/logout using encryption  
- Role-based Access Control:  
  - Admin Capabilities  
  - Team Member Capabilities  
- Manage user accounts & roles by promoting or demoting team members  
- Search tasks by date, assigned users, priority, and status  
- Lock tasks to prevent further changes either by priority or status  
- Create & delete tasks  
- View & update their assigned tasks  
- Task Management: Task details include title, description, priority, due date, assignee, and status  
- Tasks can be assigned to one or more team members  
- In-app notifications for assigned tasks  
- Task details editable by admins and assigned users  
- Tasks can be deleted by assigned users  
- Tasks can be deleted by admins regardless of assignment  

### Additional Functional Requirements (Added After Milestone 1)

- Home Page with summary and navigation  
- Sign Up Page for new users  
- Admin Dashboard with task metrics and deadlines  
- Live Messaging between team members  

### Non-Functional Requirements

- Error Handling: Provide meaningful error messages for invalid actions or inputs.
  - Error messages will include a unique code and concise description to help users and developers debug efficiently.
- Security: Passwords will be encrypted and stored securely.
- API: Provide RESTful APIs for efficient communication between system components.
- Database: Use a relational database for data persistence.
- Testing: Write comprehensive unit tests to ensure the correctness of APIs, core functionalities, and core features.
- Documentation: Include clear and comprehensive documentation.
  - API usage instructions
  - System setup and deployment steps
  - User manual for administrators
- Usability: Ensure the system is intuitive and user-friendly for both admins and team members.
  - Maintain performance and responsiveness under expected workloads of 2-5 users.
  - Task notifications should be sent without delay
  - The system will be up for 24 hours every day except for maintenance that will occur once a week for one hour at 01:00:00 PST.

## Known Bugs & Issues

### Unresolved Bugs

| Bug Description         | Issue # |
|-------------------------|---------|
| placeholder             | #       |
| placeholder             | #       |
| placeholder             | #       |


### Fixed Before Final Submission

Issue numbers:  
152, 176, 188, 210, 214, 226, 234, 228, 225, 216, 230, 232, 219, 220, 209, 229, 248, 251

Remaining:  
1

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
