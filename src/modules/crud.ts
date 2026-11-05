import { Router } from "express";
import { z, type ZodType } from "zod";
import { querySupabase } from "../database/supabase";
import { AppError } from "../shared/errors/app-error";
import { parsePagination } from "../shared/utils/pagination";

type ResourceRow = Record<string, unknown> & { id: string };

interface RelationCheck {
  field: string;
  table: string;
  activeOnly?: boolean;
}

export interface ResourceContext {
  clinicId: string;
  userId: string;
  operation: "create" | "update";
  role: string;
}

export interface ResourceDefinition {
  table: string;
  fields: Record<string, ZodType>;
  softDelete?: boolean;
  readOnly?: boolean;
  orderBy?: string;
  hiddenFields?: string[];
  relations?: RelationCheck[];
  prepare?: (
    data: Record<string, unknown>,
    context: ResourceContext,
  ) => Promise<Record<string, unknown>>;
  present?: (row: ResourceRow) => ResourceRow;
  mutableFilter?: string;
  writeRoles?: string[];
}

function quote(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function hideFields<T extends Record<string, unknown>>(
  row: T,
  fields: string[] = [],
): T {
  if (fields.length === 0) return row;
  const result = { ...row };
  for (const field of fields) delete result[field];
  return result;
}

function presentRow(
  resource: ResourceDefinition,
  row: ResourceRow,
): ResourceRow {
  const presented = resource.present ? resource.present(row) : row;
  return hideFields(presented, resource.hiddenFields);
}

async function checkRelations(
  resource: ResourceDefinition,
  data: Record<string, unknown>,
  clinicId: string,
): Promise<void> {
  for (const relation of resource.relations ?? []) {
    const id = data[relation.field];
    if (typeof id !== "string") continue;

    const activeFilter = relation.activeOnly
      ? ' AND "deletedAt" IS NULL'
      : "";
    const rows = await querySupabase<{ exists: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM ${quote(relation.table)} WHERE "id" = $1 AND "clinicId" = $2${activeFilter}) AS "exists"`,
      [id, clinicId],
    );
    if (!rows[0]?.exists) {
      throw new AppError(`O campo ${relation.field} não pertence à clínica.`, 400);
    }
  }
}

function createSchema(resource: ResourceDefinition): ZodType {
  return z.object(resource.fields).strict();
}

function updateSchema(resource: ResourceDefinition): ZodType {
  return z.object(resource.fields).partial().strict();
}

function getId(value: unknown): string {
  const result = z.string().uuid().safeParse(value);
  if (!result.success) throw new AppError("Identificador inválido.", 400);
  return result.data;
}

export function createResourceRouter(resource: ResourceDefinition): Router {
  const router = Router();
  const table = quote(resource.table);
  const orderBy = quote(resource.orderBy ?? "id");

  const checkWriteRole = (role: string): void => {
    if (resource.writeRoles && !resource.writeRoles.includes(role)) {
      throw new AppError("Você não tem permissão para alterar este recurso.", 403);
    }
  };

  router.get("/", async (req, res, next) => {
    try {
      const { page, pageSize, offset } = parsePagination(req.query);
      const clinicId = req.auth!.clinicId;
      const deletedFilter = resource.softDelete ? ' AND "deletedAt" IS NULL' : "";
      const [rows, count] = await Promise.all([
        querySupabase<ResourceRow>(
          `SELECT * FROM ${table} WHERE "clinicId" = $1${deletedFilter} ORDER BY ${orderBy} LIMIT $2 OFFSET $3`,
          [clinicId, pageSize, offset],
        ),
        querySupabase<{ count: number | string }>(
          `SELECT COUNT(*) AS count FROM ${table} WHERE "clinicId" = $1${deletedFilter}`,
          [clinicId],
        ),
      ]);

      res.json({
        data: rows.map((row) => presentRow(resource, row)),
        page,
        pageSize,
        total: Number(count[0]?.count ?? 0),
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const id = getId(req.params.id);
      const deletedFilter = resource.softDelete ? ' AND "deletedAt" IS NULL' : "";
      const rows = await querySupabase<ResourceRow>(
        `SELECT * FROM ${table} WHERE "id" = $1 AND "clinicId" = $2${deletedFilter} LIMIT 1`,
        [id, req.auth!.clinicId],
      );
      if (!rows[0]) throw new AppError("Registro não encontrado.", 404);
      res.json({ data: presentRow(resource, rows[0]) });
    } catch (error) {
      next(error);
    }
  });

  if (resource.readOnly) return router;

  router.post("/", async (req, res, next) => {
    try {
      const parsed = createSchema(resource).parse(req.body) as Record<string, unknown>;
      checkWriteRole(req.auth!.role);
      const context = {
        clinicId: req.auth!.clinicId,
        userId: req.auth!.userId,
        operation: "create" as const,
        role: req.auth!.role,
      };
      await checkRelations(resource, parsed, context.clinicId);
      let data: Record<string, unknown> = {
        ...parsed,
        clinicId: context.clinicId,
      };
      if (resource.prepare) data = await resource.prepare(data, context);

      const columns = Object.keys(data);
      const values = columns.map((column) => data[column]);
      const placeholders = values.map((_, index) => `$${index + 1}`);
      const rows = await querySupabase<ResourceRow>(
        `INSERT INTO ${table} (${columns.map(quote).join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
        values,
      );
      res.status(201).json({ data: presentRow(resource, rows[0]) });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      const id = getId(req.params.id);
      const parsed = updateSchema(resource).parse(req.body) as Record<
        string,
        unknown
      >;
      if (Object.keys(parsed).length === 0) {
        throw new AppError("Informe ao menos um campo para atualizar.", 400);
      }

      checkWriteRole(req.auth!.role);
      await checkRelations(resource, parsed, req.auth!.clinicId);
      const context = {
        clinicId: req.auth!.clinicId,
        userId: req.auth!.userId,
        operation: "update" as const,
        role: req.auth!.role,
      };
      const data = resource.prepare
        ? await resource.prepare(parsed, context)
        : parsed;
      const columns = Object.keys(data);
      const values = columns.map((column) => data[column]);
      const assignments = columns.map(
        (column, index) => `${quote(column)} = $${index + 1}`,
      );
      values.push(id, req.auth!.clinicId);
      const deletedFilter = resource.softDelete ? ' AND "deletedAt" IS NULL' : "";
      const mutableFilter = resource.mutableFilter
        ? ` AND ${resource.mutableFilter}`
        : "";
      const rows = await querySupabase<ResourceRow>(
        `UPDATE ${table} SET ${assignments.join(", ")} WHERE "id" = $${values.length - 1} AND "clinicId" = $${values.length}${deletedFilter}${mutableFilter} RETURNING *`,
        values,
      );
      if (!rows[0]) throw new AppError("Registro não encontrado.", 404);
      res.json({ data: presentRow(resource, rows[0]) });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      checkWriteRole(req.auth!.role);
      const id = getId(req.params.id);
      const deletedFilter = resource.softDelete ? ' AND "deletedAt" IS NULL' : "";
      const statement = resource.softDelete
        ? `UPDATE ${table} SET "deletedAt" = NOW() WHERE "id" = $1 AND "clinicId" = $2${deletedFilter} RETURNING "id"`
        : `DELETE FROM ${table} WHERE "id" = $1 AND "clinicId" = $2${resource.mutableFilter ? ` AND ${resource.mutableFilter}` : ""} RETURNING "id"`;
      const rows = await querySupabase<{ id: string }>(statement, [
        id,
        req.auth!.clinicId,
      ]);
      if (!rows[0]) throw new AppError("Registro não encontrado.", 404);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
