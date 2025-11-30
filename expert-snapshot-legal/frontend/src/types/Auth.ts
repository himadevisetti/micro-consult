// src/types/Auth.ts

export interface DecodedToken {
  userId: number;
  customerId: string;
  exp: number; // expiry timestamp (seconds since epoch)
}

