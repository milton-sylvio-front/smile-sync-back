import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { querySupabase } from "../../database/supabase";
import { AppError } from "../../shared/errors/app-error";
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
  clinicName: string;
  name: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: Omit<UserRecord, "passwordHash"> }> {
  const secret = jwtSecret();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const clinicId = randomUUID();
  const userId = randomUUID();
  const result = await querySupabase<UserRecord>(
    `WITH new_clinic AS (
       INSERT INTO "clinics" ("id", "name", "email")
       VALUES ($1, $2, $3)
       RETURNING "id"
     )
     INSERT INTO "users" ("id", "clinicId", "name", "email", "passwordHash", "role")
     SELECT $4, new_clinic."id", $5, $3, $6, 'OWNER'
     FROM new_clinic
     RETURNING "id", "clinicId", "name", "email", "passwordHash", "role"`,
    [
      clinicId,
      input.clinicName,
      input.email,
      userId,
      input.name,
      passwordHash,
    ],
  );
  const user = result[0];
  if (!user) throw new Error("Não foi possível criar a clínica e o usuário.");
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { accessToken: issueAccessToken(user, secret), user: safeUser };
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
