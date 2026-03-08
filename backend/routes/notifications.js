const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth: auth } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/notifications — returns recent status changes on user's items
router.get('/', auth, async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { reporterId: req.user.id },
      select: { id: true, title: true, status: true, isClaimed: true },
      orderBy: { dateReported: 'desc' },
      take: 20,
    });

    const notifications = items.flatMap(item => {
      const notes = [];
      if (item.status === 'verified') {
        notes.push({
          id: `${item.id}-verified`,
          type: 'status',
          title: 'Item Approved',
          message: `"${item.title}" has been verified and is now visible on the feed.`,
          read: false,
        });
      }
      if (item.isClaimed) {
        notes.push({
          id: `${item.id}-claimed`,
          type: 'match',
          title: 'Claim Received',
          message: `Someone has claimed "${item.title}". Check the admin dashboard.`,
          read: false,
        });
      }
      return notes;
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
