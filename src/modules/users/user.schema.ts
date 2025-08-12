import { z } from "@hono/zod-openapi";

export const UserSchema = z.object({
  id: z.string().describe("The id of the user"),
  name: z.string().describe("The name of the user"),
  surname: z.string().describe("The surname of the user"),
  email: z.string().email().describe("The email of the user"),
  createdAt: z.date().describe("The creation date of the user"),
  updatedAt: z.date().describe("The last update date of the user"),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1).describe("The name of the user"),
  surname: z.string().min(1).describe("The surname of the user"),
  email: z.string().email().describe("The email of the user"),
  password: z.string().min(6).describe("The password of the user"),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).describe("The name of the user").optional(),
  surname: z.string().min(1).describe("The surname of the user").optional(),
  email: z.string().email().describe("The email of the user").optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
