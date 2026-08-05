/*
  Warnings:

  - Made the column `qualificationId` on table `Branch` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_qualificationId_fkey";

-- AlterTable
ALTER TABLE "Branch" ALTER COLUMN "qualificationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "Qualification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
