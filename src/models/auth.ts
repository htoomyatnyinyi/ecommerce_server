// // import { PrismaClient } from "@prisma/client";

// // const prisma = new PrismaClient();

// // import prisma from "../config/database";

// export async function createUser(data: {
//   username: string;
//   email: string;
//   password?: string;
//   googleId?: string;
// }) {
//   return prisma.user.create({
//     data: {
//       ...data,
//       role: "USER",
//       isEmailVerified: !!data.googleId, // Google users are auto-verified
//     },
//   });
// }

// export async function findUserByEmailOrUsername(
//   email: string,
//   username: string
// ) {
//   return prisma.user.findFirst({
//     where: { OR: [{ email }, { username }] },
//   });
// }

// export async function findUserByGoogleId(googleId: string) {
//   return prisma.user.findUnique({
//     where: { googleId },
//   });
// }

// export async function createVerificationToken(
//   userId: string,
//   token: string,
//   expiresAt: Date
// ) {
//   return prisma.emailVerificationToken.create({
//     data: { token, userId, expiresAt },
//   });
// }

// export async function createPasswordResetToken(
//   userId: string,
//   token: string,
//   expiresAt: Date
// ) {
//   return prisma.passwordResetToken.create({
//     data: { token, userId, expiresAt },
//   });
// }

// export async function findVerificationToken(token: string) {
//   return prisma.emailVerificationToken.findUnique({
//     where: { token },
//     include: { user: true },
//   });
// }

// export async function findPasswordResetToken(token: string) {
//   return prisma.passwordResetToken.findUnique({
//     where: { token },
//     include: { user: true },
//   });
// }

// export async function updateUser(
//   id: string,
//   data: { isEmailVerified?: boolean; password?: string }
// ) {
//   return prisma.user.update({
//     where: { id },
//     data,
//   });
// }

// export async function deleteVerificationToken(id: string) {
//   return prisma.emailVerificationToken.delete({ where: { id } });
// }

// export async function deletePasswordResetToken(id: string) {
//   return prisma.passwordResetToken.delete({ where: { id } });
// }

// export async function deleteUser(id: string) {
//   return prisma.user.delete({ where: { id } });
// }
