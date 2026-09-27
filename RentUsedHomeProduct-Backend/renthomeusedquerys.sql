-- ============================================================================
-- RentUsedHomeProducts - Database Schema (Approach B: Relational Normalization)
-- ============================================================================

-- 1. USERS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        user_id INT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        phone_no VARCHAR(20),
        cnic NVARCHAR(MAX),
        avg_owner_rating FLOAT DEFAULT 0,
        avg_renter_rating FLOAT DEFAULT 0
    );
END

-- 2. CATEGORIES TABLE (Supports Root Categories and Sub-Categories)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        category_id INT IDENTITY(1,1) PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL,
        description VARCHAR(MAX),
        parent_id INT NULL,
        CONSTRAINT FK_Categories_Parent FOREIGN KEY (parent_id) REFERENCES Categories(category_id)
    );
END

-- 3. CATEGORY ATTRIBUTES TABLE (Normalized: Each row defines an attribute for a subcategory)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Category_Attributes')
BEGIN
    CREATE TABLE Category_Attributes (
        attribute_id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'text',
        attributes_list VARCHAR(MAX) NULL,
        category_id INT NOT NULL,
        CONSTRAINT FK_CategoryAttributes_Category FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
    );
END

-- 4. PRODUCTS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        product_id INT IDENTITY(1,1) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(MAX),
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        sub_category_id INT NOT NULL,
        condition INT NOT NULL,
        price_per_day DECIMAL(18,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Available',
        location VARCHAR(255),
        avg_rating FLOAT DEFAULT 0,
        CONSTRAINT FK_Products_User FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        CONSTRAINT FK_Products_Category FOREIGN KEY (category_id) REFERENCES Categories(category_id),
        CONSTRAINT FK_Products_SubCategory FOREIGN KEY (sub_category_id) REFERENCES Categories(category_id)
    );
END

-- 5. PRODUCT IMAGES TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Product_Images')
BEGIN
    CREATE TABLE Product_Images (
        image_id INT IDENTITY(1,1) PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(MAX) NOT NULL,
        is_primary BIT DEFAULT 0,
        CONSTRAINT FK_ProductImages_Product FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
    );
END

-- 6. PRODUCT ATTRIBUTE VALUES TABLE (Links individual attribute value to product)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Product_Attribute_Values')
BEGIN
    CREATE TABLE Product_Attribute_Values (
        id INT IDENTITY(1,1) PRIMARY KEY,
        product_id INT NOT NULL,
        category_attribute_id INT NOT NULL,
        attribute_name VARCHAR(255) NOT NULL,
        value VARCHAR(MAX) NOT NULL,
        CONSTRAINT FK_PAV_Product FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
        CONSTRAINT FK_PAV_CategoryAttributes FOREIGN KEY (category_attribute_id) REFERENCES Category_Attributes(attribute_id) ON DELETE CASCADE
    );
END

-- 7. RENTALS TABLE (Tracks full lifecycle, return, and ratings)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Rentals')
BEGIN
    CREATE TABLE Rentals (
        rental_id INT IDENTITY(1,1) PRIMARY KEY,
        product_id INT NOT NULL,
        owner_id INT NOT NULL,
        renter_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_amount DECIMAL(18,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        product_rating FLOAT DEFAULT 0,
        owner_rating FLOAT DEFAULT 0,
        renter_rating FLOAT DEFAULT 0,
        product_review VARCHAR(MAX),
        owner_review VARCHAR(MAX),
        renter_review VARCHAR(MAX),
        CONSTRAINT FK_Rentals_Product FOREIGN KEY (product_id) REFERENCES Products(product_id),
        CONSTRAINT FK_Rentals_Owner FOREIGN KEY (owner_id) REFERENCES Users(user_id),
        CONSTRAINT FK_Rentals_Renter FOREIGN KEY (renter_id) REFERENCES Users(user_id)
    );
END

-- 8. Wishlists Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Wishlists')
BEGIN
    CREATE TABLE Wishlists (
        wishlist_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        notify_on_available BIT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Wishlists_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
        CONSTRAINT FK_Wishlists_Products FOREIGN KEY (product_id) REFERENCES Products(product_id),
        CONSTRAINT UQ_Wishlist_User_Product UNIQUE (user_id, product_id)
    );
    CREATE INDEX IX_Wishlists_ProductId ON Wishlists(product_id);
END

-- 9. Notifications Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        notification_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NULL,
        title NVARCHAR(200) NOT NULL,
        message NVARCHAR(500) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'Availability',
        is_read BIT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
        CONSTRAINT FK_Notifications_Products FOREIGN KEY (product_id) REFERENCES Products(product_id)
    );
    CREATE INDEX IX_Notifications_UserId_IsRead ON Notifications(user_id, is_read);
END

