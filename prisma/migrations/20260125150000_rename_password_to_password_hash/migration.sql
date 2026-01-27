-- Step 1: Add new column
ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT;

-- Step 2: Copy data from old column to new column
UPDATE "users" SET "passwordHash" = "password" WHERE "passwordHash" IS NULL;

-- Step 3: Create new table structure
CREATE TABLE "users_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TENANT',
    "emailVerified" DATETIME,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Step 4: Copy all data to new table
INSERT INTO "users_new" SELECT "id", "email", "name", "passwordHash", "role", "emailVerified", "image", "createdAt", "updatedAt" FROM "users";

-- Step 5: Drop old table
DROP TABLE "users";

-- Step 6: Rename new table
ALTER TABLE "users_new" RENAME TO "users";

-- Step 7: Recreate unique constraint
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

