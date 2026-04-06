USE DecorShopDB;
GO

CREATE INDEX IX_Product_CategoryId ON Product(CategoryId);
CREATE INDEX IX_Product_Name ON Product(Name);
CREATE INDEX IX_Order_UserId ON [Order](UserId);
CREATE INDEX IX_Order_Status ON [Order](Status);
CREATE INDEX IX_Message_SenderReceiver ON Message(SenderId, ReceiverId);
CREATE INDEX IX_Notification_UserId ON Notification(UserId);
GO
