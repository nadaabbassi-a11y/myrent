import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo1234", 10);

  const landlord = await prisma.user.upsert({
    where: { email: "marie.proprio@myrent.test" },
    update: {},
    create: {
      email: "marie.proprio@myrent.test",
      name: "Marie Tremblay",
      passwordHash,
      role: "LANDLORD",
      landlordProfile: { create: { phone: "514-555-0101" } },
    },
    include: { landlordProfile: true },
  });

  const tenant = await prisma.user.upsert({
    where: { email: "alex.locataire@myrent.test" },
    update: {},
    create: {
      email: "alex.locataire@myrent.test",
      name: "Alex Nguyen",
      passwordHash,
      role: "TENANT",
      tenantProfile: { create: { phone: "514-555-0199" } },
    },
    include: { tenantProfile: true },
  });

  let profile = landlord.landlordProfile;
  if (!profile) {
    profile = await prisma.landlordProfile.create({ data: { userId: landlord.id } });
  }
  let tenantProfile = tenant.tenantProfile;
  if (!tenantProfile) {
    tenantProfile = await prisma.tenantProfile.create({ data: { userId: tenant.id } });
  }

  const listing = await prisma.listing.upsert({
    where: { id: "demo-logement-plateau" },
    update: {},
    create: {
      id: "demo-logement-plateau",
      title: "4 1/2 · Montréal",
      description: "Logement de démonstration au Plateau.",
      price: 1450,
      city: "Montréal",
      address: "1230 rue Saint-Denis",
      postalCode: "H2X 3J4",
      bedrooms: 2,
      bathrooms: 1,
      deposit: 1450,
      landlordId: profile.id,
      status: "active",
    },
  });

  const existingApp = await prisma.application.findFirst({
    where: { listingId: listing.id, tenantId: tenantProfile.id },
  });

  const application =
    existingApp ??
    (await prisma.application.create({
      data: {
        listingId: listing.id,
        tenantId: tenantProfile.id,
        landlordId: profile.id,
        status: "SUBMITTED",
        steps: {
          create: [
            "identity",
            "address",
            "status",
            "income",
            "occupants",
            "references",
            "documents",
            "consents",
          ].map((stepKey) => ({ stepKey, isComplete: true })),
        },
        answers: {
          create: [
            {
              stepKey: "identity",
              data: JSON.stringify({ firstName: "Alex", lastName: "Nguyen", phone: "514-555-0199" }),
            },
            {
              stepKey: "income",
              data: JSON.stringify({ monthlyIncome: 4200, employer: "Studio Nord" }),
            },
          ],
        },
        consents: {
          create: [
            { type: "CREDIT_CHECK", textVersion: "demo" },
            { type: "DATA_SHARING", textVersion: "demo" },
          ],
        },
        creditCheck: {
          create: { status: "CONSENTED" },
        },
      },
    }));

  if (existingApp) {
    await prisma.creditCheck.upsert({
      where: { applicationId: existingApp.id },
      create: { applicationId: existingApp.id, status: "CONSENTED" },
      update: {},
    });
  }

  console.log("Seed OK");
  console.log("Propriétaire : marie.proprio@myrent.test / Demo1234");
  console.log("Locataire    : alex.locataire@myrent.test / Demo1234");
  console.log("Location     :", listing.id, application.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
