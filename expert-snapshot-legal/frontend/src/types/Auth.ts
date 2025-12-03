// src/types/Auth.ts

export interface DecodedToken {
  userId: number;
  customerId: string;
  exp: number;        // expiry timestamp (seconds since epoch)
  email?: string;     // user's email address
  upn?: string;       // userPrincipalName (for guest/#EXT# accounts)
  iat?: number;       // issued-at timestamp (optional, if included)
}

