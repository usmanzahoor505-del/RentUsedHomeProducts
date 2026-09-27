-- ============================================================================
-- RentUsedHomeProducts - Seed Script (Approach B: Relational Normalization)
-- ============================================================================

-- STEP 1: Clean existing data (respecting foreign key hierarchy)
DELETE FROM Product_Attribute_Values;
DELETE FROM Product_Images;
DELETE FROM Rentals;
DELETE FROM Products;
DELETE FROM Category_Attributes;
DELETE FROM Categories WHERE parent_id IS NOT NULL;
DELETE FROM Categories;

-- STEP 2: Main Categories (parent_id = NULL)
INSERT INTO Categories (category_name, description, parent_id) VALUES 
('Electronics', 'Electronic gadgets and devices', NULL),
('Furniture', 'Home and office furniture', NULL),
('Tools', 'Construction and repair tools', NULL),
('Kitchen', 'Kitchenware and appliances', NULL),
('Others', 'Miscellaneous items', NULL);

-- STEP 3: Sub-Categories in Categories Table (parent_id references Main Categories)
-- Electronics Sub-Categories
DECLARE @ElecId INT = (SELECT category_id FROM Categories WHERE category_name = 'Electronics' AND parent_id IS NULL);
INSERT INTO Categories (category_name, description, parent_id) VALUES
('Laptops', 'Laptops and notebooks', @ElecId),
('Smartphones', 'Smartphones and mobile phones', @ElecId),
('Cameras', 'Digital and DSLR cameras', @ElecId),
('Tablets', 'Tablets and e-readers', @ElecId),
('Accessories', 'Electronic accessories and peripherals', @ElecId);

-- Furniture Sub-Categories
DECLARE @FurnId INT = (SELECT category_id FROM Categories WHERE category_name = 'Furniture' AND parent_id IS NULL);
INSERT INTO Categories (category_name, description, parent_id) VALUES
('Bed', 'Beds and mattresses', @FurnId),
('Sofa', 'Living room sofas and couches', @FurnId),
('Dining Table', 'Dining tables and sets', @FurnId),
('Wardrobe', 'Wardrobes and cupboards', @FurnId),
('Chair', 'Office, dining, and gaming chairs', @FurnId);

-- Tools Sub-Categories
DECLARE @ToolId INT = (SELECT category_id FROM Categories WHERE category_name = 'Tools' AND parent_id IS NULL);
INSERT INTO Categories (category_name, description, parent_id) VALUES
('Power Drills & Drivers', 'Drills and driver equipment', @ToolId),
('Cutting & Sawing Tools', 'Saws and cutting machinery', @ToolId),
('Fastening Tools', 'Nailers and fastening equipment', @ToolId),
('Sanding & Grinding Tools', 'Sanders and grinders', @ToolId),
('Hand Tool Sets', 'Complete manual tool kits', @ToolId);

-- Kitchen Sub-Categories
DECLARE @KitchId INT = (SELECT category_id FROM Categories WHERE category_name = 'Kitchen' AND parent_id IS NULL);
INSERT INTO Categories (category_name, description, parent_id) VALUES
('Cookware & Bakeware', 'Pots, pans, and baking dishes', @KitchId),
('Small Kitchen Appliances', 'Blenders, air fryers, and cooktops', @KitchId),
('Tableware & Dinnerware', 'Plates, bowls, and glassware', @KitchId),
('Kitchen Organization & Storage', 'Racks, bins, and canisters', @KitchId),
('Preparation & Culinary Tools', 'Knives, peelers, and utensils', @KitchId);

-- Others Sub-Categories
DECLARE @OthId INT = (SELECT category_id FROM Categories WHERE category_name = 'Others' AND parent_id IS NULL);
INSERT INTO Categories (category_name, description, parent_id) VALUES
('Books', 'Educational and leisure books', @OthId),
('Sports Equipment', 'Fitness and athletic equipment', @OthId),
('Musical Instruments', 'Guitars, keyboards, and drums', @OthId),
('Garden Tools', 'Lawnmowers and gardening gear', @OthId),
('Baby Items', 'Strollers, cribs, and baby carriers', @OthId);

-- STEP 4: Normalized Category Attributes (Each row is an individual attribute)
-- Laptops Attributes
DECLARE @LaptopId INT = (SELECT category_id FROM Categories WHERE category_name = 'Laptops');
INSERT INTO Category_Attributes (name, type, category_id, attributes_list) VALUES
('Brand', 'dropdown', @LaptopId, 'Apple,Dell,HP,Lenovo,Asus,Acer,MSI,Samsung,Other'),
('Processor', 'dropdown', @LaptopId, 'Intel Core i3,Intel Core i5,Intel Core i7,Intel Core i9,AMD Ryzen 5,AMD Ryzen 7,AMD Ryzen 9,Apple M1,Apple M2'),
('RAM', 'dropdown', @LaptopId, '4GB,8GB,12GB,16GB,32GB,64GB'),
('Storage', 'dropdown', @LaptopId, '128GB,256GB,512GB,1TB,2TB'),
('Screen Size', 'dropdown', @LaptopId, '11 inch,13 inch,14 inch,15.6 inch,16 inch,17 inch');

-- Smartphones Attributes
DECLARE @PhoneId INT = (SELECT category_id FROM Categories WHERE category_name = 'Smartphones');
INSERT INTO Category_Attributes (name, type, category_id, attributes_list) VALUES
('Brand', 'dropdown', @PhoneId, 'Apple,Samsung,Google,OnePlus,Xiaomi,Other'),
('Model', 'dropdown', @PhoneId, 'iPhone 14,iPhone 15,Samsung S23,Samsung S24,Pixel 8,OnePlus 12,Xiaomi 13,Other'),
('RAM', 'dropdown', @PhoneId, '4GB,6GB,8GB,12GB,16GB'),
('Storage', 'dropdown', @PhoneId, '64GB,128GB,256GB,512GB,1TB'),
('Battery', 'dropdown', @PhoneId, '3000 mAh,4000 mAh,5000 mAh,6000 mAh');

-- Bed Attributes
DECLARE @BedId INT = (SELECT category_id FROM Categories WHERE category_name = 'Bed');
INSERT INTO Category_Attributes (name, type, category_id, attributes_list) VALUES
('Size', 'dropdown', @BedId, 'Single,Double,Queen,King'),
('Material', 'dropdown', @BedId, 'Wood,Metal,Plastic,Fabric,Leather'),
('Type', 'dropdown', @BedId, 'Platform,Storage Bed,Bunk Bed,Canopy,Folding'),
('Color', 'dropdown', @BedId, 'Brown,White,Black,Grey,Beige'),
('Condition', 'dropdown', @BedId, 'Brand New,Like New,Good,Fair');

-- Sofa Attributes
DECLARE @SofaId INT = (SELECT category_id FROM Categories WHERE category_name = 'Sofa');
INSERT INTO Category_Attributes (name, type, category_id, attributes_list) VALUES
('Seating Capacity', 'dropdown', @SofaId, '1 Person,2 Persons,3 Persons,4 Persons,6 Persons,8+ Persons'),
('Material', 'dropdown', @SofaId, 'Wood,Fabric,Leather,Velvet,Foam'),
('Type', 'dropdown', @SofaId, 'Standard,L-Shape,Recliner,Sofa Bed,Sectional,Wooden'),
('Color', 'dropdown', @SofaId, 'Brown,Grey,Blue,Black,Beige,Red'),
('Condition', 'dropdown', @SofaId, 'Brand New,Like New,Good,Fair');

-- 4. Sample Wishlists & Notifications Seed
IF EXISTS (SELECT 1 FROM Users) AND EXISTS (SELECT 1 FROM Products)
BEGIN
    DECLARE @SampleUser INT = (SELECT TOP 1 user_id FROM Users ORDER BY user_id);
    DECLARE @SampleProduct INT = (SELECT TOP 1 product_id FROM Products ORDER BY product_id);

    IF NOT EXISTS (SELECT 1 FROM Wishlists WHERE user_id = @SampleUser AND product_id = @SampleProduct)
    BEGIN
        INSERT INTO Wishlists (user_id, product_id, notify_on_available)
        VALUES (@SampleUser, @SampleProduct, 1);
    END

    IF NOT EXISTS (SELECT 1 FROM Notifications WHERE user_id = @SampleUser)
    BEGIN
        INSERT INTO Notifications (user_id, product_id, title, message, type, is_read)
        VALUES (@SampleUser, @SampleProduct, 'Welcome to RentUsed!', 'Explore items or add them to your wishlist to get notified when available.', 'System', 0);
    END
END

-- STEP 5: Seed 3 Rawalpindi Accounts (Usman, Suleman, Shehryar) and 5 Pakistani Home Used Products
IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'usman@rentused.pk')
BEGIN
    INSERT INTO Users (username, email, Password, phone_no, city, cnic, role, is_online)
    VALUES ('Usman Zahoor', 'usman@rentused.pk', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0300-5551234', 'Rawalpindi', '37405-1234567-1', 'Customer', 0);
END

IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'suleman@rentused.pk')
BEGIN
    INSERT INTO Users (username, email, Password, phone_no, city, cnic, role, is_online)
    VALUES ('Suleman Khan', 'suleman@rentused.pk', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0312-9876543', 'Rawalpindi', '37405-7654321-2', 'Customer', 0);
END

IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'shehryar@rentused.pk')
BEGIN
    INSERT INTO Users (username, email, Password, phone_no, city, cnic, role, vehicle_type, vehicle_plate, is_online, current_latitude, current_longitude, last_location_updated)
    VALUES ('Shehryar Ali', 'shehryar@rentused.pk', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0333-8889900', 'Rawalpindi', '37405-9988776-3', 'Courier', 'Motorcycle', 'RWP-7788', 1, 33.5973, 73.0479, GETDATE());
END


