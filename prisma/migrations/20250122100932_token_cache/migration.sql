-- CreateTable
CREATE TABLE "TokenCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "creator" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "description" TEXT
);
