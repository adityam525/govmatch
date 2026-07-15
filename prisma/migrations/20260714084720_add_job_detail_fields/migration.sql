-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "applicationFeeGeneral" TEXT,
ADD COLUMN     "applicationFeeScSt" TEXT,
ADD COLUMN     "howToApply" TEXT,
ADD COLUMN     "selectionProcess" TEXT[] DEFAULT ARRAY[]::TEXT[];
