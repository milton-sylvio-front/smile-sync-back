import type { UserRole } from "../../modules/auth/auth.model";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        clinicId: string;
        role: UserRole;
      };
    }
  }
}

export {};
