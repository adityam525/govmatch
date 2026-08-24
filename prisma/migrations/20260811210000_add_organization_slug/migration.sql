ALTER TABLE "Organization"
ADD COLUMN "slug" TEXT NOT NULL;

CREATE UNIQUE INDEX "Organization_slug_key"
ON "Organization"("slug");
