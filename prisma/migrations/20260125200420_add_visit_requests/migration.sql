-- CreateTable
CREATE TABLE "visit_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "preferredDate" DATETIME,
    "preferredTime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "visit_requests_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "visit_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
