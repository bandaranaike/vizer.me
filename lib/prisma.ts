// import { PrismaClient } from "@prisma/client";
// Force Node-friendly query engine; avoid accidental "client" engine that expects Accelerate/adapter.
process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";

// Load Prisma after env override so generated client picks the correct engine type.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@/lib/generated/prisma") as typeof import("@/lib/generated/prisma");

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        // datasourceUrl can be configured via env; override handled by prisma.config.ts
        // Avoid passing unsupported options to the generated client.
        // https://pris.ly/d/client-constructor
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
