import { cors as corsMiddleware } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";

export default function cors(app: OpenAPIHono) {
  app.use(
    "*",
    corsMiddleware({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
      ],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
}
