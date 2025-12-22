-- ============================================
-- Users Table
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
-- Documents Table
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

