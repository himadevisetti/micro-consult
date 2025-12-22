// src/models/UserRepository.ts

import { poolPromise } from "../db/connection.js";
import sql from "mssql";

/**
 * Create a new user with isVerified flag.
 */
export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  passwordHash: string,
  isVerified: boolean = false
) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("firstName", sql.NVarChar, firstName)
    .input("lastName", sql.NVarChar, lastName)
    .input("email", sql.NVarChar, email)
    .input("passwordHash", sql.NVarChar, passwordHash)
    .input("isVerified", sql.Bit, isVerified ? 1 : 0)
    .query(`
      DECLARE @InsertedUsers TABLE (
        id INT,
        customerId UNIQUEIDENTIFIER,
        createdAt DATETIME,
        isVerified BIT
      );

      INSERT INTO Users (firstName, lastName, email, passwordHash, createdAt, isVerified)
      OUTPUT INSERTED.id, INSERTED.customerId, INSERTED.createdAt, INSERTED.isVerified INTO @InsertedUsers
      VALUES (@firstName, @lastName, @email, @passwordHash, GETDATE(), @isVerified);

      SELECT id, customerId, createdAt, isVerified FROM @InsertedUsers;
    `);

  return result.recordset[0]; // { id, customerId, createdAt, isVerified }
}

/**
 * Find a user by email.
 */
export async function findUserByEmail(email: string) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("email", sql.NVarChar, email)
    .query(`SELECT * FROM Users WHERE email = @email`);
  return result.recordset[0];
}

/**
 * Find a user for login (includes isVerified flag).
 */
export async function findUserForLogin(email: string) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("email", sql.NVarChar, email)
    .query(`
      SELECT id, email, passwordHash, customerId, createdAt, isVerified
      FROM Users
      WHERE email = @email
    `);
  return result.recordset[0];
}

/**
 * Save a verification token for a user.
 * Assumes a VerificationTokens table exists: (userId INT, token NVARCHAR(64), createdAt DATETIME).
 */
export async function saveVerificationToken(userId: number, token: string) {
  const pool = await poolPromise;
  await pool.request()
    .input("userId", sql.Int, userId)
    .input("token", sql.NVarChar(64), token)
    .query(`
      INSERT INTO VerificationTokens (userId, token, createdAt)
      VALUES (@userId, @token, GETDATE())
    `);
}

/**
 * Mark a user as verified.
 */
export async function markUserVerified(userId: number) {
  const pool = await poolPromise;
  await pool.request()
    .input("userId", sql.Int, userId)
    .query(`
      UPDATE Users
      SET isVerified = 1, updatedAt = GETDATE()
      WHERE id = @userId
    `);
}

/**
 * Find a verification token record.
 * Returns userId, token, and createdAt for expiration checks.
 */
export async function findVerificationToken(token: string) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("token", sql.NVarChar(64), token)
    .query(`
      SELECT userId, token, createdAt
      FROM VerificationTokens
      WHERE token = @token
    `);
  return result.recordset[0]; // { userId, token, createdAt }
}

/**
 * Delete a verification token after use or expiration.
 */
export async function deleteVerificationToken(token: string) {
  const pool = await poolPromise;
  await pool.request()
    .input("token", sql.NVarChar(64), token)
    .query(`DELETE FROM VerificationTokens WHERE token = @token`);
}

/**
 * Utility: check if a verification token is expired.
 * TTL is configurable via VERIFICATION_TOKEN_TTL_HOURS (default = 24).
 */
export function isTokenExpired(record: { createdAt: Date }) {
  const ttlHours = parseInt(process.env.VERIFICATION_TOKEN_TTL_HOURS || "24", 10);
  const createdAt = new Date(record.createdAt);
  const expiresAt = new Date(createdAt.getTime() + ttlHours * 60 * 60 * 1000);
  return new Date() > expiresAt;
}

/**
 * Find or create a user based on Microsoft OAuth profile.
 * - Looks up by email (from profile.upn or profile.email).
 * - If found, returns existing user (id, customerId, createdAt, isVerified).
 * - If not found, inserts a new user with isVerified = 1 (since Microsoft login is trusted).
 */
export async function findOrCreateMicrosoftUser(profile: any, params: any) {
  const email = profile?.email || profile?.upn;
  if (!email) {
    throw new Error("Microsoft profile missing email/UPN");
  }

  const pool = await poolPromise;

  // Step 1: Try to find existing user
  const existing = await pool.request()
    .input("email", sql.NVarChar, email)
    .query(`
      SELECT id, customerId, createdAt, isVerified, updatedAt, email
      FROM Users
      WHERE email = @email
    `);

  if (existing.recordset.length > 0) {
    const user = existing.recordset[0];
    // 🔹 Merge enriched profile fields into returned object
    return {
      ...user,
      email: profile.email || user.email,
      upn: profile.upn,
      firstName: profile.given_name || "",
      lastName: profile.family_name || ""
    };
  }

  // Step 2: Insert new user (minimal fields, no passwordHash)
  const insertResult = await pool.request()
    .input("firstName", sql.NVarChar, profile?.given_name || "")
    .input("lastName", sql.NVarChar, profile?.family_name || "")
    .input("email", sql.NVarChar, email)
    .input("passwordHash", sql.NVarChar, "") // placeholder since Microsoft login bypasses password
    .input("isVerified", sql.Bit, 1) // Microsoft login is considered verified
    .query(`
      DECLARE @InsertedUsers TABLE (
        id INT,
        customerId UNIQUEIDENTIFIER,
        createdAt DATETIME,
        updatedAt DATETIME,
        isVerified BIT,
        email NVARCHAR(256)
      );

      INSERT INTO Users (firstName, lastName, email, passwordHash, createdAt, updatedAt, isVerified)
      OUTPUT INSERTED.id, INSERTED.customerId, INSERTED.createdAt, INSERTED.updatedAt, INSERTED.isVerified, INSERTED.email INTO @InsertedUsers
      VALUES (@firstName, @lastName, @email, @passwordHash, GETDATE(), CURRENT_TIMESTAMP, @isVerified);

      SELECT id FROM @InsertedUsers;
    `);

  const insertedId = insertResult.recordset[0]?.id;
  if (!insertedId) {
    throw new Error("Failed to insert Microsoft user");
  }

  // Step 3: Re-select full user to get trigger-populated customerId
  const final = await pool.request()
    .input("id", sql.Int, insertedId)
    .query(`
      SELECT id, customerId, createdAt, isVerified, updatedAt, email
      FROM Users
      WHERE id = @id
    `);

  const user = final.recordset[0];
  // 🔹 Merge enriched profile fields into returned object
  return {
    ...user,
    email: profile.email || user.email,
    upn: profile.upn,
    firstName: profile.given_name || "",
    lastName: profile.family_name || ""
  };
}

/**
 * Save a password reset token for a user.
 * Stores token + expiry directly in Users table.
 */
export async function savePasswordResetToken(userId: number, token: string, expiresAt: Date) {
  const pool = await poolPromise;
  await pool.request()
    .input("userId", sql.Int, userId)
    .input("token", sql.NVarChar(64), token)
    .input("expiresAt", sql.DateTime, expiresAt)
    .query(`
      UPDATE Users
      SET resetToken = @token, resetTokenExpiry = @expiresAt, updatedAt = GETDATE()
      WHERE id = @userId
    `);
}

/**
 * Delete a password reset token after use or expiration.
 */
export async function deletePasswordResetToken(token: string) {
  const pool = await poolPromise;
  await pool.request()
    .input("token", sql.NVarChar(64), token)
    .query(`
      UPDATE Users
      SET resetToken = NULL, resetTokenExpiry = NULL, updatedAt = GETDATE()
      WHERE resetToken = @token
    `);
}

/**
 * Utility: check if a password reset token is expired.
 * TTL is configurable via RESET_TOKEN_TTL_HOURS (default = 1).
 */
export function isPasswordResetTokenExpired(record: { resetTokenExpiry: Date }) {
  if (!record?.resetTokenExpiry) return true;
  return new Date() > new Date(record.resetTokenExpiry);
}

/**
 * Find a password reset token record.
 * Returns userId, resetToken, resetTokenExpiry for expiration checks.
 */
export async function findPasswordResetToken(token: string) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("token", sql.NVarChar(64), token)
    .query(`
      SELECT id AS userId, resetToken, resetTokenExpiry
      FROM Users
      WHERE resetToken = @token
    `);
  return result.recordset[0]; // { userId, resetToken, resetTokenExpiry }
}
