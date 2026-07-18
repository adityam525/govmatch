/*
  Warnings:

  - You are about to drop the column `type` on the `Organization` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'APPRENTICE', 'INTERNSHIP', 'TEMPORARY', 'DEPUTATION');

-- DropIndex
DROP INDEX "Organization_type_idx";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "type",
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "employmentType" "EmploymentType" NOT NULL DEFAULT 'PERMANENT';

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "preferredEmploymentTypes" "EmploymentType"[] DEFAULT ARRAY[]::"EmploymentType"[];

-- DropEnum
DROP TYPE "OrgType";

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "n" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "qualificationGroup" TEXT NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostBranches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostBranches_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PreferredRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PreferredRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PostRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_n_key" ON "Branch"("n");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_slug_key" ON "Branch"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "_PostBranches_B_index" ON "_PostBranches"("B");

-- CreateIndex
CREATE INDEX "_PreferredRoles_B_index" ON "_PreferredRoles"("B");

-- CreateIndex
CREATE INDEX "_PostRoles_B_index" ON "_PostRoles"("B");

-- CreateIndex
CREATE INDEX "Organization_categoryId_idx" ON "Organization"("categoryId");

-- CreateIndex
CREATE INDEX "UserProfile_qualificationId_idx" ON "UserProfile"("qualificationId");

-- CreateIndex
CREATE INDEX "UserProfile_branchId_idx" ON "UserProfile"("branchId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "Qualification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostBranches" ADD CONSTRAINT "_PostBranches_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostBranches" ADD CONSTRAINT "_PostBranches_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredRoles" ADD CONSTRAINT "_PreferredRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredRoles" ADD CONSTRAINT "_PreferredRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostRoles" ADD CONSTRAINT "_PostRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostRoles" ADD CONSTRAINT "_PostRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
