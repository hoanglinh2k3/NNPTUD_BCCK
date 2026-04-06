USE DecorShopDB;
GO

DECLARE @AdminRoleId INT = (SELECT TOP 1 Id FROM Role WHERE Name = N'Admin');
DECLARE @StaffRoleId INT = (SELECT TOP 1 Id FROM Role WHERE Name = N'Staff');
DECLARE @CustomerRoleId INT = (SELECT TOP 1 Id FROM Role WHERE Name = N'Customer');

IF @AdminRoleId IS NULL OR @StaffRoleId IS NULL OR @CustomerRoleId IS NULL
BEGIN
    THROW 50000, 'Required roles are missing. Run 04_seed_roles.sql first.', 1;
END;

IF NOT EXISTS (SELECT 1 FROM [User] WHERE Email = N'admin@decor.local')
BEGIN
    INSERT INTO [User] (RoleId, FullName, Email, PasswordHash, Phone, Status)
    VALUES (
        @AdminRoleId,
        N'Admin Account',
        N'admin@decor.local',
        N'$2a$10$f5yB/Xp.l467wby3RJKvoOwy05TWsKzIKU1qX3U7IGPzDbSS.CtfO',
        N'0900000001',
        N'ACTIVE'
    );
END;

IF NOT EXISTS (SELECT 1 FROM [User] WHERE Email = N'staff@decor.local')
BEGIN
    INSERT INTO [User] (RoleId, FullName, Email, PasswordHash, Phone, Status)
    VALUES (
        @StaffRoleId,
        N'Staff Account',
        N'staff@decor.local',
        N'$2a$10$f5yB/Xp.l467wby3RJKvoOwy05TWsKzIKU1qX3U7IGPzDbSS.CtfO',
        N'0900000002',
        N'ACTIVE'
    );
END;

IF NOT EXISTS (SELECT 1 FROM [User] WHERE Email = N'customer@decor.local')
BEGIN
    INSERT INTO [User] (RoleId, FullName, Email, PasswordHash, Phone, Status)
    VALUES (
        @CustomerRoleId,
        N'Customer Account',
        N'customer@decor.local',
        N'$2a$10$f5yB/Xp.l467wby3RJKvoOwy05TWsKzIKU1qX3U7IGPzDbSS.CtfO',
        N'0900000003',
        N'ACTIVE'
    );
END;

DECLARE @CustomerId INT = (SELECT TOP 1 Id FROM [User] WHERE Email = N'customer@decor.local');

IF NOT EXISTS (SELECT 1 FROM Cart WHERE UserId = @CustomerId)
BEGIN
    INSERT INTO Cart (UserId)
    VALUES (@CustomerId);
END;

IF NOT EXISTS (SELECT 1 FROM Address WHERE UserId = @CustomerId)
BEGIN
    INSERT INTO Address (
        UserId,
        ReceiverName,
        Phone,
        Province,
        District,
        Ward,
        DetailAddress,
        IsDefault
    )
    VALUES (
        @CustomerId,
        N'Customer Account',
        N'0900000003',
        N'Ho Chi Minh City',
        N'Binh Thanh',
        N'Ward 1',
        N'123 Decor Street',
        1
    );
END;
GO
