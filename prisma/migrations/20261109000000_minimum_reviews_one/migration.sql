-- Public grades appear after a single published review.
ALTER TABLE "PlatformConfig" ALTER COLUMN "minimumReviews" SET DEFAULT 1;
UPDATE "PlatformConfig" SET "minimumReviews" = 1 WHERE "id" = 'platform' AND "minimumReviews" = 3;
