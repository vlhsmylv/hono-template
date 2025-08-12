import type { Context, Next } from "hono";
import { prisma } from "@/prisma";
import { logger } from "./logger";
import { ProfileService } from "@/modules/profile/profile.service";

// Extend Hono's context type to include user
declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}

const profileService = new ProfileService();

/**
 * Middleware to inject authenticated user into context
 * Use this after auth middleware to automatically populate user data
 */
export const injectUser = async (c: Context, next: Next) => {
  try {
    // Get user ID from auth middleware (assuming it sets userId)
    const userId = c.get("userId");

    if (!userId) {
      logger.warn("User injection failed - No user ID in context", {}, c);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = await profileService.getProfile(userId);

    if ("error" in user) {
      logger.warn("User injection failed - User not found", { userId });
      return c.json({ error: "User not found" }, 404);
    }

    // Inject user into context
    c.set("user", user);

    logger.debug("User injected into context", { userId: user.id }, c);

    await next();
  } catch (error) {
    logger.error(
      "User injection middleware error",
      {
        error: error instanceof Error ? error.message : error,
      },
      c
    );
    return c.json({ error: "Internal server error" }, 500);
  }
};

/**
 * Helper function to get user from context with type safety
 * Use this in your controllers instead of c.get("user")
 */
export const getUser = (c: Context) => {
  const user = c.get("user");
  if (!user) {
    throw new Error(
      "User not found in context. Did you forget to use injectUser middleware?"
    );
  }
  return user;
};
