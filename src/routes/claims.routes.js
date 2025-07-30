const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all claims
router.get('/', async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      include: { policy: true }, // Optional: include related policy
    });
    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims.' });
  }
});

// GET claim by ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid claim ID.' });

  try {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { policy: true },
    });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ error: 'Failed to fetch claim.' });
  }
});

// CREATE new claim
router.post('/', async (req, res) => {
  const { policyId, claimDate, description, amount, status } = req.body;

  if (!policyId || !claimDate || !description || typeof amount !== 'number' || !status) {
    return res.status(400).json({ error: 'All fields are required with valid data.' });
  }

  try {
    const claim = await prisma.claim.create({
      data: {
        policyId,
        claimDate: new Date(claimDate),
        description,
        amount,
        status,
      },
    });
    res.status(201).json(claim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim.' });
  }
});

// UPDATE claim
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid claim ID.' });

  try {
    const existing = await prisma.claim.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Claim not found' });

    const updated = await prisma.claim.update({
      where: { id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ error: 'Failed to update claim.' });
  }
});

// DELETE claim
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid claim ID.' });

  try {
    await prisma.claim.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({ error: 'Failed to delete claim.' });
  }
});

module.exports = router;
