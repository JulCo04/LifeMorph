USE AdultEaseDB;

INSERT INTO users (username, email, password) VALUES
('user1', 'user1@example.com', 'password1'),
('user2', 'user2@example.com', 'password2');

INSERT INTO goals (goalName, category, description, endDate, repetition, dateOfRepetition, goalType, completed, steps) VALUES
('Take over a country', 'Fun & Entertainment', 'Establish a tyrannical government in any country and rule over it', '2024-06-30', 0, NULL, 1, 100, 
'[{"name": "Infiltrate government", "done": true}, {"name": "Rise to high position", "done": true}, {"name": "Convert to fascism", "done": true}]'),
('Save $100000', 'Finance', '', '2025-01-01', 0, NULL, 2, 60, 
'{"done": 60000, "target": 100000}'),
('Run a marathon', 'Health & Fitness', 'Complete a full marathon', '2024-08-01', 0, NULL, 0, 0, '{}');

SELECT * FROM goals;