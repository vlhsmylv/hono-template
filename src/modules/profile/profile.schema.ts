import { z } from "@hono/zod-openapi";

export const ProfileSchema = z.object({
  id: z.string().describe("The id of the user"),
  name: z.string().describe("The name of the user"),
  surname: z.string().describe("The surname of the user"),
  email: z.string().email().describe("The email of the user"),
  createdAt: z.date().describe("The creation date of the user"),
  updatedAt: z.date().describe("The last update date of the user"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).describe("The name of the user").optional(),
  surname: z.string().min(1).describe("The surname of the user").optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
