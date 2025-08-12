import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { injectUser } from "@/middleware/user-injection";
import { authMiddleware } from "@/middleware/auth";
import { logger } from "@/middleware/logger";
import { UserSchema } from "../users/user.schema";
import { errorSchema } from "@/shared/api";
import { withUser } from "@/utils/decorators";

export const profileController = new OpenAPIHono();

// Apply middleware chain: auth -> inject user
profileController.use("/*", authMiddleware);
profileController.use("/*", injectUser);

profileController.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Profile"],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: UserSchema,
          },
        },
        description: "User profile retrieved",
      },
      401: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Unauthorized",
      },
    },
  }),
  withUser(async (user, c) => {
    logger.info("Profile accessed", { userId: user.id }, c);
    return c.json(user);
  })
);
