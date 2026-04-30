-- ================================================
-- STEP 1: Purana data saaf karein
-- ================================================
DELETE FROM Product_Attribute_Values;
DELETE FROM Category_Attributes;
DELETE FROM Categories;

-- ================================================
-- STEP 2: Main Categories (5)
-- ================================================
INSERT INTO Categories (category_name, description) VALUES ('Electronics', 'Electronic gadgets and devices');
INSERT INTO Categories (category_name, description) VALUES ('Furniture', 'Home and office furniture');
INSERT INTO Categories (category_name, description) VALUES ('Tools', 'Construction and repair tools');
INSERT INTO Categories (category_name, description) VALUES ('Kitchen', 'Kitchenware and appliances');
INSERT INTO Categories (category_name, description) VALUES ('Others', 'Miscellaneous items');

-- ================================================
-- STEP 3: Sub-Categories (Category_Attributes table)
-- Har category ki 5 sub-categories
-- attributes_list mein us sub-category ke specific attributes hain
-- ================================================

-- ----- ELECTRONICS (5 Sub-Categories) -----
INSERT INTO Category_Attributes (name, category_id, attributes_list) VALUES
('Laptops',      (SELECT category_id FROM Categories WHERE category_name = 'Electronics'), 'Brand,Processor,RAM,Storage,Screen Size'),
('Smartphones',  (SELECT category_id FROM Categories WHERE category_name = 'Electronics'), 'Brand,Model,RAM,Storage,Battery'),
('Cameras',      (SELECT category_id FROM Categories WHERE category_name = 'Electronics'), 'Brand,Type,Megapixels,Storage Type,Lens'),
('Tablets',      (SELECT category_id FROM Categories WHERE category_name = 'Electronics'), 'Brand,RAM,Storage,Screen Size,Connectivity'),
('Accessories',  (SELECT category_id FROM Categories WHERE category_name = 'Electronics'), 'Type,Brand,Compatibility,Color,Condition');

-- ----- FURNITURE (5 Sub-Categories) -----
INSERT INTO Category_Attributes (name, category_id, attributes_list) VALUES
('Bed',          (SELECT category_id FROM Categories WHERE category_name = 'Furniture'), 'Size,Material,Type,Color,Condition'),
('Sofa',         (SELECT category_id FROM Categories WHERE category_name = 'Furniture'), 'Seating Capacity,Material,Type,Color,Condition'),
('Dining Table', (SELECT category_id FROM Categories WHERE category_name = 'Furniture'), 'Seating Capacity,Material,Shape,Color,Condition'),
('Wardrobe',     (SELECT category_id FROM Categories WHERE category_name = 'Furniture'), 'Doors,Material,Size,Color,Condition'),
('Chair',        (SELECT category_id FROM Categories WHERE category_name = 'Furniture'), 'Type,Material,Color,Adjustable,Condition');

-- ----- TOOLS (5 Sub-Categories) -----
INSERT INTO Category_Attributes (name, category_id, attributes_list) VALUES
('Power Drills & Drivers',    (SELECT category_id FROM Categories WHERE category_name = 'Tools'), 'Drill Type,Voltage,Chuck Size,Maximum RPM,Motor Type'),
('Cutting & Sawing Tools',    (SELECT category_id FROM Categories WHERE category_name = 'Tools'), 'Saw Type,Blade Diameter,Maximum Cut Depth,Bevel Capacity,Amperage'),
('Fastening Tools',           (SELECT category_id FROM Categories WHERE category_name = 'Tools'), 'Tool Type,Fastener Size,Drive Size,Maximum Torque,Magazine Capacity'),
('Sanding & Grinding Tools',  (SELECT category_id FROM Categories WHERE category_name = 'Tools'), 'Sander Type,Pad/Belt Size,Orbit Diameter,Speed,Dust Extraction Port'),
('Hand Tool Sets',            (SELECT category_id FROM Categories WHERE category_name = 'Tools'), 'Set Type,Drive System,Material,Piece Count,Case Type');

-- ----- KITCHEN (5 Sub-Categories) -----
INSERT INTO Category_Attributes (name, category_id, attributes_list) VALUES
('Cookware & Bakeware',           (SELECT category_id FROM Categories WHERE category_name = 'Kitchen'), 'Material,Heat Source Compatibility,Capacity/Size,Coating Type,Specialty Function'),
('Small Kitchen Appliances',      (SELECT category_id FROM Categories WHERE category_name = 'Kitchen'), 'Appliance Type,Connectivity,Sustainability Rating,Form Factor,Finishes/Colors'),
('Tableware & Dinnerware',        (SELECT category_id FROM Categories WHERE category_name = 'Kitchen'), 'Item Type,Style,Material,Color Palette,Durability'),
('Kitchen Organization & Storage',(SELECT category_id FROM Categories WHERE category_name = 'Kitchen'), 'Storage Location,Container Type,Specialized Use,Material,Feature'),
('Preparation & Culinary Tools',  (SELECT category_id FROM Categories WHERE category_name = 'Kitchen'), 'Tool Type,Material,Ergonomics,Functional Need,Aesthetic Style');

-- ----- OTHERS (5 Sub-Categories) -----
INSERT INTO Category_Attributes (name, category_id, attributes_list) VALUES
('Books',               (SELECT category_id FROM Categories WHERE category_name = 'Others'), 'Subject,Language,Condition,Author Type,Edition'),
('Sports Equipment',    (SELECT category_id FROM Categories WHERE category_name = 'Others'), 'Sport Type,Brand,Size,Material,Condition'),
('Musical Instruments', (SELECT category_id FROM Categories WHERE category_name = 'Others'), 'Instrument,Brand,Type,Material,Condition'),
('Garden Tools',        (SELECT category_id FROM Categories WHERE category_name = 'Others'), 'Tool Type,Brand,Material,Size,Condition'),
('Baby Items',          (SELECT category_id FROM Categories WHERE category_name = 'Others'), 'Item Type,Brand,Age Group,Color,Condition');

-- ================================================
-- Verify karein
-- ================================================
SELECT 
    c.category_name AS 'Main Category',
    ca.name AS 'Sub Category',
    ca.attributes_list AS 'Attributes'
FROM Category_Attributes ca
JOIN Categories c ON ca.category_id = c.category_id
ORDER BY c.category_name, ca.name;
