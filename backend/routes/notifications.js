const express = require('express');
const router = express.Router();
const { requireAuth: auth } = require('../middleware/auth');
const prisma = require('../prisma/client');

// GET /api/notifications — user's notifications, newest first
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/notifications/:id — delete one notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
