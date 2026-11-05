export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  family: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
}
