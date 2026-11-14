import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";

if (!process.env.DATABASE_URL && existsSync(".env")) process.loadEnvFile();

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Database must be configured.");
  const prisma = new PrismaClient({ log: [] });
  try {
    const now = new Date(), cutoff = new Date(Date.now() - 86400_000);
    await prisma.session.deleteMany({ where: { expiresAt: { lt: now } } });
    await prisma.accountToken.deleteMany({ where: { expiresAt: { lt: now } } });
    await prisma.rateBucket.deleteMany({ where: { expiresAt: { lt: now } } });
    const orphans = await prisma.attachment.findMany({ where: { reviewId: null, createdAt: { lt: cutoff } }, take: 1000 });
    for (const item of orphans) {
      await prisma.attachment.deleteMany({ where: { id: item.id, reviewId: null, createdAt: { lt: cutoff } } });
    }
    console.log("Expired credentials, rate buckets, and orphaned uploads cleaned. Reviews and audit records were preserved.");
  } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.error("Maintenance failed. Check configuration privately."); process.exitCode = 1; });
