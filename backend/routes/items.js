const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

// Get all items
router.get('/', async (req, res) => {
  const items = await prisma.item.findMany({ include: { owner: true } });
  res.json(items);
});

// Create item (requires authentication)
router.post('/', requireAuth, async (req, res) => {
  const parse = itemSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const { name, description } = parse.data;
  const userId = req.user.id;

  const item = await prisma.item.create({
    data: { name, description, ownerId: userId },
  });
  res.status(201).json(item);
});

module.exports = router;