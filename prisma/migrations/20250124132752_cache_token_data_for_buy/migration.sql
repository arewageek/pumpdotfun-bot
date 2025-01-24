-- CreateTable
CREATE TABLE "TokenBuySession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chatId" TEXT NOT NULL,
    "tokenCA" TEXT,
    "tokenAmount" INTEGER
);
