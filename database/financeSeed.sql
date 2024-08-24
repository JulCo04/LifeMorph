-- Insert new data into FinCategories
INSERT INTO FinCategories (name, term, total, budgetTotal, userId) 
VALUES 
('Wage', TRUE, 0, 0, 1),
('Rent', TRUE, 0, 0, 1),
('Insurance', TRUE, 0, 0, 1),
('Loans', TRUE, 0, 0, 1),
('Savings', TRUE, 0, 0, 1),
('Food', FALSE, 0, 0, 1),
('Entertainment', FALSE, 0, 0, 1),
('Utilities', TRUE, 0, 0, 1),
('Telephone', TRUE, 0, 0, 1),
('Medical', FALSE, 0, 0, 1),
('Clothing', FALSE, 0, 0, 1),
('Gifts', FALSE, 0, 0, 1),
('Personal Care', FALSE, 0, 0, 1),
('Transportation', FALSE, 0, 0, 1),
('Other Fixed', TRUE, 0, 0, 1),
('Other Variable', FALSE, 0, 0, 1);

-- Insert new data into FinSums
INSERT INTO FinSums (name, total, userId) 
VALUES 
('Income', 0, 1),
('Expense', 0, 1),
('Fixed', 0, 1),
('Variable', 0, 1),
('UserTotal', 0, 1);

INSERT INTO FinIncomeTable (userId, categoryName, budgetExpense, actualExpense)
VALUES
(1, "Wage", 0, 0),
(1, "Other Income", 0, 0);


-- Insert new data into FinRows
INSERT INTO FinRows (categoryId, userId, flow, term, total, date, name) 
VALUES 
(1, 1, TRUE, TRUE, 150.00, '2024-07-01', 'Paycheck'),
(2, 1, FALSE, TRUE, 75.00, '2024-07-02', 'Monthly Rent'),
(3, 1, FALSE, TRUE, 50.00, '2024-07-03', 'Car Insurance'),
(3, 1, FALSE, TRUE, 150.00, '2024-07-03', 'House Insurance'),
(7, 1, FALSE, FALSE, 45.00, '2024-07-03', 'Watching movies'),
(13, 1, FALSE, FALSE, 95.00, '2024-07-03', 'Skin Care'),
(15, 1, TRUE, FALSE, 45.00, '2024-07-03', 'Giveaway'),
(12, 1, TRUE, FALSE, 45.00, '2024-07-03', 'Birthday Gift');