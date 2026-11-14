-- Store sanitized attachment image bytes in the database (bytea) instead of only on disk.

ALTER TABLE "Attachment" ADD COLUMN "data" BYTEA;
