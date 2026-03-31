import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield, Search, CheckCircle, Clock, Eye,
  BarChart3, Users, Package, ChevronDown, ChevronUp, XCircle,
} from 'lucide-react';
import { useItems, Item, Claim } from '@/hooks/useItems';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ItemDetailsModal from '@/components/items/ItemDetailsModal';

const ClaimStatusBadge = ({ status }: { status: string }) => {
  if (status === 'approved') return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
  if (status === 'denied') return <Badge className="bg-red-100 text-red-800 border-red-300">Denied</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
};

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [expandedClaims, setExpandedClaims] = useState<Record<string, boolean>>({});
  const { items, updateItemStatus, approveClaim, denyClaim } = useItems();
  const { token } = useAuth();
  const { toast } = useToast();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    verified: items.filter(i => i.status === 'verified').length,
    matched: items.filter(i => i.status === 'matched').length,
    resolved: items.filter(i => i.status === 'resolved').length,
  };

  const handleStatusUpdate = async (itemId: string, newStatus: 'verified' | 'matched' | 'resolved') => {
    await updateItemStatus(itemId, newStatus, token);
    const labels: Record<string, string> = {
      verified: 'Report approved — now visible to students',
      matched: 'Item marked as matched',
      resolved: 'Item marked as resolved',
    };
    toast({ title: labels[newStatus] });
  };

  const handleApproveClaim = async (itemId: string, claimId: string) => {
    try {
      await approveClaim(itemId, claimId, token);
    } catch {
      toast({ title: 'Error', description: 'Failed to approve claim', variant: 'destructive' });
    }
  };

  const handleDenyClaim = async (itemId: string, claimId: string) => {
    try {
      await denyClaim(itemId, claimId, token);
    } catch {
      toast({ title: 'Error', description: 'Failed to deny claim', variant: 'destructive' });
    }
  };

  const toggleClaims = (itemId: string) => {
    setExpandedClaims(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <Shield className="w-8 h-8 mr-3 text-blue-600" />
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground">Manage reported items and user claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: <Package className="h-4 w-4 text-muted-foreground" />, color: '' },
          { label: 'Pending', value: stats.pending, icon: <Clock className="h-4 w-4 text-yellow-600" />, color: 'text-yellow-600' },
          { label: 'Verified', value: stats.verified, icon: <CheckCircle className="h-4 w-4 text-green-600" />, color: 'text-green-600' },
          { label: 'Matched', value: stats.matched, icon: <Users className="h-4 w-4 text-blue-600" />, color: 'text-blue-600' },
          { label: 'Resolved', value: stats.resolved, icon: <BarChart3 className="h-4 w-4 text-gray-600" />, color: 'text-gray-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Item Management */}
      <Card>
        <CardHeader>
          <CardTitle>Item Management</CardTitle>
          <CardDescription>Review, verify, and manage item claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="matched">Matched</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => {
                const pendingClaims = item.claims?.filter((c: Claim) => c.status === 'pending') ?? [];
                const allClaims = item.claims ?? [];
                const claimsExpanded = expandedClaims[item.id];

                return (
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
                            {pendingClaims.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {pendingClaims.length} pending claim{pendingClaims.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span>By: {item.reporterName || item.userName}</span>
                            <span>Location: {item.location}</span>
                            <span>Category: {item.category}</span>
                          </div>
                        </div>

                        {/* Item action buttons */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setIsDetailsOpen(true); }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>

                          {item.status === 'pending' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Report?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will verify "{item.title}" and make it visible to all students.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleStatusUpdate(item.id, 'verified')}>
                                    Approve
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {item.status === 'verified' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Match Found</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Mark as Matched?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This indicates a potential match has been found for "{item.title}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleStatusUpdate(item.id, 'matched')}>
                                    Confirm
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {item.status === 'matched' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-gray-600 hover:bg-gray-700">Mark Resolved</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Mark as Resolved?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will close the "{item.title}" report.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleStatusUpdate(item.id, 'resolved')}>
                                    Confirm
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>

                      {/* Claims section */}
                      {allClaims.length > 0 && (
                        <div className="mt-4 border-t pt-3">
                          <button
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                            onClick={() => toggleClaims(item.id)}
                          >
                            {claimsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {allClaims.length} claim{allClaims.length > 1 ? 's' : ''} submitted
                            {pendingClaims.length > 0 && (
                              <span className="text-yellow-600">({pendingClaims.length} pending)</span>
                            )}
                          </button>

                          {claimsExpanded && (
                            <div className="mt-3 space-y-3">
                              {allClaims.map((claim: Claim) => (
                                <div
                                  key={claim.id}
                                  className={`rounded-lg p-3 border text-sm ${
                                    claim.status === 'approved' ? 'bg-green-50 border-green-200' :
                                    claim.status === 'denied' ? 'bg-red-50 border-red-200' :
                                    'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{claim.name}</span>
                                        <ClaimStatusBadge status={claim.status} />
                                      </div>
                                      <div className="text-gray-600">Contact: {claim.contact}</div>
                                      {claim.description && (
                                        <div className="text-gray-700 mt-1">{claim.description}</div>
                                      )}
                                      <div className="text-gray-400 text-xs">
                                        Submitted: {new Date(claim.createdAt).toLocaleString()}
                                      </div>
                                    </div>

                                    {claim.status === 'pending' && (
                                      <div className="flex gap-2 shrink-0">
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              Approve
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Approve this claim?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will approve {claim.name}'s claim for "{item.title}" and automatically deny all other pending claims. The claimant will be notified.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleApproveClaim(item.id, claim.id)}>
                                                Approve Claim
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>

                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                                              <XCircle className="w-3 h-3 mr-1" />
                                              Deny
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Deny this claim?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will deny {claim.name}'s claim for "{item.title}". They will be notified.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                className="bg-red-600 hover:bg-red-700"
                                                onClick={() => handleDenyClaim(item.id, claim.id)}
                                              >
                                                Deny Claim
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
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
    </div>
  );
};

export default AdminDashboard;
