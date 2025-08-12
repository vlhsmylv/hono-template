import { OpenAPIHono } from "@hono/zod-openapi";
import { userController } from "@/modules/users/users.controller";
import { authController } from "@/modules/auth/auth.controller";
import { profileController } from "@/modules/profile/profile.controller";

const v1 = new OpenAPIHono();

v1.route("/users", userController);
v1.route("/auth", authController);
v1.route("/profile", profileController);

export default v1;
