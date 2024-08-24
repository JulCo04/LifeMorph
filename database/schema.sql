CREATE DATABASE IF NOT EXISTS AdultEaseDB;
USE AdultEaseDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255), -- Added column for verification token
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Query to select all users
SELECT * FROM users;