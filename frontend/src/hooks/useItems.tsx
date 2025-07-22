import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

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
  userName: string;
  contactInfo?: string;
  tags: string[];
}

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/items");
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

  const addItem = async (itemData: Partial<Item>) => {
    const newItem: Item = {
      id: Date.now().toString(),
      title: itemData.title || '',
      description: itemData.description || '',
      category: itemData.category || 'other',
      type: itemData.type || 'lost',
      status: 'pending',
      location: itemData.location || '',
      dateReported: new Date(),
      dateOccurred: itemData.dateOccurred || new Date(),
      images: itemData.images || [],
      userId: itemData.userId || '',
      userName: itemData.userName || '',
      contactInfo: itemData.contactInfo,
      tags: itemData.tags || []
    };

    const res = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });

    if (!res.ok) throw new Error("Failed to create item");

    const data = await res.json();
    setItems(prev => [data, ...prev]);
    
    toast({
      title: "Item reported successfully",
      description: `Your ${itemData.type} item "${itemData.title}" has been reported and is pending verification.`,
    });

    // Simulate matching logic
    setTimeout(() => {
      checkForMatches(newItem);
    }, 2000);

    return newItem;
  };

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

  const updateItemStatus = async (itemId: string, status: Item['status']) => {
    const res = await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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

  return {
    items,
    loading,
    searchItems,
    addItem,
    updateItemStatus
  };
};

