-- CreateEnum
CREATE TYPE "ApplicationMode" AS ENUM ('ONLINE', 'OFFLINE', 'BOTH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UPCOMING', 'LIVE', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('PRELIMS', 'MAINS', 'MERIT_LIST', 'FINAL', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "AnswerKeyType" AS ENUM ('PROVISIONAL', 'FINAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SYLLABUS', 'EXAM_PATTERN', 'SELECTION_PROCESS', 'PREVIOUS_PAPER', 'EXAM_CALENDAR', 'OTHER');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'EXAM_SCHEDULED', 'RESULT_AWAITED', 'SELECTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Qualification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "advertisementNo" TEXT,
    "totalVacancies" INTEGER NOT NULL DEFAULT 0,
    "applicationMode" "ApplicationMode" NOT NULL DEFAULT 'ONLINE',
    "officialLink" TEXT NOT NULL,
    "notificationDate" TIMESTAMP(3),
    "applicationStartDate" TIMESTAMP(3),
    "applicationEndDate" TIMESTAMP(3),
    "examDate" TIMESTAMP(3),
    "status" "NotificationStatus" NOT NULL DEFAULT 'LIVE',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vacancies" INTEGER NOT NULL DEFAULT 0,
    "qualificationId" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "ageRelaxationNotes" TEXT,
    "payScale" TEXT,
    "categoryWiseVacancies" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmitCard" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "examDate" TIMESTAMP(3),
    "downloadLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmitCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "resultType" "ResultType" NOT NULL DEFAULT 'FINAL',
    "releaseDate" TIMESTAMP(3),
    "resultLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerKey" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "keyType" "AnswerKeyType" NOT NULL DEFAULT 'PROVISIONAL',
    "releaseDate" TIMESTAMP(3),
    "downloadLink" TEXT NOT NULL,
    "objectionEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT,
    "title" TEXT NOT NULL,
    "docType" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "category" TEXT,
    "stateId" TEXT,
    "qualificationId" TEXT,
    "degreeName" TEXT,
    "yearOfPassing" INTEGER,
    "percentage" DOUBLE PRECISION,
    "resumeUrl" TEXT,
    "profileStrength" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NotificationCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NotificationCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_NotificationStates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NotificationStates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Qualification_name_key" ON "Qualification"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Qualification_slug_key" ON "Qualification"("slug");

-- CreateIndex
CREATE INDEX "Qualification_level_idx" ON "Qualification"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_slug_key" ON "Notification"("slug");

-- CreateIndex
CREATE INDEX "Notification_applicationEndDate_idx" ON "Notification"("applicationEndDate");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_isFeatured_idx" ON "Notification"("isFeatured");

-- CreateIndex
CREATE INDEX "Post_notificationId_idx" ON "Post"("notificationId");

-- CreateIndex
CREATE INDEX "Post_qualificationId_idx" ON "Post"("qualificationId");

-- CreateIndex
CREATE INDEX "AdmitCard_notificationId_idx" ON "AdmitCard"("notificationId");

-- CreateIndex
CREATE INDEX "AdmitCard_releaseDate_idx" ON "AdmitCard"("releaseDate");

-- CreateIndex
CREATE INDEX "Result_notificationId_idx" ON "Result"("notificationId");

-- CreateIndex
CREATE INDEX "Result_releaseDate_idx" ON "Result"("releaseDate");

-- CreateIndex
CREATE INDEX "AnswerKey_notificationId_idx" ON "AnswerKey"("notificationId");

-- CreateIndex
CREATE INDEX "Document_docType_idx" ON "Document"("docType");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_notificationId_key" ON "SavedJob"("userId", "notificationId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_notificationId_key" ON "Application"("userId", "notificationId");

-- CreateIndex
CREATE INDEX "_NotificationCategories_B_index" ON "_NotificationCategories"("B");

-- CreateIndex
CREATE INDEX "_NotificationStates_B_index" ON "_NotificationStates"("B");

-- CreateIndex
CREATE INDEX "Organization_type_idx" ON "Organization"("type");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "Qualification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmitCard" ADD CONSTRAINT "AdmitCard_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerKey" ADD CONSTRAINT "AnswerKey_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationCategories" ADD CONSTRAINT "_NotificationCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationCategories" ADD CONSTRAINT "_NotificationCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationStates" ADD CONSTRAINT "_NotificationStates_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationStates" ADD CONSTRAINT "_NotificationStates_B_fkey" FOREIGN KEY ("B") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;
