import { z } from "zod";
import { AppError } from "../errors/app-error";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export interface Pagination {
  page: number;
  pageSize: number;
  offset: number;
}

export function parsePagination(query: unknown): Pagination {
  const result = paginationSchema.safeParse(query);
  if (!result.success) {
    throw new AppError("Parâmetros de paginação inválidos.", 400);
  }
  return {
    ...result.data,
    offset: (result.data.page - 1) * result.data.pageSize,
  };
}
