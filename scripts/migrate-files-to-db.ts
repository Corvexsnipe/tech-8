import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

// One-off backfill: moves images still stored on disk (rows where the bytea
// column is NULL) into Business.logoData / Attachment.data so nothing depends
// on UPLOAD_DIR. Run: npx tsx scripts/migrate-files-to-db.ts [--apply]
if (!process.env.DATABASE_URL && existsSync(".env")) process.loadEnvFile();

const apply = process.argv.includes("--apply");
const KEY_PATTERN = /^[a-f0-9]{48}\.webp$/;

async function main() {
  const dir = process.env.UPLOAD_DIR;
  if (!dir || !path.isAbsolute(dir)) throw new Error("UPLOAD_DIR must be an absolute path to the legacy upload directory.");
  const prisma = new PrismaClient({ log: [] });
  let migrated = 0, missing = 0;
  try {
    const businesses = await prisma.business.findMany({ where: { logoKey: { not: null }, logoData: null }, select: { id: true, logoKey: true } });
    const attachments = await prisma.attachment.findMany({ where: { data: null }, select: { id: true, storageKey: true } });
    console.log(`Legacy disk-only rows: ${businesses.length} logo(s), ${attachments.length} attachment(s)`);
    for (const b of businesses) {
      if (!b.logoKey || !KEY_PATTERN.test(b.logoKey)) { console.log(`  logo ${b.id}: invalid key, skipped`); missing++; continue; }
      const file = path.join(dir, b.logoKey);
      try {
        const bytes = await readFile(file);
        if (apply) await prisma.business.update({ where: { id: b.id }, data: { logoData: bytes, logoSize: bytes.length } });
        console.log(`  logo ${b.id}: ${bytes.length} bytes ${apply ? "migrated" : "(dry run)"}`); migrated++;
      } catch { console.log(`  logo ${b.id}: file ${b.logoKey} not found on disk`); missing++; }
    }
    for (const a of attachments) {
      if (!KEY_PATTERN.test(a.storageKey)) { console.log(`  attachment ${a.id}: invalid key, skipped`); missing++; continue; }
      const file = path.join(dir, a.storageKey);
      try {
        const bytes = await readFile(file);
        if (apply) await prisma.attachment.update({ where: { id: a.id }, data: { data: bytes } });
        console.log(`  attachment ${a.id}: ${bytes.length} bytes ${apply ? "migrated" : "(dry run)"}`); migrated++;
      } catch { console.log(`  attachment ${a.id}: file ${a.storageKey} not found on disk`); missing++; }
    }
    console.log(`${apply ? "Migrated" : "Would migrate"} ${migrated} file(s); ${missing} skipped.`);
  } finally { await prisma.$disconnect(); }
}
main().catch(error => {
  console.error("Migration failed:", error instanceof Error ? error.message.slice(0, 300) : "unknown");
  process.exitCode = 1;
});
