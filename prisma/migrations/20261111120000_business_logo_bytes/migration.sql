-- Store sanitized business logo bytes in the database (bytea) alongside proof attachments.

ALTER TABLE "Business" ADD COLUMN "logoData" BYTEA;
