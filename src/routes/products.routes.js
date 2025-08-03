router.post('/', async (req, res) => {
  const {
    name,
    description,
    basePremium,
    underwriter,
    vehicleClass,
    coverage,
    period,
    value,
    make,
    yearOfManufacture,
    tonnage,
    passengers,
    agentcode
  } = req.body;

  const requiredFields = {
    name,
    description,
    basePremium,
    underwriter,
    vehicleClass,
    coverage,
    period,
    value,
    make,
    yearOfManufacture,
    agentcode
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, v]) => v === undefined || v === null || v === '')
    .map(([k]) => k);

  if (missingFields.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  try {
    const product = await prisma.product.upsert({
      where: {
        vehicleClass_coverage_make_yearOfManufacture_period_agentcode: {
          vehicleClass,
          coverage,
          make,
          yearOfManufacture,
          period,
          agentcode
        }
      },
      update: {
        name,
        description,
        basePremium,
        underwriter,
        value,
        tonnage: tonnage ? parseInt(tonnage) : null,
        passengers: passengers ? parseInt(passengers) : null
      },
      create: {
        name,
        description,
        basePremium,
        underwriter,
        vehicleClass,
        coverage,
        period,
        value,
        make,
        yearOfManufacture,
        tonnage: tonnage ? parseInt(tonnage) : null,
        passengers: passengers ? parseInt(passengers) : null,
        agentcode
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating/updating product:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});
