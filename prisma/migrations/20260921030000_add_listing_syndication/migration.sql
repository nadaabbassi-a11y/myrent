-- CreateTable
CREATE TABLE "listing_syndications" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "externalUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_syndications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listing_syndications_listingId_platform_key" ON "listing_syndications"("listingId", "platform");

-- AddForeignKey
ALTER TABLE "listing_syndications" ADD CONSTRAINT "listing_syndications_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
