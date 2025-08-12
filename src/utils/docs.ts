import { createFiberplane } from "@fiberplane/hono";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";

export default function docs(app: OpenAPIHono) {
  if (
    process.env.NODE_ENV === "testing" ||
    process.env.NODE_ENV === "development"
  ) {
    // OpenAPI
    app.doc("/docs", {
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Hono Template",
      },
    });

    // Swagger UI
    app.get("/swagger", swaggerUI({ url: "/docs" }));

    app.use(
      "/fp/*",
      createFiberplane({
        app,
        openapi: { url: "/docs" },
      })
    );
  }
}
