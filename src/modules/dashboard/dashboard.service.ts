import { querySupabase } from "../../database/supabase";

export async function getDashboardSummary(
  clinicId: string,
  from?: string,
  to?: string,
): Promise<Record<string, unknown>> {
  const [patients, appointments, transactions] = await Promise.all([
    querySupabase<{ active: number | string; total: number | string }>(
      `SELECT
         COUNT(*) FILTER (WHERE "status" = 'ACTIVE') AS active,
         COUNT(*) AS total
       FROM "patients"
       WHERE "clinicId" = $1 AND "deletedAt" IS NULL`,
      [clinicId],
    ),
    querySupabase<{ total: number | string; completed: number | string }>(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE "status" = 'COMPLETED') AS completed
       FROM "appointments"
       WHERE "clinicId" = $1
         AND "startAt" >= COALESCE($2::timestamptz, CURRENT_DATE)
         AND "startAt" < COALESCE($3::timestamptz, CURRENT_DATE + INTERVAL '1 day')`,
      [clinicId, from ?? null, to ?? null],
    ),
    querySupabase<{ pendingAmountCents: number | string; overdue: number | string }>(
      `SELECT
         COALESCE(SUM("amountCents") FILTER (WHERE "status" = 'PENDING'), 0) AS "pendingAmountCents",
         COUNT(*) FILTER (WHERE "status" = 'OVERDUE') AS overdue
       FROM "transactions"
       WHERE "clinicId" = $1`,
      [clinicId],
    ),
  ]);

  return {
    patients: {
      active: Number(patients[0]?.active ?? 0),
      total: Number(patients[0]?.total ?? 0),
    },
    appointments: {
      total: Number(appointments[0]?.total ?? 0),
      completed: Number(appointments[0]?.completed ?? 0),
    },
    finance: {
      pendingAmountCents: Number(transactions[0]?.pendingAmountCents ?? 0),
      overdue: Number(transactions[0]?.overdue ?? 0),
    },
  };
}
