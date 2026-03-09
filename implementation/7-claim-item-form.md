# 7 — Code Changes: Claim Item Form

> File: `frontend/src/components/items/ClaimItemModal.tsx`
> Addresses: **Shneiderman Rules 1, 3, 4, 5** (rubric 2), **Norman Principles 3, 6** (rubric 2), **Form layout** (rubric 3)

---

## 7.1 Add Labels to all inputs (Shneiderman Rule 1 — consistency, Norman Principle 3 — visibility)

**Problem:** `ClaimItemModal.tsx:67–84` — all three `Input` fields use only `placeholder` text as labels. Placeholders disappear as soon as the user starts typing, leaving them with no reminder of what the field is for. This violates visibility and consistency with `ReportItemModal` which uses proper `<Label>` elements.

**Change:** Replace the plain `Input` fields with labelled pairs:

```tsx
// Replace lines 67–84 with:
<div className="space-y-2">
  <Label htmlFor="claim-name">Your Name *</Label>
  <Input
    id="claim-name"
    placeholder="Full name"
    value={name}
    onChange={e => setName(e.target.value)}
    required
  />
</div>

<div className="space-y-2">
  <Label htmlFor="claim-contact">Email or Phone *</Label>
  <Input
    id="claim-contact"
    placeholder="How we can reach you"
    value={contact}
    onChange={e => setContact(e.target.value)}
    required
  />
</div>

<div className="space-y-2">
  <Label htmlFor="claim-description">Proof of ownership *</Label>
  <Textarea
    id="claim-description"
    placeholder="Describe something unique about the item that only the owner would know (colour, contents, serial number, etc.)"
    value={description}
    onChange={e => setDescription(e.target.value)}
    rows={3}
    required
  />
</div>
```

Add the missing imports:
```tsx
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
```

---

## 7.2 Add a DialogDescription (Shneiderman Rule 4 — closure)

**Problem:** `ClaimItemModal.tsx:58–62` — the dialog has a `DialogTitle` but no `DialogDescription`. The user has no context about what happens after submitting — who reviews the claim? What is the next step?

**Change:**

```tsx
// Add import:
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// After DialogTitle (line 62), add:
<DialogDescription>
  Fill in your details below. An admin will review your claim and contact you if approved.
</DialogDescription>
```

---

## 7.3 Show success feedback instead of silent close (Shneiderman Rule 3 — informative feedback)

**Problem:** `ClaimItemModal.tsx:44–49` — on success, the modal just closes. The user receives no confirmation.

**Change:**

```tsx
// Add import:
import { useToast } from '@/hooks/use-toast';

// Inside component:
const { toast } = useToast();

// Replace the success block (lines 44–49) with:
toast({
  title: "Claim submitted",
  description: "An admin will review your claim and get in touch.",
});
setName('');
setContact('');
setDescription('');
if (refreshItems) refreshItems();
onClose();
```

---

## 7.4 Show item name in the modal title (Norman Principle 1 — knowledge in the world)

**Problem:** `ClaimItemModal.tsx:61` — title says "Claim This Item" with no indication of which item. If the user opened the wrong item by mistake they have no visual confirmation inside the modal.

**Change:**

```tsx
// Line 61 — change:
<DialogTitle>Claim This Item</DialogTitle>
// to:
<DialogTitle>Claim: {item?.title}</DialogTitle>
```

---

## 7.5 Fix isClaimed state initialisation (Norman Principle 6 — design for error)

**Problem:** `ClaimItemModal.tsx:21` — `claimed` is initialised from `item?.isClaimed` at component mount. If the `item` prop changes (different item selected) after mount, `claimed` stays stale from the previous item.

**Change:** Drive the claimed state from the prop directly, using `useEffect`:

```tsx
// Replace line 21:
const [claimed, setClaimed] = useState(item?.isClaimed || false);

// With:
const [claimed, setClaimed] = useState(false);

useEffect(() => {
  setClaimed(item?.isClaimed || false);
}, [item]);
```

---

## 7.6 Add full-width Submit button with loading state (Shneiderman Rule 3 — feedback)

**Problem:** `ClaimItemModal.tsx:86–88` — the Submit button has no loading spinner, no visual width, and minimal styling. It doesn't match the visual weight conventions established in `ReportItemModal`.

**Change:**

```tsx
// Replace lines 86–88 with:
<div className="flex gap-3 pt-2">
  <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
    Cancel
  </Button>
  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
    {isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Submitting...
      </>
    ) : (
      'Submit Claim'
    )}
  </Button>
</div>
```

Add import:
```tsx
import { Loader2 } from 'lucide-react';
```
