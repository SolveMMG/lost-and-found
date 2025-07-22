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

// Get all items
router.get('/', async (req, res) => {
  const items = await prisma.item.findMany({ include: { owner: true } });
  // Optionally map owner to userName for frontend
  const mapped = items.map(item => ({
    ...item,
    userName: item.owner?.name || '',
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
  const userId = req.user.id;

  const item = await prisma.item.create({
    data: {
      title,
      description,
      category,
      type,
      status,
      location,
      dateReported: dateReported ? new Date(dateReported) : new Date(),
      dateOccurred: new Date(dateOccurred),
      images,
      tags,
      ownerId: userId,
    },
    include: { owner: true }
  });

  res.status(201).json({
    ...item,
    userName: item.owner?.name || '',
  });
});

module.exports = router;