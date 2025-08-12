import { UserService } from "./users.service";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { errorSchema, successSchema } from "@/shared/api";
import { UserSchema, CreateUserSchema, UpdateUserSchema } from "./user.schema";
import { authMiddleware } from "@/middleware/auth";
import { injectUser } from "@/middleware/user-injection";

const userService = new UserService();

export const userController = new OpenAPIHono();

// Apply middleware chain: auth -> inject user
userController.use("/*", authMiddleware);
userController.use("/*", injectUser);

// GET /users - Get all users
userController.openapi(
  createRoute({
    tags: ["Users"],
    method: "get",
    path: "/",
    responses: {
      200: {
        description: "User fetched successfully",
        content: {
          "application/json": {
            schema: z.array(UserSchema),
          },
        },
      },
      500: {
        description: "Failed to fetch users",
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
      const users = await userService.getAllUsers();
      return c.json(users, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Fail ed to fetch users" }, 500);
    }
  }
);

// POST /users - Create a new user
userController.openapi(
  createRoute({
    tags: ["Users"],
    method: "post",
    path: "/",
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
      const userData = await c.req.json();
      const validatedData = CreateUserSchema.parse(userData);
      const newUser = await userService.createUser(validatedData);

      if (!newUser) {
        return c.json({ error: "Failed to create user" }, 500);
      }

      return c.json({ success: true }, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request data" }, 400);
      }
      return c.json({ error: "Failed to create user" }, 500);
    }
  }
);

// GET /users/:id - Get a user by ID
userController.openapi(
  createRoute({
    tags: ["Users"],
    method: "get",
    path: "/:id",
    responses: {
      200: {
        description: "User fetched successfully",
        content: {
          "application/json": {
            schema: successSchema(UserSchema),
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      400: {
        description: "Invalid user ID",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      500: {
        description: "Failed to fetch user",
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
      const { id } = z
        .object({ id: z.string() })
        .parse({ id: c.req.param("id") });
      const user = await userService.getUserById(id);

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ success: true, data: user }, 200);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid user ID" }, 400);
      }
      return c.json({ error: "Failed to fetch user" }, 500);
    }
  }
);

// PUT /users/:id - Update a user
userController.openapi(
  createRoute({
    tags: ["Users"],
    method: "put",
    path: "/:id",
    responses: {
      200: {
        description: "User updated successfully",
        content: {
          "application/json": {
            schema: successSchema(),
          },
        },
      },
      404: {
        description: "User not found",
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
      500: {
        description: "Failed to update user",
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
      const { id } = z
        .object({ id: z.string() })
        .parse({ id: c.req.param("id") });
      const userData = await c.req.json();
      const validatedData = UpdateUserSchema.parse(userData);

      const updatedUser = await userService.updateUser(id, validatedData);

      if (!updatedUser) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ success: true }, 200);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request data" }, 400);
      }
      return c.json({ error: "Failed to update user" }, 500);
    }
  }
);

// DELETE /users/:id - Delete a user
userController.openapi(
  createRoute({
    tags: ["Users"],
    method: "delete",
    path: "/:id",
    responses: {
      200: {
        description: "User deleted successfully",
        content: {
          "application/json": {
            schema: successSchema(undefined),
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      400: {
        description: "Invalid user ID",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      500: {
        description: "Failed to delete user",
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
      const { id } = z
        .object({ id: z.string() })
        .parse({ id: c.req.param("id") });
      const deletedUser = await userService.deleteUser(id);

      if (!deletedUser) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ success: true }, 200);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid user ID" }, 400);
      }
      return c.json({ error: "Failed to delete user" }, 500);
    }
  }
);
