import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Item } from "@/hooks/useItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
}

const ItemDetailsModal = ({ isOpen, onClose, item }: ItemDetailsModalProps) => {
  if (!item) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>
        <div>
          <p>{item.description}</p>
          <p><strong>Location:</strong> {item.location}</p>
          <p><strong>Date:</strong> {new Date(item.dateOccurred).toLocaleDateString()}</p>
          <p><strong>Reported by:</strong> {item.userName}</p>
          <p><strong>Contact:</strong> {item.contactInfo || "N/A"}</p>
          <div className="flex gap-2 mt-2">
            {item.tags.map((tag, i) => (
              <Badge key={i}>{tag}</Badge>
            ))}
          </div>
        </div>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsModal;