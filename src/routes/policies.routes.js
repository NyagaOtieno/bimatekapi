const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all policies
router.get('/', async (req, res) => {
  try {
    const policies = await prisma.policy.findMany({
      include: { product: true, user: true }, // Include related data if needed
    });
    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Failed to fetch policies.' });
  }
});

// GET policy by ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid policy ID.' });

  try {
    const policy = await prisma.policy.findUnique({
      where: { id },
      include: { product: true, user: true },
    });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ error: 'Failed to fetch policy.' });
  }
});

// CREATE new policy
router.post('/', async (req, res) => {
  const { userId, productId, startDate, endDate, premium } = req.body;

  if (!userId || !productId || !startDate || !endDate || typeof premium !== 'number') {
    return res.status(400).json({ error: 'All fields are required with valid data.' });
  }

  try {
    const policy = await prisma.policy.create({
      data: {
        userId,
        productId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        premium,
      },
    });
    res.status(201).json(policy);
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ error: 'Failed to create policy.' });
  }
});

// UPDATE policy
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid policy ID.' });

  try {
    const existing = await prisma.policy.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Policy not found' });

    const updated = await prisma.policy.update({
      where: { id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy.' });
  }
});

// DELETE policy
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid policy ID.' });

  try {
    await prisma.policy.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ error: 'Failed to delete policy.' });
  }
});

module.exports = router;
