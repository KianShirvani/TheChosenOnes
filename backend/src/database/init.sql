CREATE TABLE IF NOT EXISTS users(
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(40),
    last_name VARCHAR(40),
    email VARCHAR(40) UNIQUE,
    phone_num VARCHAR(40),
    country VARCHAR(40),
    display_name VARCHAR(20),
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

CREATE TABLE IF NOT EXISTS tasks(
    task_id SERIAL PRIMARY KEY,
    kanban_id INT,
    user_id INT,
    title VARCHAR(40),
    description TEXT,
    due_date DATE,
    status VARCHAR(20),
    priority INT CHECK (priority BETWEEN 1 AND 5),
    FOREIGN KEY (kanban_id) REFERENCES kanbans (kanban_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);