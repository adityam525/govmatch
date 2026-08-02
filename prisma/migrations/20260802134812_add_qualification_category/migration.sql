-- DropIndex
DROP INDEX "Post_qualificationId_idx";

-- DropIndex
DROP INDEX "UserProfile_qualificationId_idx";

-- CreateTable
CREATE TABLE "QualificationCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QualificationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QualificationToQualificationCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_QualificationToQualificationCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "QualificationCategory_name_key" ON "QualificationCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QualificationCategory_slug_key" ON "QualificationCategory"("slug");

-- CreateIndex
CREATE INDEX "_QualificationToQualificationCategory_B_index" ON "_QualificationToQualificationCategory"("B");

-- AddForeignKey
ALTER TABLE "_QualificationToQualificationCategory" ADD CONSTRAINT "_QualificationToQualificationCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Qualification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QualificationToQualificationCategory" ADD CONSTRAINT "_QualificationToQualificationCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "QualificationCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
