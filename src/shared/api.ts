import { z } from "@hono/zod-openapi";

export const errorSchema = z.object({
  error: z.string().openapi({ description: "Error message" }),
});

export const successSchema = <T>(schema?: z.ZodType<T>) =>
  z.object({
    success: z.boolean().openapi({ description: "Success message" }),
    data:
      schema?.optional().openapi({ description: "Data" }) ??
      z.any().optional().openapi({ description: "Data" }),
  });
