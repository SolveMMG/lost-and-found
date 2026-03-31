import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

export interface Claim {
  id: string;
  name: string;
  contact: string;
  description?: string;
  itemId: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'lost' | 'found';
  status: 'pending' | 'verified' | 'matched' | 'resolved';
  location: string;
  dateReported: Date;
  dateOccurred: Date;
  images: string[];
  userId: string;
  reporterId?: string;
  userName: string;
  contactInfo?: string;
  reporterName?: string;
  ownerName?: string;
  tags: string[];
  isClaimed?: boolean;
  claims?: Claim[];
}

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch {
      toast({ title: 'Error', description: 'Could not fetch items from the server.', variant: 'destructive' });
      setItems([]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (
    itemData: Omit<Item, 'id' | 'dateReported' | 'dateOccurred' | 'userName' | 'userId'> & { dateReported: string; dateOccurred: string },
    token: string,
  ) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/items`, itemData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      await fetchItems();
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw new Error(error.response?.data?.error || 'Failed to create item');
      throw new Error('Failed to create item');
    }
  };

  const updateItemStatus = async (itemId: string, status: Item['status'], token?: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${itemId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update item status');
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, status } : item)));
    toast({ title: 'Item status updated', description: `Status changed to ${status}` });
  };

  const verifyClaimedItem = async (itemId: string, ownerId: string, token?: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${itemId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ownerId }),
    });
    if (!res.ok) throw new Error('Failed to verify claimed item');
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, ownerId, status: 'verified', isClaimed: true } : item)),
    );
    toast({ title: 'Item verified and owner assigned' });
  };

  const approveClaim = async (itemId: string, claimId: string, token: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${itemId}/claims/${claimId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to approve claim');
    await fetchItems();
    toast({ title: 'Claim approved', description: 'The claimant has been notified.' });
  };

  const denyClaim = async (itemId: string, claimId: string, token: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${itemId}/claims/${claimId}/deny`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to deny claim');
    await fetchItems();
    toast({ title: 'Claim denied', description: 'The claimant has been notified.' });
  };

  return {
    items,
    loading,
    addItem,
    updateItemStatus,
    verifyClaimedItem,
    approveClaim,
    denyClaim,
    fetchItems,
  };
};
