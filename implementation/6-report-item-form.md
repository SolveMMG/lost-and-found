# 6 — Code Changes: Report Item Form

> File: `frontend/src/components/items/ReportItemModal.tsx`
> Addresses: **Norman Principles 2, 5, 6** (rubric 2), **Shneiderman Rules 3, 5** (rubric 2), **Form layout / grouping** (rubric 3)

---

## 6.1 Add success toast on submit (Shneiderman Rule 3 — informative feedback)

**Problem:** `ReportItemModal.tsx:74–84` — on success the modal closes silently. `onClose()` is called but no feedback is given to the user. They have no confirmation the item was saved.

**Change:** Import and call `useToast` on success:

```tsx
// Add import at top of file:
import { useToast } from '@/hooks/use-toast';

// Inside the component, add:
const { toast } = useToast();

// In handleSubmit, replace the success block (lines 77–79) with:
if (refreshItems) refreshItems();
toast({
  title: "Item reported successfully",
  description: `Your ${type} item has been submitted and is pending review.`,
});
onClose();
```

---

## 6.2 Add inline error toast on failure (Shneiderman Rule 5 — error handling)

**Problem:** `ReportItemModal.tsx:83` — errors are only `console.error`'d. The user sees nothing if the submit fails.

**Change:** Replace `console.error(error.message)` with:

```tsx
toast({
  title: "Submission failed",
  description: error.message || "Something went wrong. Please try again.",
  variant: "destructive",
});
```

---

## 6.3 Add inline error on image upload failure (Norman Principle 6 — design for error)

**Problem:** `ReportItemModal.tsx:103` — image upload failure shows a native browser `alert()`. This is jarring, outside the design system, and blocks the entire page.

**Change:** Replace `alert(...)` with a state-based inline error:

```tsx
// Add state at top of component:
const [imageError, setImageError] = useState('');

// In handleImageUpload catch block, replace alert with:
setImageError('Image upload failed. Please try again.');

// Clear it on new upload attempt:
setImageError('');  // add at the start of handleImageUpload

// In the JSX, after the upload box (around line 256), add:
{imageError && (
  <p className="text-sm text-red-500 mt-1">{imageError}</p>
)}
```

---

## 6.4 Add date constraint — no future dates (Norman Principle 5 — constraints)

**Problem:** `ReportItemModal.tsx:204–210` — the `Calendar` component has no `disabled` prop. A user can select a future date for "date lost/found" which is logically impossible.

**Change:** Add `disabled` to the Calendar to block future dates:

```tsx
// Line 204–210 — add disabled prop:
<Calendar
  mode="single"
  selected={formData.dateOccurred}
  onSelect={(date) => date && setFormData(prev => ({ ...prev, dateOccurred: date }))}
  disabled={(date) => date > new Date()}
  initialFocus
/>
```

---

## 6.5 Visually group form fields (Ch5 — grouping, Norman Principle 2 — simplify tasks)

**Problem:** `ReportItemModal.tsx:127–282` — all fields are in a flat `space-y-6` list with no visual grouping. There are 7+ fields shown as one undifferentiated block, exceeding the STM limit of 7 ± 2 chunks (Ch1).

**Change:** Wrap the fields in two labelled sections with a visual divider:

```tsx
<form onSubmit={handleSubmit} className="space-y-6">

  {/* GROUP 1 */}
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
      What is the item?
    </h3>
    {/* title, description, category, image upload fields — unchanged */}
  </div>

  <hr className="border-gray-200" />

  {/* GROUP 2 */}
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
      Where and when?
    </h3>
    {/* location + date grid, contactInfo, tags fields — unchanged */}
  </div>

  {/* Submit buttons — unchanged */}
</form>
```

---

## 6.6 Reset form state when modal closes (Norman Principle 6 — error prevention)

**Problem:** `ReportItemModal.tsx:26–37` — `formData` is initialised once. If the modal is closed and reopened, the previous form values persist.

**Change:** Reset form state in the `onClose` handler. In `Index.tsx` where `ReportItemModal` is used, or by adding a `useEffect` inside the modal:

```tsx
// Add inside ReportItemModal, after the useState declarations:
useEffect(() => {
  if (!isOpen) {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      type: '',
      status: '',
      location: '',
      dateOccurred: new Date(),
      contactInfo: '',
      tags: '',
      images: []
    });
    setImageError('');
  }
}, [isOpen]);
```
