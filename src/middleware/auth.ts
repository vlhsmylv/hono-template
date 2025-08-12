import { Context } from "hono";
import * as jwt from "jsonwebtoken";
import { getCookie, setCookie } from "hono/cookie";
import { logger } from "./logger";
import { cookieOptions } from "@/modules/auth/auth.utils";

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const accessToken = getCookie(c, "accessToken");
  const refreshToken = getCookie(c, "refreshToken");

  // No tokens at all
  if (!accessToken && !refreshToken) {
    logger.warn("Auth failed - No tokens provided", {}, c);
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Try access token first
  if (accessToken) {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as {
        id: string;
      };
      c.set("userId", decoded.id);
      await next();
      return;
    } catch (error) {
      // Access token is invalid/expired, try refresh token
      logger.debug(
        "Access token invalid, attempting refresh",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        c
      );
    }
  }

  // Try refresh token
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as {
        id: string;
      };

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1h" }
      );

      // Set new access token cookie
      setCookie(c, "accessToken", newAccessToken, cookieOptions.access);

      c.set("userId", decoded.id);

      logger.info("Token refreshed successfully", { userId: decoded.id }, c);
      await next();
      return;
    } catch (error) {
      logger.warn(
        "Auth failed - Invalid refresh token",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        c
      );
    }
  }

  // Both tokens failed
  logger.warn("Auth failed - All tokens invalid", {}, c);
  return c.json({ error: "Unauthorized" }, 401);
};
