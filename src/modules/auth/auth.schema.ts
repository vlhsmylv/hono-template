import { z } from "@hono/zod-openapi";

const LoginSchema = z.object({
  email: z.email().describe("The email of the user"),
  password: z.string().min(6).describe("The password of the user"),
});

const RegisterSchema = z.object({
  email: z.email().describe("The email of the user"),
  password: z.string().min(6).describe("The password of the user"),
  name: z.string().min(1).describe("The name of the user"),
  surname: z.string().min(1).describe("The surname of the user"),
});

export { LoginSchema, RegisterSchema };

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
