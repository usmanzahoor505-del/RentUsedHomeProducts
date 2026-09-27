-- ============================================================
-- Seed 5 Home-Used Pakistani Products for Usman (user_id = 21)
-- Renter: Suleman Khan (user_id = 22)
-- Courier: Shehryar Ali (user_id = 23)
-- ============================================================

USE [RentUsedHomeProducts];
GO

-- 1. Ensure Usman exists (user_id = 21)
-- 2. Insert 5 Products in Rawalpindi
DECLARE @UsmanId INT = 21;
DECLARE @SulemanId INT = 22;
DECLARE @ShehryarId INT = 23;

-- Product 1: Microwave
DECLARE @P1_Id INT;
INSERT INTO [Products] (
    [title], [description], [user_id], [category_id], [sub_category_id], 
    [avg_rating], [price_per_day], [status], [condition], [location], 
    [latitude], [longitude], [radius_km]
) VALUES (
    'Kenwood Inverter Microwave Oven 30L (Clean Home Used)',
    'Lightly used Kenwood 30L digital inverter microwave oven with grill and baking mode. Clean family use in Saddar, Rawalpindi. Perfect for events, temporary stay, or Ramadan gatherings.',
    @UsmanId, 94, 112, 4.8, 450.00, 'Available', 9, 'Rawalpindi',
    33.5950, 73.0540, 5.0
);
SET @P1_Id = SCOPE_IDENTITY();

INSERT INTO [Product_Images] ([product_id], [image_url], [is_primary])
VALUES (@P1_Id, '/uploads/products/microwave_oven.jpg', 1);

-- Product 2: Sheesham Sofa
DECLARE @P2_Id INT;
INSERT INTO [Products] (
    [title], [description], [user_id], [category_id], [sub_category_id], 
    [avg_rating], [price_per_day], [status], [condition], [location], 
    [latitude], [longitude], [radius_km]
) VALUES (
    'Chinyoti Hand-Carved Sheesham Wooden Sofa (3-Seater)',
    'Authentic Pakistani Chinyoti hand-carved pure Sheesham wood 3-seater sofa with traditional velvet floral cushions. Ideal for weddings, family photo sessions, or Eid guest hosting in Rawalpindi.',
    @UsmanId, 92, 102, 4.8, 1200.00, 'Available', 9, 'Rawalpindi',
    33.5350, 73.1120, 7.0
);
SET @P2_Id = SCOPE_IDENTITY();

INSERT INTO [Product_Images] ([product_id], [image_url], [is_primary])
VALUES (@P2_Id, '/uploads/products/wooden_sofa.jpg', 1);

-- Product 3: Refrigerator
DECLARE @P3_Id INT;
INSERT INTO [Products] (
    [title], [description], [user_id], [category_id], [sub_category_id], 
    [avg_rating], [price_per_day], [status], [condition], [location], 
    [latitude], [longitude], [radius_km]
) VALUES (
    'Dawlance Double Door Refrigerator 400L (Frost Free)',
    'Reliable Dawlance 400-liter deep cooling refrigerator. Reliable copper condenser, low power consumption on UPS/generator. Great for temporary hostel students, wedding catering, or summer overflow in Rawalpindi.',
    @UsmanId, 94, 112, 4.5, 850.00, 'Available', 8, 'Rawalpindi',
    33.6300, 73.0700, 6.0
);
SET @P3_Id = SCOPE_IDENTITY();

INSERT INTO [Product_Images] ([product_id], [image_url], [is_primary])
VALUES (@P3_Id, '/uploads/products/refrigerator.jpg', 1);

-- Product 4: Hammer Drill
DECLARE @P4_Id INT;
INSERT INTO [Products] (
    [title], [description], [user_id], [category_id], [sub_category_id], 
    [avg_rating], [price_per_day], [status], [condition], [location], 
    [latitude], [longitude], [radius_km]
) VALUES (
    'Total Tools Heavy Duty Electric Rotary Hammer Drill Kit',
    '800W Total Tools heavy-duty SDS impact drill machine complete with concrete drill bits, chisels, and safety carrying case. Perfect for home renovation, curtain rod installation, wall hanging, and plumbing DIY jobs.',
    @UsmanId, 93, 106, 5.0, 500.00, 'Available', 10, 'Rawalpindi',
    33.6080, 73.0180, 5.0
);
SET @P4_Id = SCOPE_IDENTITY();

INSERT INTO [Product_Images] ([product_id], [image_url], [is_primary])
VALUES (@P4_Id, '/uploads/products/hammer_drill.jpg', 1);

-- Product 5: Pedestal Fan
DECLARE @P5_Id INT;
INSERT INTO [Products] (
    [title], [description], [user_id], [category_id], [sub_category_id], 
    [avg_rating], [price_per_day], [status], [condition], [location], 
    [latitude], [longitude], [radius_km]
) VALUES (
    'GFC Energy Saver Copper Deluxe Pedestal Fan (24-inch)',
    'Original Pakistani GFC 24-inch high-speed heavy pedestal fan with pure 99.9% copper winding. Delivers massive air throw for Pakistani summer lawns, rooftop gatherings, and family BBQs.',
    @UsmanId, 95, 119, 4.8, 300.00, 'Available', 9, 'Rawalpindi',
    33.6020, 73.0300, 4.0
);
SET @P5_Id = SCOPE_IDENTITY();

INSERT INTO [Product_Images] ([product_id], [image_url], [is_primary])
VALUES (@P5_Id, '/uploads/products/pedestal_fan.jpg', 1);

-- ============================================================
-- Insert Completed Rentals with Ratings & Reviews by Suleman
-- ============================================================

-- Rental 1: Microwave Oven
INSERT INTO [Rentals] (
    [product_id], [owner_id], [renter_id], [start_date], [end_date],
    [product_review], [product_rating], [owner_review], [owner_rating],
    [renter_review], [renter_rating], [status], [total_amount],
    [delivery_option], [delivery_fee]
) VALUES (
    @P1_Id, @UsmanId, @SulemanId, '2026-09-10', '2026-09-13',
    'Very clean home used microwave. Heating and grill work 100%. Highly recommended for family events in Rawalpindi!', 4.8,
    'Suleman bhai is a very responsible renter. Clean handover on time.', 5.0,
    'Great experience, will rent again.', 5.0,
    'Completed', 1350.00, 'CourierDelivery', 250.00
);

-- Rental 2: Sheesham Sofa (Review 1 by Suleman)
INSERT INTO [Rentals] (
    [product_id], [owner_id], [renter_id], [start_date], [end_date],
    [product_review], [product_rating], [owner_review], [owner_rating],
    [renter_review], [renter_rating], [status], [total_amount],
    [delivery_option], [delivery_fee]
) VALUES (
    @P2_Id, @UsmanId, @SulemanId, '2026-09-14', '2026-09-16',
    'Authentic Chinyoti carved wood! Looked stunning for our family event. Super comfortable velvet cushions.', 5.0,
    'Pleasure dealing with Suleman. Highly recommended renter.', 5.0,
    'Usman bhai arranged smooth doorstep delivery.', 5.0,
    'Completed', 2400.00, 'CourierDelivery', 250.00
);

-- Rental 2: Sheesham Sofa (Review 2 by User 8 Hamna)
INSERT INTO [Rentals] (
    [product_id], [owner_id], [renter_id], [start_date], [end_date],
    [product_review], [product_rating], [owner_review], [owner_rating],
    [renter_review], [renter_rating], [status], [total_amount],
    [delivery_option], [delivery_fee]
) VALUES (
    @P2_Id, @UsmanId, 8, '2026-09-18', '2026-09-20',
    'Very elegant traditional sofa design. Usman bhai is very cooperative.', 4.5,
    'Careful and polite renter.', 5.0,
    'Cooperative owner.', 5.0,
    'Completed', 2400.00, 'SelfPickup', 0.00
);

-- Rental 3: Refrigerator
INSERT INTO [Rentals] (
    [product_id], [owner_id], [renter_id], [start_date], [end_date],
    [product_review], [product_rating], [owner_review], [owner_rating],
    [renter_review], [renter_rating], [status], [total_amount],
    [delivery_option], [delivery_fee]
) VALUES (
    @P3_Id, @UsmanId, @SulemanId, '2026-09-15', '2026-09-18',
    'Cooling is top notch! Low power consumption on UPS. Spotless freezer and odorless interior.', 4.5,
    'Punctual and kept the fridge very clean.', 5.0,
    'Smooth process.', 5.0,
    'Completed', 2550.00, 'CourierDelivery', 250.00
);

-- Rental 4: Hammer Drill
INSERT INTO [Rentals] (
    [product_id], [owner_id], [renter_id], [start_date], [end_date],
    [product_review], [product_rating], [owner_review], [owner_rating],
    [renter_review], [renter_rating], [status], [total_amount],
    [delivery_option], [delivery_fee]
) VALUES (
    @P4_Id, @UsmanId, @SulemanId, '2026-09-20', '2026-09-21',
    'Complete toolkit with heavy-duty masonry bits. Bore through concrete walls like butter! Saved thousands in labor.', 5.0,
    'Returned all drill bits in original case.', 5.0,
    'Perfect tools.', 5.0,
    'Completed', 500.00, 'SelfPickup', 0.00
);

-- Rental 5: Pedestal Fan
INSERT INTO [Rentals] (
    [product_id], [owner_id], [renter_id], [start_date], [end_date],
    [product_review], [product_rating], [owner_review], [owner_rating],
    [renter_review], [renter_rating], [status], [total_amount],
    [delivery_option], [delivery_fee]
) VALUES (
    @P5_Id, @UsmanId, @SulemanId, '2026-09-22', '2026-09-24',
    'Powerful pure copper motor airflow. Kept our outdoor terrace cool throughout the night. Very quiet operation.', 4.8,
    'Great renter, returned in pristine shape.', 5.0,
    'Excellent fan.', 5.0,
    'Completed', 600.00, 'CourierDelivery', 250.00
);

PRINT 'Successfully seeded 5 Pakistani Home Used Products with Ratings & Reviews for Usman!';
GO
