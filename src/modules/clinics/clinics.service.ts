import { querySupabase } from "../../database/supabase";
import { AppError } from "../../shared/errors/app-error";

const clinicFields = new Set([
  "name",
  "email",
  "cnpj",
  "phone",
  "address",
  "timezone",
  "slotMinutes",
  "reminderHoursBefore",
  "whatsappEnabled",
  "reactivationAfterDays",
]);

export async function getClinic(clinicId: string): Promise<Record<string, unknown>> {
  const rows = await querySupabase<Record<string, unknown>>(
    `SELECT * FROM "clinics" WHERE "id" = $1 LIMIT 1`,
    [clinicId],
  );
  if (!rows[0]) throw new AppError("Clínica não encontrada.", 404);
  return rows[0];
}

export async function updateClinic(
  clinicId: string,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const columns = Object.keys(input);
  if (columns.length === 0 || columns.some((column) => !clinicFields.has(column))) {
    throw new AppError("Nenhum campo válido para atualizar.", 400);
  }
  const assignments = columns.map(
    (column, index) => `"${column}" = $${index + 1}`,
  );
  const values = columns.map((column) => input[column]);
  values.push(clinicId);
  const rows = await querySupabase<Record<string, unknown>>(
    `UPDATE "clinics" SET ${assignments.join(", ")} WHERE "id" = $${values.length} RETURNING *`,
    values,
  );
  if (!rows[0]) throw new AppError("Clínica não encontrada.", 404);
  return rows[0];
}
