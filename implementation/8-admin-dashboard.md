# 8 — Code Changes: Admin Dashboard

> File: `frontend/src/components/admin/AdminDashboard.tsx`
> Addresses: **Shneiderman Rules 2, 3, 4, 6** (rubric 2), **Norman Principles 3, 6** (rubric 2), **Task analysis — admin HTA** (rubric 1)

---

## 8.1 Rename "Verify" to "Approve Report" (Norman Principle 3 — bridge Gulf of Execution)

**Problem:** `AdminDashboard.tsx:221` — button label is "Verify". This doesn't communicate what is being verified or what the outcome is. An admin might ask: *verified as what?*

**HCI justification:** Gulf of Execution — the user's intention (approve a report so it appears on the public feed) does not map clearly to the button label "Verify".

**Change:**

```tsx
// Line 220–224 — change the button content:
<Button
  size="sm"
  onClick={() => handleStatusUpdate(item.id, 'verified')}
  className="bg-green-600 hover:bg-green-700"
>
  <CheckCircle className="w-4 h-4 mr-1" />
  Approve Report
</Button>
```

---

## 8.2 Add toast feedback after every status update (Shneiderman Rule 3 — informative feedback)

**Problem:** `AdminDashboard.tsx:52–54` — `handleStatusUpdate` calls `updateItemStatus` but gives no visible feedback. After clicking "Approve Report" nothing visually confirms the action completed.

**Change:**

```tsx
// Add import at top:
import { useToast } from '@/hooks/use-toast';

// Inside component add:
const { toast } = useToast();

// Replace handleStatusUpdate (lines 52–54) with:
const handleStatusUpdate = async (itemId: string, newStatus: 'verified' | 'matched' | 'resolved') => {
  await updateItemStatus(itemId, newStatus, token);
  const labels: Record<string, string> = {
    verified: 'Report approved — now visible to students',
    matched: 'Item marked as matched',
    resolved: 'Item marked as resolved',
  };
  toast({ title: labels[newStatus] });
};
```

---

## 8.3 Default filter to "pending" (HTA — admin task, Shneiderman Rule 2 — shortcuts for frequent users)

**Problem:** `AdminDashboard.tsx:29` — `statusFilter` defaults to `'all'`. The admin's primary task every session is to process pending items. Showing all items by default buries the work that needs doing.

**Change:**

```tsx
// Line 29 — change:
const [statusFilter, setStatusFilter] = useState('all');
// to:
const [statusFilter, setStatusFilter] = useState('pending');
```

This directly maps to the admin HTA (File 1): *Step 2 — Review pending claims list* is the first action, not browsing all items.

---

## 8.4 Show "Approve Claim" button alongside "View Claim" (HTA — admin task step 3)

**Problem:** `AdminDashboard.tsx:209–214` — when an item has claims, the admin can only "View Claim" in a separate modal. To approve it they still have to go through the status buttons. The view and action are separated, adding unnecessary steps to the HTA.

**Change:** Add an "Approve Claim" action directly in the claim row, so viewing and approving can happen in one step:

```tsx
// Replace lines 209–214 with:
{item.claims && item.claims.length > 0 && (
  <div className="flex gap-2">
    <Button size="sm" variant="outline" onClick={() => handleViewClaim(item.claims[0])}>
      <Info className="w-4 h-4 mr-1 text-blue-600" />
      View Claim
    </Button>
    {item.status !== 'resolved' && (
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => handleStatusUpdate(item.id, 'resolved')}
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Approve Claim
      </Button>
    )}
  </div>
)}
```

---

## 8.5 Add confirmation dialog before resolving (Shneiderman Rule 6 — easy reversal / Norman Principle 6 — design for error)

**Problem:** `AdminDashboard.tsx:238–246` — "Mark Resolved" changes the item permanently with a single click. There is no "are you sure?" step and no undo. Resolving an item incorrectly requires manual database intervention.

**Change:** Wrap the resolve action in an `AlertDialog`:

```tsx
// Add import:
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Replace the "Mark Resolved" button (lines 238–246) with:
{item.status === 'matched' && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" className="bg-gray-600 hover:bg-gray-700">
        Mark Resolved
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Mark as Resolved?</AlertDialogTitle>
        <AlertDialogDescription>
          This will close the "{item.title}" report. This action is hard to reverse.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => handleStatusUpdate(item.id, 'resolved')}>
          Confirm
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
```

---

## 8.6 Show claim count badge on item row (Norman Principle 3 — visibility)

**Problem:** `AdminDashboard.tsx:173–199` — the item row shows title, description, and metadata but no indication of how many claims it has received. The admin has to look for the "View Claim" button to discover there are claims.

**Change:** Add a claim count badge in the item metadata row:

```tsx
// After the category span (line 199), add:
{item.claims && item.claims.length > 0 && (
  <Badge variant="destructive" className="text-xs">
    {item.claims.length} claim{item.claims.length > 1 ? 's' : ''}
  </Badge>
)}
```
