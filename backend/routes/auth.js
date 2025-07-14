const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

// Simple email "login" (for demo; replace with OAuth in production)
router.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const { email, name } = parse.data;
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name } });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

module.exports = router;