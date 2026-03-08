import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Item } from '@/hooks/useItems';

interface ClaimItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  refreshItems?: () => void;
}

const ClaimItemModal = ({ isOpen, onClose, item, refreshItems }: ClaimItemModalProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [claimed, setClaimed] = useState(false);

  // Keep claimed in sync when item prop changes
  useEffect(() => {
    setClaimed(item?.isClaimed || false);
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please sign in to claim this item.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${item?.id}/claim`, {
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
        toast({
          title: 'Claim submitted',
          description: 'An admin will review your claim and get in touch.',
        });
        setName('');
        setContact('');
        setDescription('');
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
          <DialogTitle>Claim: {item?.title}</DialogTitle>
          <DialogDescription>
            Fill in your details below. An admin will review your claim and contact you if approved.
          </DialogDescription>
        </DialogHeader>
        {claimed ? (
          <div className="text-green-600 text-center py-4">This item has been claimed.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && <div className="text-red-500 text-sm">{error}</div>}

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
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClaimItemModal;
