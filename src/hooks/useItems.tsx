
import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data
 const mockItems: Item[] = [
  {
    id: '1',
    title: 'iPhone 14 Pro',
    description: 'Black iPhone 14 Pro with cracked screen protector. Has a blue phone case with initials "J.D."',
    category: 'electronics',
    type: 'lost',
    status: 'verified',
    location: 'Central Park, near Bethesda Fountain',
    dateReported: new Date('2024-01-15'),
    dateOccurred: new Date('2024-01-14'),
    images: ['https://imgs.search.brave.com/xcz3MjF-i9jSw-tKp9glnh7oEZVMtDOJbN_1mIVaAHM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4y/LmNlbGxwaG9uZXMu/Y29tLnZuL2luc2Vj/dXJlL3JzOmZpbGw6/MDowL3E6OTAvcGxh/aW4vaHR0cHM6Ly9j/ZWxscGhvbmVzLmNv/bS52bi9tZWRpYS93/eXNpd3lnL1Bob25l/L0FwcGxlL2lwaG9u/ZS0xNC9pcGhvbmUt/MTQtcHJvLTEwLmpw/Zw'], // iPhone
    userId: '1',
    userName: 'John Doe',
    contactInfo: 'john@email.com',
    tags: ['iphone', 'smartphone', 'black', 'cracked']
  },
  {
    id: '2',
    title: 'Brown Leather Wallet',
    description: 'Brown leather wallet with multiple credit cards and cash. Has a small tear on the corner.',
    category: 'accessories',
    type: 'found',
    status: 'verified',
    location: 'Times Square, near TKTS stairs',
    dateReported: new Date('2024-01-16'),
    dateOccurred: new Date('2024-01-16'),
    images: ['https://imgs.search.brave.com/DunI5pMVEfC07LA_ZANiVM34G6I4tFRzmm6iSjsEdAE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/ZW5ncmF2ZWRtZW1v/cmllcy5jby51ay9j/ZG4vc2hvcC9wcm9k/dWN0cy9jdXN0b20t/cGhvdG8td2FsbGV0/LWJyb3duLWxlYXRo/ZXItd2FsbGV0LXBo/b3RvLW5hbWUtYXJ0/d29yay1wZXJzb25h/bGlzZWQtd2FsbGV0/LWZhdGhlcnMtZGF5/LWdpZnQtOTg3MTI5/XzEwMjR4MTAyNC5q/cGc_dj0xNjYyOTA3/NDcw'], // Wallet
    userId: '2',
    userName: 'Admin User',
    tags: ['wallet', 'brown', 'leather', 'cards']
  },
  {
    id: '3',
    title: 'Blue Denim Jacket',
    description: 'Medium-sized blue denim jacket from Levis. Has a small pin on the left lapel.',
    category: 'clothing',
    type: 'lost',
    status: 'pending',
    location: 'Brooklyn Bridge',
    dateReported: new Date('2024-01-17'),
    dateOccurred: new Date('2024-01-16'),
    images: ['https://imgs.search.brave.com/i9x5U6I2Di_TD72_1HnT0sOn_Mb46cErojB65yFSOzc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZS5obS5jb20vYXNz/ZXRzL2htLzc3Lzk1/Lzc3OTVjOTlmMDA0/N2FjZWQ3MWJhMTU5/MGY2ZDJkOTgzNWVl/Zjk2ODUuanBnP2lt/d2lkdGg9MTUzNg'], // Denim jacket
    userId: '1',
    userName: 'John Doe',
    tags: ['jacket', 'denim', 'blue', 'levis']
  },
  {
    id: '4',
    title: 'House Keys with Keychain',
    description: 'Set of house keys with a red heart-shaped keychain. About 4-5 keys on a silver ring.',
    category: 'keys',
    type: 'found',
    status: 'verified',
    location: 'Washington Square Park',
    dateReported: new Date('2024-01-18'),
    dateOccurred: new Date('2024-01-18'),
    images: ['https://imgs.search.brave.com/JcfKMlBprEa27OaubKDmTcvj_b9wGHn6L9MA4zm0zYk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQ4/Njg4MzIwNS9waG90/by9ob3VzZS1rZXlz/LXdpdGgtYS1rZXlj/aGFpbi1pbi10aGUt/c2hhcGUtb2YtYS1o/b3VzZS1jb21wb3Np/dGlvbi1vbi1hLWdy/YXktbWFyYmxlLWJh/Y2tncm91bmQuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPWc0/R1FxWlJINXRzZl9S/emxXcFhQRnAxRWhI/Q0kwWFgtMkZST2pG/NzVPeGs9'], // Keys
    userId: '2',
    userName: 'Admin User',
    tags: ['keys', 'keychain', 'red', 'heart']
  }
];

  useEffect(() => {
    // Initialize with mock data
    setItems(mockItems);
  }, []);

  const searchItems = async (query: string, category: string) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = mockItems;
    
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

    setItems(prev => [newItem, ...prev]);
    
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
