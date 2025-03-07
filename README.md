# TheChosenOnes

A project repository for UBCO COSC 310 Software Engineering Course.
It is dedicated to building and enhancing various features for both frontend and backend of Collabium - a Team Management Service Website.

## Current Status and Progress

| Kanban Column     | Number of Issues |
|-------------------|------------------|
| **Backlog**       | 30               |
| **Sprint Backlog**| 7                |
| **In Progress**   | 4                |
| **In Review**     | 1                |
| **Done**          | 54               |

> _Counts are based on the current Kanban board, as shown in the screenshot._

- Development for the frontend UI are completed
- Development for the backend functionality and database are in the progress
- Development for connecting the frontend UI functionalities with the backend functionalities are expected to be starting soon

## Description

TheChosenOnes' Collabium is an ongoing project aiming to integrate features such as:
- Backend task management (assigning users, CRUD operations, etc.)
- Frontend UI enhancements
- Database and infrastructure optimizations
- Additional administrative functionalities

## Features

- **User Management**: Register, authenticate, and manage user roles.
- **Task Management**: Create, read, update, and delete tasks with advanced features (e.g., locking tasks, assigning multiple users).
- **Kanban Board**: Track issues through various stages (Backlog, Sprint Backlog, In Progress, In Review, Done).
- **Admin Tools**: Specialized routes and functionalities for administrators.
- **CI/CD Integration**: Automated testing and deployment via Docker containers.

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React (Create React App)
- **Database**: Postgres 15 (Dockerized)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest & Supertest

## Setup

- **Clone the Repository**:
   ```bash
   git clone https://github.com/KianShirvani/TheChosenOnes.git
   cd TheChosenOnes
   ```

- **Environment Variables**
Create a .env file in the project root (or as specified in the Docker Compose file) with the necessary environment variables:
  ```bash
  BACKEND_HOST_PORT=5000
  BACKEND_CONTAINER_PORT=5000
  DATABASE_URL=postgres://postgres:password@db:5432/mydatabase
  JWT_SECRET=your_jwt_secret
  ```

- **Docker Compose**
  ```bash
  docker-compose up -d
  ```

- **Manual Installation (Optional)**
If you prefer running locally without Docker, install dependencies and start the server:
```bash
cd backend
npm install
npm start
```
- **Also, for frontend do below**
```bash
cd ../frontend
npm install
npm start
```

## License
This project is licensed under the MIT License.

## Maintenance
@KianShirvani and other contributors
