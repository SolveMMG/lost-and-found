import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Item, Claim } from '@/hooks/useItems';

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
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const approvedClaim: Claim | undefined = item?.claims?.find(c => c.status === 'approved');
  const isApproved = Boolean(item?.isClaimed && approvedClaim);

  const handleClose = () => {
    setName('');
    setContact('');
    setDescription('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please sign in to submit a claim.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${item?.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, contact, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit claim');
      } else {
        toast({
          title: item?.type === 'lost' ? 'Found report submitted' : 'Claim submitted',
          description: 'An admin will review and get in touch.',
        });
        if (refreshItems) refreshItems();
        handleClose();
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item?.type === 'lost' ? 'Report Found' : 'Claim'}: {item?.title}
          </DialogTitle>
          <DialogDescription>
            {isApproved
              ? 'This item has an approved claim.'
              : item?.type === 'lost'
              ? 'Fill in your details below. An admin will review and contact the reporter.'
              : 'Fill in your details below. An admin will review your claim and contact you if approved.'}
          </DialogDescription>
        </DialogHeader>

        {isApproved && approvedClaim ? (
          /* Read-only: approved claim details */
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle className="w-5 h-5" />
              Claim Approved
            </div>
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2 text-sm">
              <div><span className="font-medium">Claimant:</span> {approvedClaim.name}</div>
              <div><span className="font-medium">Contact:</span> {approvedClaim.contact}</div>
              {approvedClaim.description && (
                <div><span className="font-medium">Details:</span> {approvedClaim.description}</div>
              )}
              <div><span className="font-medium">Date:</span> {new Date(approvedClaim.createdAt).toLocaleString()}</div>
            </div>
            <Button onClick={handleClose} className="w-full">Close</Button>
          </div>
        ) : (
          /* Claim submission form — always available while no approved claim */
          <form onSubmit={handleSubmit} className="space-y-4">
            {item?.claims && item.claims.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {item.claims.length} claim{item.claims.length > 1 ? 's' : ''} already submitted
                </Badge>
                <span>You can still submit yours — the admin will review all claims.</span>
              </div>
            )}

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
                placeholder="e.g. you@email.com or +254700000000"
                value={contact}
                onChange={e => setContact(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="claim-description">
                {item?.type === 'lost' ? 'Where did you find it? *' : 'Proof of ownership *'}
              </Label>
              <Textarea
                id="claim-description"
                placeholder={
                  item?.type === 'lost'
                    ? 'Describe where and when you found the item and its current condition.'
                    : 'Describe something unique about the item only the owner would know (colour, contents, serial number, etc.).'
                }
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  item?.type === 'lost' ? 'Submit Found Report' : 'Submit Claim'
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
