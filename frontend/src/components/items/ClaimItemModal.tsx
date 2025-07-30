
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClaimItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  refreshItems?: () => void;
}

const ClaimItemModal = ({ isOpen, onClose, item, refreshItems }: ClaimItemModalProps) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  // Add local claimed state for instant UI feedback
  const [claimed, setClaimed] = useState(item?.isClaimed || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/items/${item?.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ name, contact, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit claim');
      } else {
        setName('');
        setContact('');
        setDescription('');
        setClaimed(true); // Update UI instantly
        if (refreshItems) refreshItems();
        onClose();
      }
    } catch (err) {
      setError('Network error');
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim This Item</DialogTitle>
        </DialogHeader>
        {claimed ? (
          <div className="text-green-600 text-center py-4">This item has been claimed.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              placeholder="Email or Phone Number"
              value={contact}
              onChange={e => setContact(e.target.value)}
              required
            />
            <Input
              placeholder="Description (e.g. why you are claiming this item)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClaimItemModal;
