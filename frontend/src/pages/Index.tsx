import { useState, useEffect } from 'react';
// USIU logo is in public/usiu-logo.png
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, User, Shield, Plus, Bell, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AuthModal from '@/components/auth/AuthModal';
import ReportItemModal from '@/components/items/ReportItemModal';
import ItemCard from '@/components/items/ItemCard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useItems, Item } from '@/hooks/useItems';
import ItemDetailsModal from '@/components/items/ItemDetailsModal';
import ClaimItemModal from '@/components/items/ClaimItemModal';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('search');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { items, loading, searchItems, fetchItems } = useItems();
  const { toast } = useToast();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);


  const categories = ['all', 'electronics', 'clothing', 'accessories', 'documents', 'keys', 'bags', 'other'];

  useEffect(() => {
    searchItems(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleReportItem = (type: 'lost' | 'found') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setReportType(type);
    setIsReportModalOpen(true);
  };

  // Handler to open details
const handleViewDetails = (item: Item) => {
  setSelectedItem(item);
  setIsDetailsOpen(true);
};

 // Filter items in-memory after fetching
  const filteredItems = items.filter(item => {
    if (!item || typeof item.title !== "string" || typeof item.description !== "string") return false;
    if (item.status !== 'verified') return false;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // If user is not signed in, show only app name, slogan, and sign in option
// if (!user) {
//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 px-4">
//       {/* <div className="absolute top-4 left-4">
//         <img src="/usiu-logo.png" alt="USIU Logo" className="w-20 h-20 object-contain " />
//       </div> */}
//       <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-xl p-10 md:p-16 mb-8 border border-gray-100">
//         <div className="flex flex-col items-center space-y-3 mb-6">
//           <div className="flex items-center space-x-3">
//             <div className="w-14 h-14 bg-gradient-to-r from-black to-red-600 rounded-xl flex items-center justify-center shadow-lg">
//               <Search className="w-7 h-7 text-white" />
//             </div>
//             <h1 className="text-5xl font-extrabold bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent tracking-tight drop-shadow">
//               USIU Lost & Found
//             </h1>
//           </div>
//         </div>
//         <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 text-center max-w-lg">
//           Find What You've Lost, Help Others Find Theirs at USIU
//         </h2>
//         <p className="text-lg md:text-2xl text-gray-600 mb-10 max-w-2xl text-center">
//           Our digital lost property system connects USIU students with their missing belongings through smart matching and campus community support.
//         </p>
//         <Button
//           size="lg"
//           className="bg-gradient-to-r from-black to-red-600 text-white text-lg px-8 py-4 rounded-full shadow hover:from-red-700 hover:to-black transition"
//           onClick={() => setIsAuthModalOpen(true)}
//         >
//           Sign In
//         </Button>
//       </div>
//       <AuthModal
//         isOpen={isAuthModalOpen}
//         onClose={() => setIsAuthModalOpen(false)}
//       />
//     </div>
//   );
// }

  // If user is signed in, render the rest of the app (original content)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              {/* <img src="/usiu-logo.png" alt="USIU Logo" className="w-11 h-11 object-contain mr-8" /> */}
              <div className="w-8 h-8 bg-gradient-to-r from-black to-red-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent">
                USIU Lost & Found
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && <NotificationCenter />}
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <Badge variant={isAdmin ? "destructive" : "secondary"}>
                    {isAdmin ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        User
                      </>
                    )}
                  </Badge>
                  <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsAuthModalOpen(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {/* <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find What You've Lost, Help Others Find Theirs at USIU
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Our digital lost property system connects USIU students with their missing belongings through smart matching and campus community support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              onClick={() => handleReportItem('lost')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Report Lost Item
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => handleReportItem('found')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Report Found Item
            </Button>
          </div>
        </div> */}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="dashboard" disabled={!user}>
              <User className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Search USIU Lost & Found Items
                </CardTitle>
                <CardDescription>
                Browse through reported items or search for specific belongings lost or found at USIU
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by item name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 100 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onViewDetails={() => handleViewDetails(item)}
                    onClaim={() => {
                      setSelectedItem(item);
                      setIsClaimModalOpen(true);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-600">Try adjusting your search or check back later.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            {user ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My USIU Dashboard</CardTitle>
                    <CardDescription>
                      Manage your reported items and track their status as a USIU student
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Button 
                        className="h-20 bg-gradient-to-r from-red-600 to-red-700"
                        onClick={() => handleReportItem('lost')}
                      >
                        <div className="text-center">
                          <Plus className="w-6 h-6 mx-auto mb-1" />
                          <div>Report Lost Item (USIU)</div>
                        </div>
                      </Button>
                      <Button 
                        variant="outline"
                        className="h-20 border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => handleReportItem('found')}
                      >
                        <div className="text-center">
                          <Plus className="w-6 h-6 mx-auto mb-1" />
                          <div>Report Found Item (USIU)</div>
                        </div>
                      </Button>
                    </div>
                    {/* User's reported items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                      {items.filter(item => item.reporterId === user.id).length > 0 ? (
                        items.filter(item => item.reporterId === user.id).map(item => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            onViewDetails={() => handleViewDetails(item)}
                            onClaim={() => {
                              setSelectedItem(item);
                              setIsClaimModalOpen(true);
                            }}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No reported items</h3>
                          <p className="text-gray-600">Your reported items will appear here once you submit a report. This dashboard is for USIU students only.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in required</h3>
                  <p className="text-gray-600 mb-4">Please sign in with your USIU account to access your dashboard.</p>
                  <Button onClick={() => setIsAuthModalOpen(true)}>
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <ReportItemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        type={reportType}
        refreshItems={fetchItems}
      />
      <ItemDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        item={selectedItem}
      />
      <ClaimItemModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        item={selectedItem}
        refreshItems={fetchItems}
      />
    </div>
  );
};

export default Index;