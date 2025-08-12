import { AuthService } from "./auth.service";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { errorSchema, successSchema } from "@/shared/api";
import { LoginSchema, RegisterSchema } from "./auth.schema";
import { logger } from "@/middleware/logger";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cookieOptions } from "./auth.utils";
import { authMiddleware } from "@/middleware/auth";

const authService = new AuthService();

export const authController = new OpenAPIHono();

authController.use("/logout", authMiddleware);

// POST /auth/login - Login a user
authController.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/login",
    request: {
      body: {
        content: {
          "application/json": {
            schema: LoginSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User logged in successfully",
        content: {
          "application/json": {
            schema: successSchema(),
          },
        },
      },
      404: {
        description: "User not registered",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      400: {
        description: "Invalid request data",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      401: {
        description: "Invalid password",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      500: {
        description: "Failed to login user",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const body = await c.req.json();

      logger.info("Login attempt", { email: body.email }, c);

      const { accessToken, refreshToken } = await authService.login(body);

      setCookie(c, "accessToken", accessToken, cookieOptions.access);
      setCookie(c, "refreshToken", refreshToken, cookieOptions.refresh);

      logger.requestFromContext(c, 201);
      logger.info("Login successful", { email: body.email }, c);

      return c.json({ success: true }, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(
          "Login failed - Invalid request data",
          { error: error.issues },
          c
        );
        logger.requestFromContext(c, 400);
        return c.json({ error: "Invalid request data" }, 400);
      }

      if (error instanceof Error && error.cause === "User not registered") {
        logger.warn(
          "Login failed - User not registered",
          { message: error.message },
          c
        );
        logger.requestFromContext(c, 404);
        return c.json({ error: "User not registered" }, 404);
      }

      if (error instanceof Error && error.cause === "Invalid password") {
        logger.warn(
          "Login failed - Invalid password",
          { message: error.message },
          c
        );
        logger.requestFromContext(c, 401);
        return c.json({ error: "Invalid password" }, 401);
      }

      logger.error(
        "Login failed - Server error",
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        },
        c
      );
      logger.requestFromContext(c, 500);

      return c.json({ error: "Failed to login user" }, 500);
    }
  }
);

// POST /auth/register - Register a new user
authController.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/register",
    request: {
      body: {
        content: {
          "application/json": {
            schema: RegisterSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
        content: {
          "application/json": {
            schema: successSchema(),
          },
        },
      },
      400: {
        description: "Invalid request data",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      409: {
        description: "User already exists",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      500: {
        description: "Failed to create user",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const body = await c.req.json();

      logger.info("Registration attempt", { email: body.email }, c);

      const { user, accessToken, refreshToken } =
        await authService.register(body);

      setCookie(c, "accessToken", accessToken, cookieOptions.access);
      setCookie(c, "refreshToken", refreshToken, cookieOptions.refresh);

      logger.requestFromContext(c, 201);
      logger.info(
        "Registration successful",
        { userId: user.id, email: user.email },
        c
      );

      return c.json(
        {
          success: true,
        },
        201
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(
          "Registration failed - Invalid request data",
          { error: error.issues },
          c
        );
        logger.requestFromContext(c, 400);
        return c.json({ error: "Invalid request data" }, 400);
      }

      if (error instanceof Error && error.cause === "User already exists") {
        logger.warn(
          "Registration failed - User already exists",
          { message: error.message },
          c
        );
        logger.requestFromContext(c, 409);
        return c.json({ error: "User already exists" }, 409);
      }

      logger.error(
        "Registration failed - Server error",
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        },
        c
      );
      logger.requestFromContext(c, 500);

      return c.json({ error: "Failed to create user" }, 500);
    }
  }
);

// POST /auth/logout - Logout a user
authController.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/logout",
    responses: {
      201: {
        description: "User logged out successfully",
        content: {
          "application/json": {
            schema: successSchema(),
          },
        },
      },
      400: {
        description: "No user logged in",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      500: {
        description: "Failed to logout user",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      deleteCookie(c, "accessToken", cookieOptions.access);
      deleteCookie(c, "refreshToken", cookieOptions.refresh);

      logger.requestFromContext(c, 201);
      logger.info("User logged out successfully", c);

      return c.json({ success: true }, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request data" }, 400);
      }
      return c.json({ error: "Failed to update user" }, 500);
    }
  }
);
