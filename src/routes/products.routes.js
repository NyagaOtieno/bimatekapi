const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products.', detail: error.message });
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID.' });

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product.', detail: error.message });
  }
});

// CREATE new product
router.post('/', async (req, res) => {
  const { name, description, underwriter, vehicleClass, coverage, basePremium } = req.body;

  if (!name || typeof basePremium !== 'number') {
    return res.status(400).json({ error: 'name and numeric basePremium are required.' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        underwriter,
        vehicleClass,
        coverage,
        basePremium,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product.', detail: error.message });
  }
});

// UPDATE product
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID.' });

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product.', detail: error.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID.' });

  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product.', detail: error.message });
  }
});

module.exports = router;
