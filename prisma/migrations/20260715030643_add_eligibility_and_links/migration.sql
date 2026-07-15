-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('APPLY_ONLINE', 'NOTIFICATION_PDF', 'OFFICIAL_WEBSITE', 'ADMIT_CARD', 'RESULT', 'SYLLABUS', 'SHORT_NOTICE', 'OTHER');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "ageRelaxation" JSONB,
ADD COLUMN     "educationDetails" TEXT,
ADD COLUMN     "physicalCriteria" JSONB;

-- CreateTable
CREATE TABLE "NotificationLink" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "linkType" "LinkType" NOT NULL DEFAULT 'OTHER',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationLink_notificationId_idx" ON "NotificationLink"("notificationId");

-- AddForeignKey
ALTER TABLE "NotificationLink" ADD CONSTRAINT "NotificationLink_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
