-- CreateTable
CREATE TABLE "TransferLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fromId" INTEGER NOT NULL,
    "toId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransferLog" ADD CONSTRAINT "TransferLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferLog" ADD CONSTRAINT "TransferLog_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferLog" ADD CONSTRAINT "TransferLog_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
