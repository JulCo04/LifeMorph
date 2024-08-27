CREATE DATABASE IF NOT EXISTS AdultEaseDB;
USE AdultEaseDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goalName VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT,
  endDate DATE NOT NULL,
  repetition INT NOT NULL,
  dateOfRepetition DATE,
  goalType INT NOT NULL,
  completed INT NOT NULL,
  steps JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  todo_title VARCHAR(255) NOT NULL,
  completed INT NOT NULL,
  todo_type VARCHAR(50) NOT NULL,
  due_date DATE NOT NULL ,
  notes TEXT,
  userId INT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);





-- Query to select all tasks
SELECT * FROM todos;

-- Query to select all users
SELECT * FROM users;


SELECT * FROM goals;