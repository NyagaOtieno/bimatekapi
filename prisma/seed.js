// File: prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // ✅ Create or update admin user
  const user = await prisma.user.upsert({
    where: { email: 'admin@bimatek.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@bimatek.com',
      password: 'hashed_password_here', // Replace with hashed version
    },
  });

  // ✅ Create or update client
  const client = await prisma.client.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0700123456',
      address: '123 Test Street',
      userId: user.id,
    },
  });

  // ✅ Comprehensive product
  const compProduct = await prisma.product.upsert({
    where: {
      vehicleClass_coverage_make_yearOfManufacture_period_agentcode: {
        vehicleClass: 'MOTORCYCLE_PRIVATE',
        coverage: 'Comprehensive',
        make: 'Boxer',
        yearOfManufacture: 2022,
        period: '12',
        agentcode: '31212',
      },
    },
    update: {},
    create: {
      name: 'BodaBoda Comprehensive',
      description: 'Affordable comprehensive cover for boda boda.',
      basePremium: 0.03,
      underwriter: 'Xtra Insurance Co.',
      vehicleClass: 'MOTORCYCLE_PRIVATE',
      coverage: 'Comprehensive',
      period: '12',
      value: 120000,
      make: 'Boxer',
      yearOfManufacture: 2022,
      tonnage: 0,
      passengers: 1,
      agentcode: '31212',
      minAge: 0,
      maxAge: 10,
      minValue: 50000,
      maxValue: 300000,
    },
  });

  // ✅ TPO product (handle null make/yearOfManufacture manually)
let tpoProduct = await prisma.product.findFirst({
  where: {
    vehicleClass: 'PSV_MATATU',
    coverage: 'TPO',
    make: null,
    yearOfManufacture: null,
    period: '1',
    agentcode: '31212',
  },
});

if (tpoProduct) {
  tpoProduct = await prisma.product.update({
    where: { id: tpoProduct.id },
    data: {
      premium_week: 700,
      premium_2weeks: 1300,
      premium_month: 2500,
      premium_3months: 7000,
      premium_6months: 13000,
      premium_annual: 24000,
    },
  });
} else {
  tpoProduct = await prisma.product.create({
    data: {
      name: 'Matatu TPO Cover',
      description: 'TPO for PSV Matatu with multiple period rates.',
      underwriter: 'Xtra Insurance Co.',
      vehicleClass: 'PSV_MATATU',
      coverage: 'TPO',
      period: '1',
      make: null,
      yearOfManufacture: null,
      agentcode: '31212',
      premium_week: 700,
      premium_2weeks: 1300,
      premium_month: 2500,
      premium_3months: 7000,
      premium_6months: 13000,
      premium_annual: 24000,
      passengers: 14,
      basePremium: 0,
    },
  });
}


  // ✅ Create quote for comprehensive product
  const quote = await prisma.quote.create({
    data: {
      productId: compProduct.id,
      userId: user.id,
      price: 3600,
      value: 120000,
      period: '12',
      make: 'Boxer',
      yearOfManufacture: 2022,
      agent_code: '31212',
      name_contact: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: '0700123456',
      vehicle_reg: 'KDA123A',
      cover: 'Comprehensive',
      tonnage: 0,
      passengers: 1,
    },
  });

  // ✅ Create policy from quote
  const policy = await prisma.policy.create({
    data: {
      quoteId: quote.id,
      productId: compProduct.id,
      userId: user.id,
      clientId: client.id,
    },
  });

  // ✅ Create claim for the policy
  await prisma.claim.create({
  data: {
    policyId: policy.id,
    reason: "Accident repair",
    amount: 800,
    clientId: client.id,
    status: "Pending", //  Add a real string value
  },
});


  console.log('🌱 Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
