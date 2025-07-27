const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

const itemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  type: z.string().min(1),
  status: z.string().min(1),
  location: z.string().min(1),
  dateReported: z.string().optional(), // ISO string
  dateOccurred: z.string().min(1),     // ISO string
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// Get all items (include reporter and owner)
router.get('/', async (req, res) => {
  const items = await prisma.item.findMany({ include: { reporter: true, owner: true } });

  const mapped = items.map(item => ({
    ...item,
    reporterName: item.reporter?.name || '',
    ownerName: item.owner?.name || '',
  }));

  res.json(mapped);
});



// Create item (requires authentication)
router.post('/', requireAuth, async (req, res) => {
  const parse = itemSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const {
    title, description, category, type, status, location,
    dateReported, dateOccurred, images = [], tags = []
  } = parse.data;

  const reporterId = req.user.id; // ✅ Use logged-in user's ID

  const item = await prisma.item.create({
    data: {
      title,
      description,
      category,
      type,
      status: 'pending', // Always start as pending
      location,
      dateReported: dateReported ? new Date(dateReported) : new Date(),
      dateOccurred: new Date(dateOccurred),
      images,
      tags,
      reporterId,   // ✅ Store the reporter's ID
      ownerId: null // ✅ Owner unknown until verified
    },
    include: { reporter: true, owner: true }
  });

  res.status(201).json({
    ...item,
    reporterName: item.reporter?.name || '',
    ownerName: item.owner?.name || '',
  });
});

// Verify claimed item and assign owner (Admin only)
router.patch('/:id/verify', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: "Admin access required" });

  const { ownerId } = req.body; // The ID of the verified owner

  try {
    const updatedItem = await prisma.item.update({
      where: { id: req.params.id },
      data: {
        ownerId,
        status: 'verified'
      },
      include: { reporter: true, owner: true }
    });

    res.json({
      message: "Item verified and owner assigned successfully",
      ...updatedItem,
      reporterName: updatedItem.reporter?.name || '',
      ownerName: updatedItem.owner?.name || '',
    });
  } catch (error) {
    res.status(400).json({ error: "Could not update item" });
  }
}); // <-- This closes only the /:id/verify route

// Admin: verify item (change status from pending to verified)
router.patch('/:id/status', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: "Admin access required" });
  const { status } = req.body;
  if (!['pending', 'verified', 'matched', 'resolved'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    const updatedItem = await prisma.item.update({
      where: { id: req.params.id },
      data: { status },
      include: { reporter: true, owner: true }
    });
    res.json({
      message: `Item status updated to ${status}`,
      ...updatedItem,
      reporterName: updatedItem.reporter?.name || '',
      ownerName: updatedItem.owner?.name || '',
    });
  } catch (error) {
    res.status(400).json({ error: "Could not update item status" });
  }
});

module.exports = router;