import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { querySupabase } from "../../database/supabase";
import { AppError } from "../../shared/errors/app-error";
import { encryptSensitiveText } from "../../shared/utils/crypto";
import type { UserRole } from "./auth.model";

interface UserRecord {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("A variável JWT_SECRET não está configurada.");
  if (secret.length < 32) {
    throw new Error("JWT_SECRET deve possuir pelo menos 32 caracteres.");
  }
  return secret;
}

function issueAccessToken(user: UserRecord, secret: string): string {
  return jwt.sign(
    { clinicId: user.clinicId, role: user.role },
    secret,
    { algorithm: "HS256", subject: user.id, expiresIn: "15m" },
  );
}

export async function register(input: {
  clinicName?: string;
  name: string;
  email: string;
  birthDate?: string;
  document: string;
  phone: string;
  termsAccepted: true;
  password: string;
}): Promise<{ accessToken: string; user: Omit<UserRecord, "passwordHash"> }> {
  const secret = jwtSecret();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const clinicId = randomUUID();
  const userId = randomUUID();
  const result = await querySupabase<UserRecord>(
    `WITH new_clinic AS (
      INSERT INTO "clinics" ("id", "name", "email", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING "id"
     )
    INSERT INTO "users" ("id", "clinicId", "name", "email", "passwordHash", "role", "clinicName", "birthDate", "document", "phone", "termsAcceptedAt", "createdAt", "updatedAt")
    SELECT $4, new_clinic."id", $5, $3, $6, 'OWNER', $2, $7::date, $8, $9, NOW(), NOW(), NOW()
     FROM new_clinic
     RETURNING "id", "clinicId", "name", "email", "passwordHash", "role"`,
    [
      clinicId,
      input.clinicName ?? input.name,
      input.email,
      userId,
      input.name,
      passwordHash,
      input.birthDate ?? null,
      encryptSensitiveText(input.document),
      input.phone,
    ],
  );
  const user = result[0];
  if (!user) throw new Error("Não foi possível criar a clínica e o usuário.");
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { accessToken: issueAccessToken(user, secret), user: safeUser };
}

export async function currentUser(userId: string): Promise<{
  userId: string;
  clinicId: string;
  name: string;
  role: UserRole;
}> {
  const rows = await querySupabase<Pick<UserRecord, "id" | "clinicId" | "name" | "role">>(
    `SELECT "id", "clinicId", "name", "role"
     FROM "users"
     WHERE "id" = $1 AND "isActive" = TRUE AND "deletedAt" IS NULL
     LIMIT 1`,
    [userId],
  );
  const user = rows[0];
  if (!user) throw new AppError("Sessão inválida.", 401);
  return {
    userId: user.id,
    clinicId: user.clinicId,
    name: user.name,
    role: user.role,
  };
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: Omit<UserRecord, "passwordHash"> }> {
  const secret = jwtSecret();
  const rows = await querySupabase<UserRecord>(
    `SELECT "id", "clinicId", "name", "email", "passwordHash", "role"
     FROM "users"
     WHERE "email" = $1 AND "isActive" = TRUE AND "deletedAt" IS NULL
     LIMIT 1`,
    [input.email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  await querySupabase(
    `UPDATE "users" SET "lastLoginAt" = NOW() WHERE "id" = $1`,
    [user.id],
  );
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { accessToken: issueAccessToken(user, secret), user: safeUser };
}
