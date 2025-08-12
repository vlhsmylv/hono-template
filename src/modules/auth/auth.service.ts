import { prisma } from "@/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterInput } from "./auth.schema";
import { Prisma } from "@prisma/client";

export class AuthService {
  async login({ email, password }: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not registered", {
        cause: "User not registered",
      });
    }

    if (!user.password) {
      throw new Error("Invalid password", {
        cause: "Invalid password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password", {
        cause: "Invalid password",
      });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return { accessToken, refreshToken };
  }

  async register({ email, password, name, surname }: RegisterInput) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          surname,
        },
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET!,
        {
          expiresIn: "1h",
        }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET!,
        {
          expiresIn: "7d",
        }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("User already exists", {
            cause: "User already exists",
          });
        }
      }
      throw error;
    }
  }
}
