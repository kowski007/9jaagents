import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  CheckCircle, 
  DollarSign, 
  MessageSquare,
  Heart,
  TrendingUp,
  Star,
  Clock,
  User,
  Bell,
  Settings,
  Package,
  BarChart3,
  Award,
  Zap,
  Target,
  Menu,
  X,
  Coins,
  Users,
  Wallet
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";
import Layout from "@/components/Layout";
import BecomeSellerModal from "@/pages/BecomeSellerModal";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showError, showSuccess } = useToastEnhanced();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showError("Unauthorized", "You are logged out. Logging in again...");
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, showError]);

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders?type=buyer');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['/api/agents'],
    enabled: favorites.length > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeOrders = orders.filter((order: any) => 
    order.status === 'pending' || order.status === 'in_progress'
  );

  // Calculate real stats from data
  const completedOrders = orders?.filter((order: any) => order.status === 'completed') || [];
  const totalSpent = completedOrders.reduce((sum: number, order: any) => sum + parseFloat(order.amount || 0), 0);
  const agentsPurchased = completedOrders.length;
  const favoriteAgentsCount = favorites?.length || 0;
  const recentActivity = orders?.length || 0;

  const favoriteAgents = favorites.map((fav: any) => 
    agents.find((agent: any) => agent.id === fav.agentId)
  ).filter(Boolean);

  // Navigation component
  const Navigation = ({ className = "" }: { className?: string }) => (
    <div className={`p-6 ${className}`}>
      <div className="flex items-center mb-8">
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src={user?.profileImageUrl || ""} />
          <AvatarFallback className="bg-primary text-white">
            {user?.firstName?.[0] || user?.email?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {user?.firstName || user?.email?.split('@')[0] || "User"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.buyerLevel === 'level3' ? 'Premium' :
             user?.buyerLevel === 'level2' ? 'Pro' : 'Basic'} Member
          </p>
        </div>
      </div>

      <nav className="space-y-1">
        <Button 
          variant={activeTab === "overview" ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => {
            setActiveTab("overview");
            setIsMobileMenuOpen(false);
          }}
        >
          <BarChart3 className="mr-3 h-4 w-4" />
          Overview
        </Button>
        <Button 
          variant={activeTab === "orders" ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => {
            setActiveTab("orders");
            setIsMobileMenuOpen(false);
          }}
        >
          <ShoppingCart className="mr-3 h-4 w-4" />
          My Orders
        </Button>
        <Button 
          variant={activeTab === "favorites" ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => {
            setActiveTab("favorites");
            setIsMobileMenuOpen(false);
          }}
        >
          <Heart className="mr-3 h-4 w-4" />
          Favorites
        </Button>
        <Button 
          variant={activeTab === "messages" ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => {
            setActiveTab("messages");
            setIsMobileMenuOpen(false);
          }}
        >
          <MessageSquare className="mr-3 h-4 w-4" />
          Messages
        </Button>
        <Button 
          variant={activeTab === "notifications" ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => {
            setActiveTab("notifications");
            setIsMobileMenuOpen(false);
          }}
        >
          <Bell className="mr-3 h-4 w-4" />
          Notifications
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => {
            setLocation('/points');
            setIsMobileMenuOpen(false);
          }}
        >
          <Coins className="mr-3 h-4 w-4" />
          Points & Rewards
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => {
            setLocation('/referrals');
            setIsMobileMenuOpen(false);
          }}
        >
          <Users className="mr-3 h-4 w-4" />
          Referrals
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => {
            setLocation('/wallet');
            setIsMobileMenuOpen(false);
          }}
        >
          <Wallet className="mr-3 h-4 w-4" />
          My Wallet
        </Button>
        <Button 
          variant={activeTab === "settings" ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => {
            setActiveTab("settings");
            setIsMobileMenuOpen(false);
          }}
        >
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </Button>
        <div className="pt-4 border-t">
          {user?.role === 'seller' || user?.role === 'admin' ? (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setLocation('/seller-dashboard');
                setIsMobileMenuOpen(false);
              }}
            >
              <Star className="mr-3 h-4 w-4" />
              Seller Dashboard
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setShowBecomeSellerModal(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Star className="mr-3 h-4 w-4" />
              Become a Seller
            </Button>
          )}
        </div>
      </nav>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col lg:flex-row">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-primary text-white">
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {user?.firstName || user?.email?.split('@')[0] || "User"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.buyerLevel === 'level3' ? 'Premium' :
                     user?.buyerLevel === 'level2' ? 'Pro' : 'Basic'} Member
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="absolute top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl">
                <div className="flex justify-end p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Navigation className="-mt-6" />
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64 bg-white dark:bg-gray-800 shadow-sm border-r dark:border-gray-700 lg:min-h-screen">
            <Navigation />
          </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back, {(user as any)?.firstName || "User"}!</p>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Orders</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{activeOrders.length}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">In progress</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                          <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{completedOrders.length}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total orders</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Spent</p>
                          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        ${totalSpent.toFixed(2)}
                      </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">All time</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                          <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Favorites</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{favoriteAgentsCount}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Saved agents</p>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                          <Heart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/marketplace')}>
                        <Package className="mr-2 h-4 w-4" />
                        Browse Agents
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("orders")}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        View Orders
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("favorites")}>
                        <Heart className="mr-2 h-4 w-4" />
                        My Favorites
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Award className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold">
                          {user?.buyerLevel === 'level3' ? 'Premium' :
                           user?.buyerLevel === 'level2' ? 'Pro' : 'Basic'} Member
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {user?.buyerLevel === 'level3' ? 'Unlimited access' :
                           user?.buyerLevel === 'level2' ? 'Advanced features' : 'Standard access'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {orders.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                          <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No activity yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                    {orders?.slice(0, 5).map((order: any) => (
<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Order #{order.id}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Agent ID: {order.agentId}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                            <p className="text-sm font-semibold text-green-600 mt-1">${order.amount}</p>
                          </div>
                        </div>
                    ))}
                  </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Orders</h2>
                  <Button onClick={() => setLocation('/')}>
                    <Package className="mr-2 h-4 w-4" />
                    Browse Agents
                  </Button>
                </div>

                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-6">Start by browsing our amazing AI agents</p>
                      <Button onClick={() => setLocation('/')}>
                        Browse Agents
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">Order #{order.id}</h4>
                              <p className="text-gray-600">{order.packageType} Package</p>
                            </div>
                            <Badge 
                              variant={order.status === 'completed' ? 'default' : 
                                     order.status === 'in_progress' ? 'secondary' : 'outline'}
                            >
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Amount</p>
                              <p className="font-semibold">${order.totalAmount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="font-semibold capitalize">{order.status.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {order.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                Leave Review
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Contact Seller
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Favorite Agents</h2>
                  <Button onClick={() => setLocation('/')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Discover More
                  </Button>
                </div>

                {favoriteAgents.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                      <p className="text-gray-500 mb-6">Save agents you like to easily find them later</p>
                      <Button onClick={() => setLocation('/')}>
                        Browse Agents
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteAgents.map((agent: any) => (
                      <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h4 className="font-semibold text-lg mb-2">{agent.title}</h4>
                          <p className="text-gray-600 mb-4 line-clamp-3">{agent.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              From ${agent.basicPrice}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Heart className="h-4 w-4 text-red-500 fill-current" />
                              </Button>
                              <Button size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Messages</h2>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    New Message
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500 mb-6">Your conversations with sellers will appear here</p>
                    <Button onClick={() => setLocation('/')}>
                      Browse Agents
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Notifications</h2>
                  <Button variant="outline" size="sm">
                    Mark all as read
                  </Button>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Welcome to AgentMarket!</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Start exploring our marketplace of AI agents to find the perfect solution for your needs.
                          </p>
                          <p className="text-gray-400 text-xs mt-2">Just now</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Account Created Successfully</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Your account has been set up and you can now start browsing and purchasing AI agents.
                          </p>
                          <p className="text-gray-400 text-xs mt-2">5 minutes ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Star className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Explore Featured Agents</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Check out our hand-picked selection of top-rated AI agents across different categories.
                          </p>
                          <p className="text-gray-400 text-xs mt-2">1 hour ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Account Settings</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{user?.firstName || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Member Level</label>
                        <Badge variant="outline">
                          {user?.buyerLevel === 'level3' ? 'Premium' :
                           user?.buyerLevel === 'level2' ? 'Pro' : 'Basic'}
                        </Badge>
                      </div>
                      <Button variant="outline">
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive updates about your orders</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Privacy Settings</p>
                          <p className="text-sm text-gray-500">Manage your data preferences</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Payment Methods</p>
                          <p className="text-sm text-gray-500">Manage payment options</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      <BecomeSellerModal 
        isOpen={showBecomeSellerModal} 
        onClose={() => setShowBecomeSellerModal(false)} 
      />
    </Layout>
  );
}