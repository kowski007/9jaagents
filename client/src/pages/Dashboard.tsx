import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingCart, 
  CheckCircle, 
  DollarSign, 
  MessageSquare,
  Heart,
  TrendingUp,
  Star,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

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
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeOrders = orders.filter((order: any) => 
    order.status === 'pending' || order.status === 'in_progress'
  );
  const completedOrders = orders.filter((order: any) => order.status === 'completed');
  const totalSpent = completedOrders.reduce((sum: number, order: any) => 
    sum + parseFloat(order.totalAmount), 0
  );

  const favoriteAgents = favorites.map((fav: any) => 
    agents.find((agent: any) => agent.id === fav.agentId)
  ).filter(Boolean);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-secondary">
                      {user?.firstName || user?.email?.split('@')[0] || "User"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user?.buyerLevel === 'level3' ? 'Buyer Level 3' :
                       user?.buyerLevel === 'level2' ? 'Buyer Level 2' : 'Buyer Level 1'}
                    </p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  <Button variant="default" className="w-full justify-start">
                    <TrendingUp className="mr-3 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingCart className="mr-3 h-4 w-4" />
                    My Orders
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="mr-3 h-4 w-4" />
                    Favorites
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="mr-3 h-4 w-4" />
                    Messages
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setLocation('/seller-dashboard')}
                  >
                    <Star className="mr-3 h-4 w-4" />
                    Become a Seller
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Active Orders</p>
                      <p className="text-2xl font-bold text-blue-700">{activeOrders.length}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-semibold">Completed</p>
                      <p className="text-2xl font-bold text-green-700">{completedOrders.length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-semibold">Total Spent</p>
                      <p className="text-2xl font-bold text-purple-700">${totalSpent.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setLocation('/')}
                    >
                      Browse Agents
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-secondary">
                            Order #{order.id}
                          </h4>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 
                                   order.status === 'in_progress' ? 'secondary' : 'outline'}
                          >
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          ${order.totalAmount} • {order.packageType} Package
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {order.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                Leave Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card>
              <CardHeader>
                <CardTitle>Favorite Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteAgents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No favorites yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setLocation('/')}
                    >
                      Browse Agents
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteAgents.slice(0, 4).map((agent: any) => (
                      <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-secondary mb-2">{agent.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {agent.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-primary">
                            From ${agent.basicPrice}
                          </span>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
