import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import cors from "./utils/cors";
import docs from "./utils/docs";
import { v1 } from "./versions";
import { serveStatic } from "hono/bun";
import { customLogger } from "./middleware/logger";

const app = new OpenAPIHono();

// Logger
app.use(logger(customLogger));

// CORS
cors(app);

// Docs
docs(app);

// Routes
app.route("/api/v1", v1);

// Health check
app.use("/", serveStatic({ root: "./src/public" }));

// Error handling middleware
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: "Internal Server Error" }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

export default {
  port: Number(process.env.PORT) || 3003,
  fetch: app.fetch,
};
