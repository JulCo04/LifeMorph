DROP TABLE IF EXISTS FinIncomeTable;
DROP TABLE IF EXISTS FinVariableExpensesTable;
DROP TABLE IF EXISTS FinFixedExpensesTable;
DROP TABLE IF EXISTS FinRows;
DROP TABLE IF EXISTS FinSums;
DROP TABLE IF EXISTS FinCategories;

CREATE TABLE IF NOT EXISTS FinCategories (
    categoryId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    term BOOL,
    total DECIMAL(10,2) DEFAULT 0.00,
    budgetTotal DECIMAL(10,2) DEFAULT 0.00,
    userId INT,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS FinSums (
	sumId INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE,
    total DECIMAL(10,2) DEFAULT 0.00,
    userId INT,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS FinRows (
	rowId INT AUTO_INCREMENT PRIMARY KEY,
    categoryId INT,
    userId INT,
    name varchar(255),
    flow BOOL,
    term BOOL,
    total DECIMAL(10,2) DEFAULT 0.00,
    date DATE,
    currentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES FinCategories(categoryId),
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS FinIncomeTable (
    userId INT,
    categoryName VARCHAR(255),
    budgetExpense DECIMAL(10,2) DEFAULT 0.00,
    actualExpense DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS FinFixedExpensesTable (
	userId INT,
    categoryId INT,
    categoryName VARCHAR(255),
    budgetExpense DECIMAL(10,2) DEFAULT 0.00,
    actualExpense DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (categoryId) REFERENCES FinCategories(categoryId),
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS FinVariableExpensesTable (
	userId INT,
    categoryId INT,
    categoryName VARCHAR(255),
    budgetExpense DECIMAL(10,2) DEFAULT 0.00,
    actualExpense DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (categoryId) REFERENCES FinCategories(categoryId),
    FOREIGN KEY (userId) REFERENCES users(id)
);

DROP TRIGGER IF EXISTS update_category_total_on_insert;
DROP TRIGGER IF EXISTS update_category_total_on_delete;
DROP TRIGGER IF EXISTS update_finsums_total_on_insert;
DROP TRIGGER IF EXISTS update_finsums_total_on_delete;

DROP TRIGGER IF EXISTS update_budget_tables_on_category_insert;
DROP TRIGGER IF EXISTS update_budget_tables_on_row_insert;
DROP TRIGGER IF EXISTS update_budget_tables_on_row_delete;
DROP TRIGGER IF EXISTS update_budget_tables_on_row_update;
-- DROP TRIGGER IF EXISTS update_income_table_on_flow_update

DELIMITER //
CREATE TRIGGER update_budget_tables_on_row_insert
AFTER INSERT ON FinRows
FOR EACH ROW
BEGIN
    -- Update  --
	-- If fixed expense cost -- 
    IF NEW.flow = 0 and NEW.term = 1 THEN
        UPDATE FinFixedExpensesTable
        SET actualExpense = actualExpense + NEW.total
        WHERE userId = NEW.userId AND categoryId = NEW.categoryId;
	-- If variable expense cost -- 
	ELSEIF NEW.flow = 0 and NEW.term = 0 THEN
		UPDATE FinVariableExpensesTable
		SET actualExpense = actualExpense + NEW.total
		WHERE userId = NEW.userId AND categoryId = NEW.categoryId;
    END IF;
    
    -- Update income table based on the category
    IF NEW.flow = 1 THEN
        -- Check if the category is "Wage"
        IF (SELECT name FROM FinCategories WHERE categoryId = NEW.categoryId) = 'Wage' THEN
            UPDATE FinIncomeTable
            SET actualExpense = actualExpense + NEW.total
            WHERE userId = NEW.userId AND categoryName = 'Wage';
        ELSE
            UPDATE FinIncomeTable
            SET actualExpense = actualExpense + NEW.total
            WHERE userId = NEW.userId AND categoryName = 'Other Income';
        END IF;
    END IF;
    
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_budget_tables_on_row_delete
AFTER DELETE ON FinRows
FOR EACH ROW
BEGIN
    -- Update  --
	-- If expense and fixed cost -- 
    IF OLD.flow = 0 and OLD.term = 1 THEN
        UPDATE FinFixedExpensesTable
        SET actualExpense = actualExpense - OLD.total
        WHERE userId = OLD.userId AND categoryId = OLD.categoryId;
	-- If variable expense cost -- 
	ELSEIF OLD.flow = 0 and OLD.term = 0 THEN
		UPDATE FinVariableExpensesTable
		SET actualExpense = actualExpense - OLD.total
		WHERE userId = OLD.userId AND categoryId = OLD.categoryId;
    END IF;
    
    -- Update income table based on the category
    IF OLD.flow = 1 THEN
        -- Check if the category is "Wage"
        IF (SELECT name FROM FinCategories WHERE categoryId = OLD.categoryId) = 'Wage' THEN
            UPDATE FinIncomeTable
            SET actualExpense = actualExpense - OLD.total
            WHERE userId = OLD.userId AND categoryName = 'Wage';
        ELSE
            UPDATE FinIncomeTable
            SET actualExpense = actualExpense - OLD.total
            WHERE userId = OLD.userId AND categoryName = 'Other Income';
        END IF;
    END IF;
    
END //
DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER update_income_table_on_flow_update
-- AFTER UPDATE ON FinRows
-- FOR EACH ROW
-- BEGIN
-- 	
--     IF OLD.flow = NEW.flow THEN
-- 		IF (SELECT name FROM FinCategories WHERE categoryId = OLD.categoryId) = 'Wage' THEN
--             UPDATE FinIncomeTable
--             SET actualExpense = actualExpense - OLD.total + NEW.total
--             WHERE userId = OLD.userId AND categoryName = 'Wage';
--         ELSE
--             UPDATE FinIncomeTable
--             SET actualExpense = actualExpense - OLD.total + NEW.total
--             WHERE userId = OLD.userId AND categoryName = 'Other Income';
--         END IF;
--     -- ELSE IF OLD.flow != NEW.flow THEN
--   
-- END
-- DELIMITER ;

DELIMITER //
CREATE TRIGGER update_budget_tables_on_row_update
AFTER UPDATE ON FinRows
FOR EACH ROW
BEGIN
	-- Get old and new category names
    DECLARE oldCategoryName VARCHAR(255);
    DECLARE newCategoryName VARCHAR(255);
    SET oldCategoryName = (SELECT name FROM FinCategories WHERE categoryId = OLD.categoryId);
    SET newCategoryName = (SELECT name FROM FinCategories WHERE categoryId = NEW.categoryId);
    
    -- Handle removal from old tables
    IF OLD.flow = TRUE THEN
        -- Old flow was income
        IF oldCategoryName = 'Wage' THEN
            UPDATE FinIncomeTable SET actualExpense = actualExpense - OLD.total
            WHERE userId = OLD.userId AND categoryName = 'Wage';
        ELSE
            UPDATE FinIncomeTable SET actualExpense = actualExpense - OLD.total
            WHERE userId = OLD.userId AND categoryName = 'Other Income';
        END IF;
    ELSE
        -- Old flow was expense
        IF OLD.term = FALSE THEN
            UPDATE FinVariableExpensesTable SET actualExpense = actualExpense - OLD.total
            WHERE userId = OLD.userId AND categoryId = OLD.categoryId;
        ELSE
            UPDATE FinFixedExpensesTable SET actualExpense = actualExpense - OLD.total
            WHERE userId = OLD.userId AND categoryId = OLD.categoryId;
        END IF;
    END IF;

    -- Handle addition to new tables
    IF NEW.flow = TRUE THEN
        -- New flow is income
        IF newCategoryName = 'Wage' THEN
            UPDATE FinIncomeTable SET actualExpense = actualExpense + NEW.total
            WHERE userId = NEW.userId AND categoryName = 'Wage';
        ELSE
            UPDATE FinIncomeTable SET actualExpense = actualExpense + NEW.total
            WHERE userId = NEW.userId AND categoryName = 'Other Income';
        END IF;
    ELSE
        -- New flow is expense
        IF NEW.term = FALSE THEN
            UPDATE FinVariableExpensesTable SET actualExpense = actualExpense + NEW.total
            WHERE userId = NEW.userId AND categoryId = NEW.categoryId;
        ELSE
            UPDATE FinFixedExpensesTable SET actualExpense = actualExpense + NEW.total
            WHERE userId = NEW.userId AND categoryId = NEW.categoryId;
        END IF;
    END IF;

END //
DELIMITER ;



DELIMITER //
CREATE TRIGGER update_budget_tables_on_category_insert
AFTER INSERT ON FinCategories
FOR EACH ROW
BEGIN
    -- Handle term = 1 (Income) and category name is not 'Wage'
    IF NEW.term = 1 AND NEW.name != 'Wage' THEN
        -- Check if the category already exists in the FinFixedExpensesTable
        IF EXISTS (SELECT * FROM FinFixedExpensesTable WHERE categoryId = NEW.categoryId AND userId = NEW.userId) THEN
            -- If it exists, update the actualExpense, budgetExpense, and categoryName
            UPDATE FinFixedExpensesTable
            SET categoryName = NEW.name,
                actualExpense = actualExpense + NEW.total
            WHERE categoryId = NEW.categoryId AND userId = NEW.userId;
        ELSE
            -- If it doesn't exist, insert a new row in the FinFixedExpensesTable
            INSERT INTO FinFixedExpensesTable (categoryId, userId, categoryName, budgetExpense, actualExpense)
            VALUES (NEW.categoryId, NEW.userId, NEW.name, NEW.budgetTotal, NEW.total);
        END IF;

    -- Handle term = 0 (Expense)
    ELSEIF NEW.term = 0 THEN
        -- Check if the category already exists in the FinVariableExpensesTable
        IF EXISTS (SELECT * FROM FinVariableExpensesTable WHERE categoryId = NEW.categoryId AND userId = NEW.userId) THEN
            -- If it exists, update the actualExpense, budgetExpense, and categoryName
            UPDATE FinVariableExpensesTable
            SET categoryName = NEW.name,
                actualExpense = actualExpense + NEW.total
            WHERE categoryId = NEW.categoryId AND userId = NEW.userId;
        ELSE
            -- If it doesn't exist, insert a new row in the FinVariableExpensesTable
            INSERT INTO FinVariableExpensesTable (categoryId, userId, categoryName, budgetExpense, actualExpense)
            VALUES (NEW.categoryId, NEW.userId, NEW.name, NEW.budgetTotal, NEW.total);
        END IF;
    END IF;
END //
DELIMITER ;

-- Update Category Total on Row Insert --
DELIMITER //
CREATE TRIGGER update_category_total_on_insert
AFTER INSERT ON FinRows
FOR EACH ROW
	BEGIN
		UPDATE FinCategories
		SET total = total + NEW.total
		WHERE categoryId = NEW.categoryId;
	END //
DELIMITER ;

-- Update Category Total on Row Deletion --
DELIMITER //
CREATE TRIGGER update_category_total_on_delete
AFTER DELETE ON FinRows
FOR EACH ROW
BEGIN
    UPDATE FinCategories
    SET total = total - OLD.total
    WHERE categoryId = OLD.categoryId;
END //
DELIMITER ;

-- Update Category Total on Row Update --
DELIMITER //
CREATE TRIGGER update_category_total_on_update
AFTER UPDATE ON FinRows
FOR EACH ROW
BEGIN
    -- If the category has changed
    IF OLD.categoryId != NEW.categoryId THEN
        -- Subtract the old total from the old category
        UPDATE FinCategories
        SET total = total - OLD.total
        WHERE categoryId = OLD.categoryId;

        -- Add the new total to the new category
        UPDATE FinCategories
        SET total = total + NEW.total
        WHERE categoryId = NEW.categoryId;
    ELSE
        -- If the category hasn't changed, just update the total
        UPDATE FinCategories
        SET total = total - OLD.total + NEW.total
        WHERE categoryId = NEW.categoryId;
        
    END IF;
END //
DELIMITER ;

-- Update FinSums Total on Row Insert --
DELIMITER //
CREATE TRIGGER update_finsums_total_on_insert
AFTER INSERT ON FinRows
FOR EACH ROW
BEGIN
    -- Check if the flow is true (income) or false (expense)
    IF NEW.flow = TRUE THEN
        -- Update the total for 'Income'
        UPDATE FinSums
        SET total = total + NEW.total
        WHERE name = 'Income' AND userId = NEW.userId;
    ELSE
        -- Update the total for 'Expense'
        UPDATE FinSums
        SET total = total + NEW.total
        WHERE name = 'Expense' AND userId = NEW.userId;
    END IF;

    -- Check if the term is true (fixed) or false (variable)
    IF NEW.term = TRUE THEN
        -- Update the total for 'Fixed'
        UPDATE FinSums
        SET total = total + NEW.total
        WHERE name = 'Fixed' AND userId = NEW.userId;
    ELSE
        -- Update the total for 'Variable'
        UPDATE FinSums
        SET total = total + NEW.total
        WHERE name = 'Variable' AND userId = NEW.userId;
    END IF;
    
    UPDATE FinSums
    SET total = total + NEW.total
    WHERE name = 'UserTotal' AND userId = NEW.userId;
        
END //
DELIMITER ;

DELIMITER //

-- Update FinSums Total on Row Deletion --
CREATE TRIGGER update_finsums_total_on_delete
AFTER DELETE ON FinRows
FOR EACH ROW
BEGIN
    -- Check if the flow was true (income) or false (expense)
    IF OLD.flow = TRUE THEN
        -- Update the total for 'Income'
        UPDATE FinSums
        SET total = total - OLD.total
        WHERE name = 'Income' AND userId = OLD.userId;
    ELSE
        -- Update the total for 'Expense'
        UPDATE FinSums
        SET total = total - OLD.total
        WHERE name = 'Expense' AND userId = OLD.userId;
    END IF;

    -- Check if the term was true (fixed) or false (variable)
    IF OLD.term = TRUE THEN
        -- Update the total for 'Fixed'
        UPDATE FinSums
        SET total = total - OLD.total
        WHERE name = 'Fixed' AND userId = OLD.userId;
    ELSE
        -- Update the total for 'Variable'
        UPDATE FinSums
        SET total = total - OLD.total
        WHERE name = 'Variable' AND userId = OLD.userId;
     
    END IF;
    
    UPDATE FinSums
	SET total = total - OLD.total
	WHERE name = 'UserTotal' AND userId = OLD.userId;   
    
END //

DELIMITER ;

-- Update FinSums Total on Row Update --
DELIMITER //

CREATE TRIGGER update_finsums_total_on_update
AFTER UPDATE ON FinRows
FOR EACH ROW
BEGIN
    -- Update the total for the old value of 'flow'
    IF OLD.flow = TRUE THEN
        -- Subtract from 'Income'
        UPDATE FinSums
        SET total = total - OLD.total
        WHERE name = 'Income' AND userId = OLD.userId;
    ELSE
        -- Subtract from 'Expense'
        UPDATE FinSums
        SET total = total - OLD.total
        WHERE name = 'Expense' AND userId = OLD.userId;
    END IF;

    -- Update the total for the new value of 'flow'
    IF NEW.flow = TRUE THEN
        -- Add to 'Income'
        UPDATE FinSums
        SET total = total + NEW.total
        WHERE name = 'Income' AND userId = NEW.userId;
    ELSE
        -- Add to 'Expense'
        UPDATE FinSums
        SET total = total + NEW.total
        WHERE name = 'Expense' AND userId = NEW.userId;
    END IF;

    -- Update the total for the old value of 'term'
    IF OLD.term = TRUE THEN
        -- Subtract from 'Fixed'
        UPDATE FinSums
        SET total = total - OLD.total
        WHERE name = 'Fixed' AND userId = OLD.userId;
    ELSE
        -- Subtract from 'Variable'
        UPDATE FinSums
        SET total = total - OLD.total
        WHERE name = 'Variable' AND userId = OLD.userId;
    END IF;

    -- Update the total for the new value of 'term'
    IF NEW.term = TRUE THEN
        -- Add to 'Fixed'
        UPDATE FinSums
        SET total = total + NEW.total
        WHERE name = 'Fixed' AND userId = NEW.userId;
    ELSE
        -- Add to 'Variable'
        UPDATE FinSums
        SET total = total + NEW.total
        WHERE name = 'Variable' AND userId = NEW.userId;
    END IF;
    
    UPDATE FinSums
	SET total = total - OLD.total + NEW.total
	WHERE name = 'UserTotal' AND userId = NEW.userId;
    
END //

DELIMITER ;

