-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "qualificationId" TEXT;

-- CreateIndex
CREATE INDEX "Branch_qualificationId_idx" ON "Branch"("qualificationId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "Qualification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
