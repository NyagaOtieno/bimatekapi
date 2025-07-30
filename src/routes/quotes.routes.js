// CREATE quote based on search params
router.post('/', async (req, res) => {
  const {
    vehicleClass,
    coverage,
    period,
    value,
    make,
    yearOfManufacture,
    userId
  } = req.body;

  if (!vehicleClass || !coverage || !period || !value || !make || !yearOfManufacture || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Find matching product
    const product = await prisma.product.findFirst({
      where: {
        vehicleClass,
        coverage,
        make,
        // Optionally filter underwriter/period if stored in the DB
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Matching product not found.' });
    }

    // Calculate premium (simple example)
    let basePremium = product.basePremium;

    // Apply basic rating logic
    const age = new Date().getFullYear() - yearOfManufacture;
    const ageFactor = age > 5 ? 1.1 : 1.0; // +10% if older than 5 years
    const valueFactor = value / 1000000;   // scale factor
    const periodFactor = period / 12;      // for partial years

    const finalPremium = Math.round(basePremium * valueFactor * ageFactor * periodFactor);

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        productId: product.id,
        userId,
        price: finalPremium,
        value,
        period,
        make,
        yearOfManufacture,
      },
      include: {
        product: true,
        user: true,
      },
    });

    res.status(201).json(quote);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote.' });
  }
});
