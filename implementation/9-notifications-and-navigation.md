# 9 — Code Changes: Notifications & Navigation

> Files: `frontend/src/components/notifications/NotificationCenter.tsx` · `frontend/src/pages/Index.tsx`
> Addresses: **Shneiderman Rules 1, 3, 7** (rubric 2), **Navigation design** (rubric 3), **Ch5 — four golden navigation rules** (rubric 3)

---

## 9.1 Notifications are hardcoded — connect to real data (Norman Principle 3 — visibility)

**Problem:** `NotificationCenter.tsx:19–44` — the three notifications are static mock data. They never reflect real events (e.g., item verified, claim approved). The bell icon always shows 2 unread regardless of what has actually happened.

**What needs to happen:** The backend needs to emit events that the frontend can poll or subscribe to. For a project-level fix, implement simple polling.

**Change — add a real fetch in `NotificationCenter`:**

```tsx
// Replace the hardcoded useState with a fetched state:
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const NotificationCenter = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!token) return;
    // Poll every 30 seconds for new notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch {
        // silent fail — notifications are non-critical
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // ... rest of component unchanged
```

> **Backend work required:** Add a `GET /api/notifications` route that returns notifications for the logged-in user (e.g., "your item was verified", "your claim was approved"). See backend note at the bottom of this file.

---

## 9.2 Mark individual notification as read on click (Shneiderman Rule 7 — locus of control)

**Current behaviour:** `NotificationCenter.tsx:50–56` — `markAsRead` exists but is only triggered by an explicit button click on the small "Mark as read" text link. Clicking the notification body itself does nothing.

**Change:** Make the entire notification row clickable to mark as read:

```tsx
// In the notification row div (line 137), add onClick:
<div
  key={notification.id}
  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
    !notification.read ? 'bg-blue-50' : ''
  }`}
  onClick={() => markAsRead(notification.id)}
>
```

---

## 9.3 Add "Report Item" button to homepage header (Ch5 — four golden navigation rules: know what you can do)

**Problem:** `Index.tsx:189–205` — the "Report Item" action is only accessible via the "Dashboard" tab. A logged-in user on the Search tab has no visible way to report an item without switching tabs first. The action is hidden.

**Change:** Add a "Report Item" button directly in the header for logged-in users:

```tsx
// In the header actions div (around line 124), add before NotificationCenter:
{user && (
  <Button
    size="sm"
    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
    onClick={() => handleReportItem('lost')}
  >
    <Plus className="w-4 h-4 mr-1" />
    Report Item
  </Button>
)}
```

Add `Plus` to the existing lucide import (line 7):
```tsx
import { Search, MapPin, Calendar, User, Shield, Plus, Bell, Eye } from 'lucide-react';
// Plus is already imported — no change needed
```

---

## 9.4 Add breadcrumb context inside modals (Ch5 — know where you are)

**Problem:** None of the modals (`ReportItemModal`, `ClaimItemModal`, `ItemDetailsModal`) indicate which step in the flow the user is on. For multi-step awareness, even a simple subtitle helps.

**Change in `ReportItemModal.tsx`:** The `DialogDescription` already exists (line 122–124). Make it more location-aware:

```tsx
// Line 122–124 — change:
<DialogDescription className="text-center">
  Provide details about the {type} item to help us match it with others
</DialogDescription>
// to:
<DialogDescription className="text-center">
  Step 1 of 1 — Fill in the details below and submit. Admin will review before it appears on the feed.
</DialogDescription>
```

---

## 9.5 Fix TabsList to not break layout when admin tab is absent (Ch3 — WIMP consistency)

**Problem:** `Index.tsx:190` — `grid-cols-3` is hardcoded on the `TabsList` but the Admin tab only renders for admin users (`isAdmin`). Non-admin users see a 3-column grid with only 2 items, leaving a blank cell.

**Change:**

```tsx
// Line 190 — change:
<TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
// to:
<TabsList className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} w-full max-w-md mx-auto mb-8`}>
```

---

## 9.6 Backend: Add notifications route (required for 9.1)

> File: `backend/routes/` — create a new file `notifications.js`

A minimal implementation that returns status-change events for the current user's items:

```js
// backend/routes/notifications.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
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

    // Build simple notification objects from item states
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
```

Register it in `backend/index.js`:

```js
// Add after existing route registrations (line 18):
const notificationsRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationsRoutes);
```
