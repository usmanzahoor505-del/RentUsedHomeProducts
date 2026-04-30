-- USERS
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    phone_no VARCHAR(20),
    avg_owner_rating FLOAT DEFAULT 0,
    avg_renter_rating FLOAT DEFAULT 0
);
-- CATEGORIES
CREATE TABLE Categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(MAX)
);

-- PRODUCTS
CREATE TABLE Products (
    product_id INT IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(MAX),
    user_id INT,
    category_id INT,
    avg_rating FLOAT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
);

-- CATEGORY ATTRIBUTES
CREATE TABLE Category_Attributes (
    attribute_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    category_id INT,

    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
);


-- RENTALS
CREATE TABLE Rentals (
    rental_id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT,
    owner_id INT,
    renter_id INT,
    
    start_date DATE,
    end_date DATE,
    
    product_review VARCHAR(MAX),
    renter_review VARCHAR(MAX),
    
    product_rating FLOAT,
    owner_rating FLOAT,
    renter_rating FLOAT,
    
    status VARCHAR(50),

    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id),
    FOREIGN KEY (renter_id) REFERENCES Users(user_id)
);
-- 1. Products table mein location add karein
ALTER TABLE Products ADD location VARCHAR(255);
-- ye bi add kre
ALTER TABLE Users ADD cnic NVARCHAR(MAX);


-- 2. Categories table mein sub-categories ke liye parent_id add karein
ALTER TABLE Categories ADD parent_id INT NULL;
ALTER TABLE Categories ADD CONSTRAINT FK_Categories_Parent FOREIGN KEY (parent_id) REFERENCES Categories(category_id);

-- 3. Rentals table mein total_amount add karein
ALTER TABLE Rentals ADD total_amount DECIMAL(18,2);

ALTER TABLE Category_Attributes ADD attributes_list VARCHAR(MAX);

-- 4. Product_Images table (agar pehle se nahi hai)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Product_Images')
BEGIN
    CREATE TABLE Product_Images (
        image_id INT IDENTITY(1,1) PRIMARY KEY,
        product_id INT,
        image_url VARCHAR(MAX) NOT NULL,
        is_primary BIT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
    );
END
--phela wala drop krka ye run karo ye new table ha
CREATE TABLE Product_Attribute_Values (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT, -- Product se link karne ke liye
    category_attribute_id INT, -- Sub-category (Laptops) se link karne ke liye
    attribute_name VARCHAR(255) NOT NULL, -- Ismein 'Brand', 'RAM' wagera aayega
    value VARCHAR(MAX) NOT NULL, -- Ismein 'Apple', '16GB' wagera aayega
    
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (category_attribute_id) REFERENCES Category_Attributes(attribute_id)
);
-- 1. Clear existing data to avoid conflicts (Optional, but recommended for clean seed)
DELETE FROM Product_Attribute_Values;
DELETE FROM Category_Attributes;
DELETE FROM Categories WHERE parent_id IS NOT NULL;
DELETE FROM Categories;

-- 2. Insert Main Categories
SET IDENTITY_INSERT Categories ON;
INSERT INTO Categories (category_id, category_name, description, parent_id) VALUES 
(1, 'Electronics', 'Gadgets and devices', NULL),
(2, 'Furniture', 'Home and office furniture', NULL),
(3, 'Tools', 'Construction and repair tools', NULL),
(4, 'Kitchen', 'Kitchenware and appliances', NULL),
(5, 'Others', 'Miscellaneous items', NULL);
SET IDENTITY_INSERT Categories OFF;

-- 3. Insert Sub-Categories (linked to Main Categories)
-- Electronics Sub-Categories
INSERT INTO Categories (category_name, parent_id) VALUES 
('Laptops', 1),
('Smartphones', 1),
('Cameras', 1);

-- Furniture Sub-Categories
INSERT INTO Categories (category_name, parent_id) VALUES 
('Bed', 2),
('Sofa', 2),
('Dining Table', 2);

-- 4. Insert Individual Attributes for Sub-Categories
-- Get IDs dynamically
DECLARE @LaptopId INT = (SELECT category_id FROM Categories WHERE category_name = 'Laptops');
DECLARE @SmartphoneId INT = (SELECT category_id FROM Categories WHERE category_name = 'Smartphones');

-- Attributes for Laptops
INSERT INTO Category_Attributes (name, type, category_id) VALUES 
('Brand', 'text', @LaptopId),
('Processor', 'text', @LaptopId),
('RAM', 'text', @LaptopId),
('Storage', 'text', @LaptopId);

-- Attributes for Smartphones
INSERT INTO Category_Attributes (name, type, category_id) VALUES 
('Brand', 'text', @SmartphoneId),
('Model', 'text', @SmartphoneId),
('RAM', 'text', @SmartphoneId),
('Storage', 'text', @SmartphoneId);

-- Attributes for Bed
DECLARE @BedId INT = (SELECT category_id FROM Categories WHERE category_name = 'Bed');
INSERT INTO Category_Attributes (name, type, category_id) VALUES 
('Size', 'text', @BedId),
('Material', 'text', @BedId);

