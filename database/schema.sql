CREATE DATABASE IF NOT EXISTS AdultEaseDB;
USE AdultEaseDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  verified BOOLEAN,
  verification_token VARCHAR(255), -- Added column for verification token
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  userId INT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
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




CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  email VARCHAR(255), -- Added email field
  phoneNumber VARCHAR(20), -- Added phone number field
  notes TEXT, -- Added notes field
  links TEXT, -- Added links field
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  userId INT,
  birthday DATE, -- Birthday field
  photo VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS passwords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  userId INT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pins (
  userId INT,
  PIN VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Query to select all users
SELECT * FROM users;