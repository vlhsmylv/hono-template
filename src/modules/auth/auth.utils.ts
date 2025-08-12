import { CookieOptions } from "hono/utils/cookie";

export const cookieOptions: Record<string, CookieOptions> = {
  access: {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  },
  refresh: {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  },
};
