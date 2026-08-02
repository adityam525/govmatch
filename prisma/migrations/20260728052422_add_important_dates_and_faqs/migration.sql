-- CreateTable
CREATE TABLE "ImportantDate" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportantDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationFAQ" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationFAQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportantDate_notificationId_idx" ON "ImportantDate"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationFAQ_notificationId_idx" ON "NotificationFAQ"("notificationId");

-- AddForeignKey
ALTER TABLE "ImportantDate" ADD CONSTRAINT "ImportantDate_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationFAQ" ADD CONSTRAINT "NotificationFAQ_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
