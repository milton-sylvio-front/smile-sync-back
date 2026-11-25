import { describe, expect, it } from "vitest";
import { registerSchema } from "./auth.schemas";

const validRegistration = {
  name: "Joana Silva",
  email: "joana@clinica.com",
  document: "123.456.789-01",
  phone: "+55 (11) 90000-0000",
  termsAccepted: true,
};

describe("registerSchema password policy", () => {
  it("accepts a valid password with exactly 8 characters", () => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        password: "Aa1!bcde",
      }).success,
    ).toBe(true);
  });

  it("accepts a registration without clinic name or birth date", () => {
    expect(
      registerSchema.safeParse({
        name: validRegistration.name,
        email: validRegistration.email,
        document: validRegistration.document,
        phone: validRegistration.phone,
        termsAccepted: true,
        password: "Aa1!bcde",
      }).success,
    ).toBe(true);
  });

  it("accepts an optional birth date in ISO date format", () => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        birthDate: "1990-04-12",
        password: "Aa1!bcde",
      }).success,
    ).toBe(true);
  });

  it.each([
    ["fewer than 8 characters", "Aa1!bcd"],
    ["no uppercase letter", "senha123!"],
    ["no number", "SenhaForte!"],
    ["no special character", "SenhaForte12"],
  ])("rejects a password with %s", (_rule, password) => {
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        password,
      }).success,
    ).toBe(false);
  });
});
