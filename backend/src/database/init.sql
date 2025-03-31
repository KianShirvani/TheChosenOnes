CREATE TABLE IF NOT EXISTS users(
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(40),
    last_name VARCHAR(40),
    email VARCHAR(40) UNIQUE,
    phone_num VARCHAR(40),
    country VARCHAR(40),
    display_name VARCHAR(20) UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS admins(
    admin_id INT PRIMARY KEY,
    FOREIGN KEY (admin_id) REFERENCES users (user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets(
    user_id INT PRIMARY KEY,
    token TEXT,
    expiry_time BIGINT,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kanbans(
    kanban_id SERIAL PRIMARY KEY,
    user_id INT,
    title VARCHAR(40),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    task_id SERIAL PRIMARY KEY,
    kanban_id INT,
    user_id INT,
    title VARCHAR(40),
    description TEXT,
    due_date DATE,
    status VARCHAR(20),
    priority INT CHECK (priority BETWEEN 1 AND 5),
    locked BOOLEAN DEFAULT FALSE,
    progress INT CHECK (progress BETWEEN 0 AND 100) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (kanban_id) REFERENCES kanbans (kanban_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS task_users (
    task_id INT,
    user_id INT,
    PRIMARY KEY (task_id, user_id),
    FOREIGN KEY (task_id) REFERENCES tasks (task_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
