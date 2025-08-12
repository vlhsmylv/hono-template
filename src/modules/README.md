# 📁 API Modules Structure

This directory contains all API modules following a clean architecture pattern with separation of concerns.

## 🏗️ Module Structure

Each module follows this standardized structure:

```
modules/
├── [module-name]/
│   ├── [module].controller.ts  # HTTP request handlers & OpenAPI docs
│   ├── [module].service.ts     # Business logic layer
│   ├── [module].schema.ts      # Zod validation schemas
│   └── index.ts               # Module exports
```

## 📋 Current Modules

### 🔐 Auth Module (`/api/v1/auth`)

- **Controller**: `auth.controller.ts` - Authentication endpoints
- **Service**: `auth.service.ts` - Authentication business logic
- **Schema**: `auth.schema.ts` - Login/register validation
- **Utils**: `auth.utils.ts` - Cookie configuration
- **Features**:
  - ✅ User registration with validation
  - ✅ Login with password verification
  - ✅ Logout with cookie cleanup
  - ✅ JWT access & refresh tokens
  - ✅ Bcrypt password hashing
  - ✅ Comprehensive error handling

### 👥 Users Module (`/api/v1/users`)

- **Controller**: `users.controller.ts` - User management endpoints
- **Service**: `users.service.ts` - User business logic
- **Schema**: `user.schema.ts` - User validation schemas
- **Features**:
  - ✅ CRUD operations with validation
  - ✅ Email uniqueness validation
  - ✅ Protected routes with auth middleware
  - ✅ OpenAPI documentation

### 👤 Profile Module (`/api/v1/profile`)

- **Controller**: `profile.controller.ts` - User profile endpoints
- **Service**: `profile.service.ts` - Profile business logic
- **Features**:
  - ✅ Get user profile with auto-injection
  - ✅ Decorator pattern usage (`withUser`)
  - ✅ Type-safe user context

## 🆕 Adding a New Module

Follow these steps to create a new API module:

### 1. Create Module Files

```bash
# Create the module directory
mkdir src/modules/[module-name]

# Create the core files
touch src/modules/[module-name]/[module].controller.ts
touch src/modules/[module-name]/[module].service.ts
touch src/modules/[module-name]/[module].schema.ts
touch src/modules/[module-name]/index.ts
```

### 2. Define Prisma Model

Add your model to `prisma/schema.prisma`:

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

### 3. Create Zod Schemas (`[module].schema.ts`)

```typescript
import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
```

### 4. Create Service (`[module].service.ts`)

```typescript
import { prisma } from "@/prisma";
import type { CreateProduct, UpdateProduct } from "./product.schema";

export class ProductService {
  async findAll() {
    return await prisma.product.findMany();
  }

  async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: CreateProduct) {
    return await prisma.product.create({
      data,
    });
  }

  async update(id: string, data: UpdateProduct) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }
}
```

### 5. Create Controller (`[module].controller.ts`)

```typescript
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { ProductService } from "./product.service";
import {
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
} from "./product.schema";

const productService = new ProductService();
export const productController = new OpenAPIHono();

// GET /products
const getProducts = createRoute({
  method: "get",
  path: "/",
  tags: ["Products"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(ProductSchema),
        },
      },
      description: "List of products",
    },
  },
});

productController.openapi(getProducts, async (c) => {
  const products = await productService.findAll();
  return c.json(products);
});

// POST /products
const createProduct = createRoute({
  method: "post",
  path: "/",
  tags: ["Products"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateProductSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: ProductSchema,
        },
      },
      description: "Product created",
    },
  },
});

productController.openapi(createProduct, async (c) => {
  const data = c.req.valid("json");
  const product = await productService.create(data);
  return c.json(product, 201);
});

// Add more routes as needed...
```

### 6. Create Index (`index.ts`)

```typescript
export { productController } from "./product.controller";
export { ProductService } from "./product.service";
export * from "./product.schema";
```

### 7. Mount in Main App

Add to version file (`src/versions/v1.ts`):

```typescript
import { productController } from "@/modules/products";

// Mount the routes with versioning
app.route("/products", productController);
```

Then mount the version in `src/index.ts`:

```typescript
import v1Routes from "@/versions/v1";

// Mount versioned routes
app.route("/api/v1", v1Routes);
```

## 🔄 API Versioning Strategy

This template follows a structured versioning approach:

```
src/
├── versions/
│   ├── v1.ts              # Version 1 routes
│   └── v2.ts              # Version 2 routes (future)
└── modules/
    └── [module]/          # Version-agnostic modules
```

### Benefits:

- **Backward Compatibility**: Keep old versions running
- **Clean Separation**: Each version is isolated
- **Easy Migration**: Modules can be reused across versions
- **Clear URLs**: `/api/v1/users`, `/api/v2/users`

### Version Management:

```typescript
// src/versions/v1.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { usersController } from "@/modules/users";

const app = new OpenAPIHono();

app.route("/users", usersController);
// Add more v1 routes...

export default app;
```

## 📋 Best Practices

- ✅ **Single Responsibility**: Each file has one clear purpose
- ✅ **Type Safety**: Use TypeScript and Zod for runtime validation
- ✅ **OpenAPI Docs**: Document all endpoints with proper schemas
- ✅ **Error Handling**: Handle errors gracefully with proper HTTP codes
- ✅ **Validation**: Validate inputs using Zod schemas
- ✅ **Database**: Use Prisma for type-safe database operations
- ✅ **Testing**: Write tests for services and controllers
- ✅ **Security**: Implement proper authentication and authorization

## 🔧 Common Patterns

### Error Handling

```typescript
try {
  const product = await productService.findById(id);
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  return c.json(product);
} catch (error) {
  return c.json({ error: "Internal server error" }, 500);
}
```

### Pagination

```typescript
const page = Number(c.req.query("page")) || 1;
const limit = Number(c.req.query("limit")) || 10;
const skip = (page - 1) * limit;

const products = await prisma.product.findMany({
  skip,
  take: limit,
});
```

### Authentication

```typescript
import { authMiddleware } from "@/middleware/auth";

// Protected route
productController.use("/*", authMiddleware);
```
