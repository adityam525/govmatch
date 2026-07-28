-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "payScaleMax" INTEGER,
ADD COLUMN     "payScaleMin" INTEGER;
