import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

export interface Claim {
  id: string;
  name: string;
  contact: string;
  description?: string;
  itemId: string;
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
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch items from the server.",
        variant: "destructive",
      });
      setItems([]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchItems();
  }, []);

  const searchItems = async (query: string, category: string) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = items;
    
    if (query) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }
    
    setItems(filtered);
    setLoading(false);
  };

  const addItem = async (itemData: any, token: string) => {
    try {
      const response = await axios.post(
        '/api/items',
        itemData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // After successful creation, fetch all items again to update state
      await fetchItems();
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to create item');
      }
      throw new Error('Failed to create item');
    }
  }

  const checkForMatches = (newItem: Item) => {
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
    const potentialMatches = items.filter(item => 
      item.type === oppositeType &&
      item.category === newItem.category &&
      item.status === 'verified' &&
      (item.title.toLowerCase().includes(newItem.title.toLowerCase()) ||
       item.tags.some(tag => newItem.tags.includes(tag)))
    );

    if (potentialMatches.length > 0) {
      toast({
        title: "Potential match found!",
        description: `We found ${potentialMatches.length} potential match(es) for your item. Check your notifications.`,
      });
    }
  };


  const updateItemStatus = async (itemId: string, status: Item['status'], token?: string) => {
    const res = await fetch(`/api/items/${itemId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error("Failed to update item status");

    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status } : item
    ));

    toast({
      title: "Item status updated",
      description: `Item status changed to ${status}`,
    });
  };

  const verifyClaimedItem = async (itemId: string, ownerId: string, token?: string) => {
    const res = await fetch(`/api/items/${itemId}/verify`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ownerId }),
    });

    if (!res.ok) throw new Error("Failed to verify claimed item");

    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ownerId, status: 'verified', isClaimed: true } : item
    ));

    toast({
      title: "Item verified and owner assigned",
      description: `Item has been verified and assigned to the owner.`,
    });
  };

  return {
    items,
    loading,
    searchItems,
    addItem,
    updateItemStatus,
    verifyClaimedItem,
    fetchItems // Expose fetchItems for manual refresh
  };
};

