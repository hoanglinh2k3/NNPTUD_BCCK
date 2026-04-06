USE DecorShopDB;
GO

INSERT INTO Category (Name, Slug, Description, ParentId)
VALUES
(N'Decor Lamps', N'decor-lamps', N'Warm ambient lamps and bedside pieces', NULL),
(N'Wall Art', N'wall-art', N'Canvas, framed prints, and sculptural wall decor', NULL),
(N'Vases', N'vases', N'Ceramic and glass accents for shelving and tabletops', NULL);
GO

INSERT INTO Product (
    CategoryId,
    Name,
    Slug,
    Description,
    Price,
    DiscountPrice,
    SKU,
    Material,
    Color,
    Size,
    CollectionName,
    Status
)
VALUES
(1, N'Nordic Bedside Lamp', N'nordic-bedside-lamp', N'Soft terracotta bedside lamp with warm oak finish', 450000, 390000, N'DECOR-001', N'Wood', N'Clay Brown', N'32x18 cm', N'Nordic Calm', N'ACTIVE'),
(2, N'Quiet Landscape Canvas', N'quiet-landscape-canvas', N'Large framed neutral canvas for living room walls', 680000, NULL, N'DECOR-002', N'Canvas', N'Beige', N'60x90 cm', N'Soft Gallery', N'ACTIVE'),
(3, N'Stone Ceramic Vase', N'stone-ceramic-vase', N'Matte ceramic vase for shelf styling and dining tables', 290000, 249000, N'DECOR-003', N'Ceramic', N'Sand', N'24 cm', N'Earth Form', N'ACTIVE');
GO

INSERT INTO Inventory (ProductId, Quantity, ReservedQuantity, SoldQuantity)
VALUES
(1, 25, 0, 0),
(2, 18, 0, 0),
(3, 40, 0, 0);
GO
