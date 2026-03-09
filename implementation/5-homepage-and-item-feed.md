# 5 — Code Changes: Homepage & Item Feed

> Files: `frontend/src/pages/Index.tsx` · `frontend/src/components/items/ItemCard.tsx`
> Addresses: **HCI Principle 1** (rubric 2), **Shneiderman Rules 1, 7, 8** (rubric 2), **Screen design / navigation** (rubric 3)

---

## 5.1 Allow browsing without login (Shneiderman Rule 7 — locus of control)

**Problem:** `Index.tsx:67–104` replaces the entire page with a splash screen when the user is not logged in. Users cannot see any items until they sign in. This removes their control and may deter use.

**HCI justification:** Ch3 — user should have initiative; forcing login before any value is delivered creates a barrier. Ch5 — perceived value must exceed cost; if you can't see the board before signing up, the cost (registering) feels higher than the unknown value.

**Change in `Index.tsx`:** Remove the early return block at line 67. Instead render the full homepage for everyone, but conditionally show/hide the "Report Item" and "Dashboard" actions:

```tsx
// REMOVE lines 67–104 (the !user early return block)

// In the header, keep the Sign In button as-is — it already exists at line 148

// In the items grid (line 258), the feed renders for everyone
// No change needed there — filteredItems already works without auth

// In handleReportItem (line 40), the auth guard already redirects to login — keep that
```

Result: non-logged-in users see the item feed and search bar immediately. They hit the auth wall only when they try to report or claim.

---

## 5.2 Show active filters as chips (Shneiderman Rule 8 — reduce STM load)

**Problem:** When a category filter is active there is no visible indication on the results — the user has to look back at the dropdown to remember what they filtered by.

**Change in `Index.tsx`:** After the search/filter `Card` (around line 242), add an active-filter indicator:

```tsx
{/* Active filter chips — add after the CardContent closing tag ~line 241 */}
{(selectedCategory !== 'all' || searchQuery) && (
  <div className="flex flex-wrap gap-2 px-1">
    {searchQuery && (
      <Badge variant="secondary" className="gap-1">
        Search: "{searchQuery}"
        <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">×</button>
      </Badge>
    )}
    {selectedCategory !== 'all' && (
      <Badge variant="secondary" className="gap-1 capitalize">
        {selectedCategory}
        <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-red-500">×</button>
      </Badge>
    )}
  </div>
)}
```

---

## 5.3 Fix skeleton count during loading (Norman Principle 3 — make things visible)

**Problem:** `Index.tsx:247` — `Array.from({ length: 100 })` renders 100 skeleton cards on load. This is visually confusing and slow to paint.

**Change:** Replace `100` with `6`:

```tsx
// Line 247 — change:
Array.from({ length: 100 }).map((_, i) => (
// to:
Array.from({ length: 6 }).map((_, i) => (
```

---

## 5.4 Fix ItemCard — hide Claim button on claimed items (Norman Principle 5 — constraints)

**Problem:** `ItemCard.tsx:118` — the "Claim" button renders on every item regardless of `item.isClaimed`. Clicking it on an already-claimed item is a useless or confusing action.

**Change in `ItemCard.tsx`:** Make the Claim button conditional:

```tsx
// Lines 113–122 — replace the Actions div with:
<div className="flex gap-2">
  <Button variant="outline" size="sm" className="flex-1" onClick={onViewDetails}>
    <Eye className="w-4 h-4 mr-2" />
    View Details
  </Button>
  {!item.isClaimed && (
    <Button variant="outline" size="sm" className="flex-1" onClick={onClaim}>
      <MessageCircle className="w-4 h-4 mr-2" />
      Claim
    </Button>
  )}
  {item.isClaimed && (
    <Badge className="flex-1 justify-center bg-green-100 text-green-800 border-green-300">
      ✓ Claimed
    </Badge>
  )}
</div>
```

---

## 5.5 Add icon to status badges (Ch1 — colour blindness, 8% males)

**Problem:** `ItemCard.tsx:42–47` — status badges use colour only (`getStatusColor`). Colour-blind users cannot distinguish "verified" (green) from "matched" (blue).

**Change in `ItemCard.tsx`:** Add an icon to each badge:

```tsx
// Replace the two Badge lines (42–47) with:
<div className="flex items-center gap-2 mb-2">
  <Badge className={cn("text-xs font-medium gap-1", getTypeColor(item.type))}>
    {item.type === 'lost' ? '↓' : '↑'} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
  </Badge>
  <Badge variant="outline" className={cn("text-xs gap-1", getStatusColor(item.status))}>
    {item.status === 'verified' && <CheckCircle className="w-3 h-3" />}
    {item.status === 'pending' && <Clock className="w-3 h-3" />}
    {item.status === 'matched' && <Users className="w-3 h-3" />}
    {item.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
  </Badge>
</div>
```

Add the missing imports at the top of `ItemCard.tsx`:
```tsx
import { CalendarIcon, MapPin, User, Eye, MessageCircle, CheckCircle, Clock, Users } from 'lucide-react';
```

---

## 5.6 Fix image position in ItemCard (Ch5 — grouping)

**Problem:** `ItemCard.tsx:61–76` — the image renders below the badges and title but inside `CardContent`. The visual scan order is: badges → title → description → *then* image. The image is the most identifying feature of an item and should be the first thing seen.

**Change in `ItemCard.tsx`:** Move the image block from `CardContent` to above `CardHeader`, making it the card's top element:

```tsx
// New structure:
<Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
  {/* Image first */}
  {item.images && item.images.length > 0 && (
    <div className="overflow-hidden rounded-t-lg">
      <img
        src={item.images[0].startsWith('http') ? item.images[0] : `${import.meta.env.VITE_API_URL}/images/${item.images[0]}`}
        alt={item.title}
        className="w-full h-40 object-cover bg-gray-100"
        onError={e => { e.currentTarget.src = '/images/placeholder.svg'; }}
      />
    </div>
  )}
  <CardHeader className="pb-3">
    {/* badges + title + description — unchanged */}
  </CardHeader>
  <CardContent className="pt-0">
    {/* Remove the image block that was here */}
    {/* details, tags, actions — unchanged */}
  </CardContent>
</Card>
```
