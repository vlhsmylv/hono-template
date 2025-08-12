import { prisma } from "@/prisma";
import { logger } from "@/middleware/logger";

export class ProfileService {
  async getProfile(userId: string) {
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn("User injection failed - User not found", { userId });
      return { error: "User not found" };
    }

    return user;
  }
}
