const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const prisma = require('../prisma/client');
const { notify, notifyAdmin, inAppNotify, inAppNotifyAdmins } = require('../services/notify');
const router = express.Router();

// ── Helpers ────────────────────────────────────────────────────────────────────

function mapItem(item) {
  return {
    ...item,
    reporterName: item.reporter?.name || '',
    ownerName: item.owner?.name || '',
    contactInfo: item.contactInfo || item.reporter?.email || '',
    claims: item.claims || [],
  };
}

// ── Get all items ──────────────────────────────────────────────────────────────

router.get('/', async (_req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: { reporter: true, owner: true, claims: true },
    });
    res.json(items.map(mapItem));
  } catch {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// ── Create item ────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  type: z.string().min(1),
  status: z.string().min(1),
  location: z.string().min(1),
  dateReported: z.string().optional(),
  dateOccurred: z.string().min(1),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  contactInfo: z.string().optional(),
});

router.post('/', requireAuth, async (req, res) => {
  const parse = itemSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const {
    title, description, category, type, location,
    dateReported, dateOccurred, images = [], tags = [], contactInfo,
  } = parse.data;

  try {
    const item = await prisma.item.create({
      data: {
        title, description, category, type,
        status: 'pending',
        location,
        dateReported: dateReported ? new Date(dateReported) : new Date(),
        dateOccurred: new Date(dateOccurred),
        images: images.map(img => (img && !img.startsWith('http') ? img.split('/').pop() : img)),
        tags,
        contactInfo: contactInfo || null,
        reporterId: req.user.id,
        ownerId: null,
        isClaimed: false,
      },
      include: { reporter: true, owner: true },
    });

    // In-app: notify all admins
    inAppNotifyAdmins(prisma, 'system',
      'New item reported',
      `${req.user.name || req.user.email} reported a ${type} item: "${title}" at ${location}.`,
    );

    // Email/SMS: notify admin
    notifyAdmin(
      'New item reported — USIU Lost & Found',
      `${req.user.name || req.user.email} reported a ${type} item "${title}" at ${location}. Log in to approve it.`,
    );

    res.status(201).json(mapItem(item));
  } catch {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// ── Submit a claim ─────────────────────────────────────────────────────────────

router.post('/:id/claim', requireAuth, async (req, res) => {
  const itemId = req.params.id;
  const { name, contact, description } = req.body;
  if (!name || !contact) {
    return res.status(400).json({ error: 'Name and contact required' });
  }
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { reporter: true },
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.isClaimed) return res.status(400).json({ error: 'This item already has an approved claim' });

    await prisma.claim.create({
      data: { name, contact, description, itemId, status: 'pending' },
    });

    // In-app: notify reporter
    inAppNotify(prisma, item.reporterId, 'match',
      'Claim received on your item',
      `${name} has submitted a claim for your reported item "${item.title}". An admin will review it.`,
    );

    // In-app: notify all admins
    inAppNotifyAdmins(prisma, 'system',
      'New claim submitted',
      `${name} (${contact}) submitted a claim for "${item.title}". Review it in the admin dashboard.`,
    );

    // Email/SMS: notify reporter
    const reporterContact = item.reporter?.phone || item.reporter?.email;
    if (reporterContact) {
      notify(
        reporterContact,
        'Claim submitted for your item — USIU Lost & Found',
        `${name} has submitted a claim for your item "${item.title}". An admin will review it.`,
      );
    }

    // Email/SMS: notify admin
    notifyAdmin(
      `New claim on "${item.title}" — USIU Lost & Found`,
      `${name} (${contact}) submitted a claim for "${item.title}". Log in to review it.`,
    );

    res.json({ message: 'Claim submitted. Admin will review your request.' });
  } catch {
    res.status(500).json({ error: 'Failed to submit claim' });
  }
});

// ── Approve a claim (Admin only) ───────────────────────────────────────────────

router.patch('/:id/claims/:claimId/approve', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

  try {
    const claim = await prisma.claim.update({
      where: { id: req.params.claimId },
      data: { status: 'approved' },
      include: { item: { include: { reporter: true } } },
    });

    // Deny all other pending claims on this item
    await prisma.claim.updateMany({
      where: { itemId: req.params.id, id: { not: req.params.claimId }, status: 'pending' },
      data: { status: 'denied' },
    });

    // Mark item as claimed
    await prisma.item.update({
      where: { id: req.params.id },
      data: { isClaimed: true },
    });

    // In-app: notify reporter
    inAppNotify(prisma, claim.item.reporterId, 'match',
      'Claim approved for your item',
      `The claim by ${claim.name} for "${claim.item.title}" has been approved. The item will be returned to its owner.`,
    );

    // Email/SMS: notify claimant
    notify(
      claim.contact,
      'Your claim was approved — USIU Lost & Found',
      `Great news! Your claim for "${claim.item.title}" has been approved. Please visit the lost & found office to collect it.`,
    );

    // Email/SMS: notify reporter
    const reporterContact = claim.item.reporter?.phone || claim.item.reporter?.email;
    if (reporterContact) {
      notify(
        reporterContact,
        'Claim approved for your item — USIU Lost & Found',
        `The claim by ${claim.name} for "${claim.item.title}" has been approved.`,
      );
    }

    res.json({ message: 'Claim approved', claim });
  } catch {
    res.status(500).json({ error: 'Failed to approve claim' });
  }
});

// ── Deny a claim (Admin only) ──────────────────────────────────────────────────

router.patch('/:id/claims/:claimId/deny', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

  try {
    const claim = await prisma.claim.update({
      where: { id: req.params.claimId },
      data: { status: 'denied' },
      include: { item: true },
    });

    // Email/SMS: notify claimant
    notify(
      claim.contact,
      'Your claim was not approved — USIU Lost & Found',
      `Unfortunately, your claim for "${claim.item.title}" was not approved. Contact the lost & found office if you believe this is an error.`,
    );

    res.json({ message: 'Claim denied', claim });
  } catch {
    res.status(500).json({ error: 'Failed to deny claim' });
  }
});

// ── Update item status (Admin only) ───────────────────────────────────────────

router.patch('/:id/status', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const { status } = req.body;
  if (!['pending', 'verified', 'matched', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const updatedItem = await prisma.item.update({
      where: { id: req.params.id },
      data: { status },
      include: { reporter: true, owner: true },
    });

    const reporterContact = updatedItem.reporter?.phone || updatedItem.reporter?.email;

    if (status === 'verified') {
      // In-app: notify reporter
      inAppNotify(prisma, updatedItem.reporterId, 'status',
        'Your report was approved',
        `Your reported item "${updatedItem.title}" has been approved and is now visible on the USIU Lost & Found feed.`,
      );
      // Email/SMS
      if (reporterContact) {
        notify(reporterContact,
          'Your report was approved — USIU Lost & Found',
          `Your item "${updatedItem.title}" has been approved and is now visible to all students.`,
        );
      }
    }

    if (status === 'resolved') {
      // In-app: notify reporter
      inAppNotify(prisma, updatedItem.reporterId, 'status',
        'Your item has been resolved',
        `The report for "${updatedItem.title}" has been marked as resolved. Thank you for using USIU Lost & Found.`,
      );
      // Email/SMS
      if (reporterContact) {
        notify(reporterContact,
          'Your item has been resolved — USIU Lost & Found',
          `The report for "${updatedItem.title}" has been marked as resolved.`,
        );
      }
    }

    res.json({ message: `Item status updated to ${status}`, ...mapItem(updatedItem) });
  } catch {
    res.status(400).json({ error: 'Could not update item status' });
  }
});

// ── Verify claimed item and assign owner (Admin only) ─────────────────────────

router.patch('/:id/verify', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const { ownerId } = req.body;
  try {
    const updatedItem = await prisma.item.update({
      where: { id: req.params.id },
      data: { ownerId, status: 'verified' },
      include: { reporter: true, owner: true },
    });
    res.json({ message: 'Item verified and owner assigned successfully', ...mapItem(updatedItem) });
  } catch {
    res.status(400).json({ error: 'Could not update item' });
  }
});

module.exports = router;
