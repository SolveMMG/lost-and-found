

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Claim item (user submits claim info, admin notified)
router.post('/:id/claim', requireAuth, async (req, res) => {
  const itemId = req.params.id;
  const { name, contact, description } = req.body;
  if (!name || !contact) {
    return res.status(400).json({ error: 'Name and contact required' });
  }
  try {
    // Store claim info in DB
    const claim = await prisma.claim.create({
      data: {
        name,
        contact,
        description,
        itemId
      }
    });
    // Mark item as claimed
    await prisma.item.update({
      where: { id: itemId },
      data: {
        isClaimed: true
      }
    });
    // Notify admin (for now, just log)
    console.log(`Admin notified: Claim submitted for item ${itemId}`, claim);
    res.json({ message: 'Claim submitted. Admin will review your request.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit claim' });
  }
});



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
  contactInfo: z.string().optional(),
});

// Get all items (include reporter and owner)
router.get('/', async (req, res) => {
  const items = await prisma.item.findMany({
    include: {
      reporter: true,
      owner: true,
      claims: true
    }
  });


  const mapped = items.map(item => ({
    ...item,
    reporterName: item.reporter?.name || '',
    ownerName: item.owner?.name || '',
    contactInfo: item.contactInfo || item.reporter?.email || '',
    claims: item.claims || []
  }));

  res.json(mapped);
});



// Create item (requires authentication)
router.post('/', requireAuth, async (req, res) => {
  const parse = itemSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });


  const {
    title, description, category, type, status, location,
    dateReported, dateOccurred, images = [], tags = [], contactInfo
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
      images: images.map(img => {
        // If it's a local image, store only the filename
        if (img && !img.startsWith('http')) {
          return img.split('/').pop();
        }
        return img;
      }),
      tags,
      contactInfo: contactInfo || null,
      reporterId,   // ✅ Store the reporter's ID
      ownerId: null, // ✅ Owner unknown until verified
      isClaimed: false // Default to false when reporting
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