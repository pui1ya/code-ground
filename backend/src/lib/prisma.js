/**
 * ---------------------------------------------------------
 * Code Ground
 * Prisma Client
 * ---------------------------------------------------------
 * Creates a single Prisma client instance.
 * Every service/controller will import this file.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;