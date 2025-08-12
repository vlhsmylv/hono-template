import { prisma } from "@/prisma";

export class UserService {
  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async createUser(userData: {
    name: string;
    surname: string;
    email: string;
    password: string;
  }) {
    const result = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return result;
  }

  async getUserById(id: string) {
    const result = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return result;
  }

  async updateUser(
    id: string,
    userData: Partial<{
      name: string;
      surname: string;
      email: string;
    }>
  ) {
    const result = await prisma.user.update({
      where: {
        id,
      },
      data: userData,
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return result;
  }

  async deleteUser(id: string) {
    const result = await prisma.user.delete({
      where: {
        id,
      },
    });
    return result;
  }
}
