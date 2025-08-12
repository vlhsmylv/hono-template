import type { Context, Handler } from "hono";
import { getUser } from "@/middleware/user-injection";

/**
 * Decorator-like helper for extracting user from context
 * Now with proper OpenAPI typing support
 */

// Type for controller function that needs user - returns Promise to match async handlers
type ControllerWithUser = (
  user: ReturnType<typeof getUser>,
  c: Context
) => Promise<Response> | Response;

/**
 * Higher-order function that injects user as first parameter
 * Compatible with OpenAPI routes
 * Usage: withUser((user, c) => { ... })
 */
export const withUser = (handler: ControllerWithUser): Handler => {
  return async (c: Context) => {
    const user = getUser(c);
    return await handler(user, c);
  };
};

/**
 * Alternative: Extract multiple context values at once
 */
type ContextExtractor<T> = (c: Context) => T;

export const withContext = <T>(extractor: ContextExtractor<T>) => {
  return <R>(handler: (extracted: T, c: Context) => R) => {
    return (c: Context): R => {
      const extracted = extractor(c);
      return handler(extracted, c);
    };
  };
};

// Pre-built extractors
export const extractUser = (c: Context) => getUser(c);
export const extractUserWithId = (c: Context) => ({
  user: getUser(c),
  requestId: c.get("requestContext")?.requestId,
});

// Example usage:
// const getUserProfile = withUser((user, c) => {
//   return c.json({ profile: user });
// });
//
// const getUserWithContext = withContext(extractUserWithId)((data, c) => {
//   return c.json({ user: data.user, requestId: data.requestId });
// });
