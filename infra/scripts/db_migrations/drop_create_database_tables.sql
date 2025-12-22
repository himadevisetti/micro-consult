-- ============================================
-- Drop existing objects if they exist
-- ============================================

-- Drop trigger first (depends on Users)
IF OBJECT_ID('dbo.trg_SetCustomerId', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_SetCustomerId;
GO

-- Drop foreign key (depends on Users/Documents)
IF OBJECT_ID('FK_Documents_Users_CustomerId', 'F') IS NOT NULL
    ALTER TABLE dbo.Documents DROP CONSTRAINT FK_Documents_Users_CustomerId;
GO

-- Drop Documents table
IF OBJECT_ID('dbo.Documents', 'U') IS NOT NULL
    DROP TABLE dbo.Documents;
GO

-- Drop Users table
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    DROP TABLE dbo.Users;
GO

-- ============================================
-- Recreate Users table
-- ============================================
CREATE TABLE dbo.Users (
    id INT NOT NULL PRIMARY KEY CLUSTERED,
    firstName NVARCHAR(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    lastName NVARCHAR(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    email NVARCHAR(510) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    passwordHash NVARCHAR(510) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    createdAt DATETIME NULL CONSTRAINT DF_Users_createdAt DEFAULT (GETDATE()),
    customerId NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    isVerified BIT NOT NULL CONSTRAINT DF_Users_isVerified DEFAULT ((0)),
    updatedAt DATETIME NULL CONSTRAINT DF_Users_updatedAt DEFAULT (GETDATE()),
    resetToken NVARCHAR(64) NULL,
    resetTokenExpiry DATETIME NULL
);

-- Unique constraints
ALTER TABLE dbo.Users ADD CONSTRAINT UQ_Users_email UNIQUE (email);
ALTER TABLE dbo.Users ADD CONSTRAINT UQ_Users_customerId UNIQUE (customerId);
GO

-- Trigger to auto-populate customerId
CREATE TRIGGER trg_SetCustomerId
ON dbo.Users
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE u
    SET customerId = 'customer-' + CAST(i.id AS NVARCHAR(50))
    FROM dbo.Users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- ============================================
-- Recreate Documents table
-- ============================================
CREATE TABLE dbo.Documents (
    id INT NOT NULL PRIMARY KEY CLUSTERED,
    flowName NVARCHAR(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    documentType NVARCHAR(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    filePath NVARCHAR(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    metadata NVARCHAR(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    createdAt DATETIME NULL CONSTRAINT DF_Documents_createdAt DEFAULT (GETDATE()),
    updatedAt DATETIME NULL CONSTRAINT DF_Documents_updatedAt DEFAULT (GETDATE()),
    fileSize BIGINT NULL,
    storageType NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    customerId NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    fileName NVARCHAR(510) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    storagePath NVARCHAR(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);

-- Foreign key relationship
ALTER TABLE dbo.Documents
ADD CONSTRAINT FK_Documents_Users_CustomerId
FOREIGN KEY (customerId) REFERENCES dbo.Users(customerId);
GO

