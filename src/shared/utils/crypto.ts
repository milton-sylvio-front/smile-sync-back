import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { AppError } from "../errors/app-error";

function getEncryptionKey(): Buffer {
  const configuredKey = process.env.DATA_ENCRYPTION_KEY;
  if (!configuredKey) {
    throw new Error("A variável DATA_ENCRYPTION_KEY não está configurada.");
  }

  const key = Buffer.from(configuredKey, "base64");
  if (key.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY deve ser uma chave base64 de 32 bytes.");
  }
  return key;
}

export function encryptSensitiveText(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptSensitiveText(value: string): string {
  const [version, encodedIv, encodedTag, encodedCiphertext, ...extra] =
    value.split(":");
  if (
    version !== "v1" ||
    !encodedIv ||
    !encodedTag ||
    !encodedCiphertext ||
    extra.length > 0
  ) {
    throw new AppError("O registro contém dados criptografados inválidos.", 500);
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(encodedIv, "base64"),
    );
    decipher.setAuthTag(Buffer.from(encodedTag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATA_ENCRYPTION_KEY")) {
      throw error;
    }
    throw new AppError("Não foi possível descriptografar o registro clínico.", 500);
  }
}
