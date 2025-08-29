const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ Create underwriter if missing
exports.ensureUnderwriter = async (name) => {
  if (!name) throw new Error("Underwriter name is required");

  let underwriter = await prisma.underwriter.findUnique({ where: { name } });

  if (!underwriter) {
    underwriter = await prisma.underwriter.create({
      data: { name },
    });
    console.log(`✅ Auto-created underwriter: ${name}`);
  }

  return underwriter;
};

// ✅ API endpoint to sync all seed underwriters
exports.seedUnderwriters = async (req, res) => {
  try {
    const underwriters = [
      "AAR Insurance (Kenya) Ltd",
      "Africa Merchant Assurance Company Ltd (AMACO)",
      "AIG Kenya Insurance Company Ltd",
      "APA Insurance Ltd",
      "Britam General Insurance Company (K) Ltd",
      "Cannon General Insurance Company Ltd",
      "CIC General Insurance Ltd",
      "Corporate Insurance Company Ltd",
      "Directline Assurance Company Ltd",
      "Fidelity Shield Insurance Company Ltd",
      "First Assurance Company Ltd",
      "GA Insurance Ltd",
      "ICEA LION General Insurance Company Ltd",
      "Intra Africa Assurance Company Ltd",
      "Jubilee General Insurance Ltd",
      "Kenindia Assurance Company Ltd",
      "Kenya Orient Insurance Ltd",
      "Madison Insurance Company Kenya Ltd",
      "Mayfair Insurance Company Ltd",
      "Occidental Insurance Company Ltd",
      "Old Mutual General Insurance Kenya Ltd",
      "PACIS Insurance Company Ltd",
      "Pioneer General Insurance Ltd",
      "Sanlam General Insurance Ltd",
      "Takaful Insurance of Africa Ltd",
      "Trident Insurance Company Ltd",
      "Definate Insurance Company Ltd"
    ];

    for (const name of underwriters) {
      await prisma.underwriter.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    return res.json({ message: "✅ Underwriters synced successfully" });
  } catch (err) {
    console.error("❌ Error seeding underwriters:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
