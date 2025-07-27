
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  AlertTriangle,
  BarChart3,
  Users,
  Package,
  Info
} from 'lucide-react';
import { useItems, Item } from '@/hooks/useItems';
import { useAuth } from '@/hooks/useAuth';
import ItemDetailsModal from '@/components/items/ItemDetailsModal';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { items, updateItemStatus } = useItems();
  const { token } = useAuth(); // Assuming you have a useAuth hook to get the token

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: items.length,
    pending: items.filter(item => item.status === 'pending').length,
    verified: items.filter(item => item.status === 'verified').length,
    matched: items.filter(item => item.status === 'matched').length,
    resolved: items.filter(item => item.status === 'resolved').length,
  };

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const handleStatusUpdate = async (itemId: string, newStatus: 'verified' | 'matched' | 'resolved') => {
    await updateItemStatus(itemId, newStatus, token);
  };
  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleViewClaim = (claim: any) => {
    setSelectedClaim(claim);
    setIsClaimModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage reported items and user verification
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matched</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.matched}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Item Management</CardTitle>
          <CardDescription>
            Review and verify reported items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="matched">Matched</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <Card key={item.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={item.type === 'lost' ? 'destructive' : 'secondary'}>
                            {item.type.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={
                              item.status === 'pending' ? 'border-yellow-300 text-yellow-800' :
                              item.status === 'verified' ? 'border-green-300 text-green-800' :
                              item.status === 'matched' ? 'border-blue-300 text-blue-800' :
                              'border-gray-300 text-gray-800'
                            }
                          >
                            {item.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>By: {item.userName}</span>
                          <span>Location: {item.location}</span>
                          <span>Category: {item.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        
                        {/* Claim icon for items with claims */}
                        {item.claims && item.claims.length > 0 && (
                          <Button size="sm" variant="outline" onClick={() => handleViewClaim(item.claims[0])}>
                            <Info className="w-4 h-4 mr-1 text-blue-600" />
                            View Claim
                          </Button>
                        )}
                        {item.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, 'verified')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                          </div>
                        )}
                        
                        {item.status === 'verified' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStatusUpdate(item.id, 'matched')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Match Found
                          </Button>
                        )}
                        
                        {item.status === 'matched' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStatusUpdate(item.id, 'resolved')}
                            className="bg-gray-600 hover:bg-gray-700"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No items found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <ItemDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        item={selectedItem}
      />
      {/* Claim Modal */}
      {selectedClaim && (
        <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Claim Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <div><strong>Name:</strong> {selectedClaim.name}</div>
              <div><strong>Contact:</strong> {selectedClaim.contact}</div>
              <div><strong>Description:</strong> {selectedClaim.description || 'No description provided.'}</div>
              <div><strong>Date:</strong> {new Date(selectedClaim.createdAt).toLocaleString()}</div>
            </div>
            <Button onClick={() => setIsClaimModalOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDashboard;