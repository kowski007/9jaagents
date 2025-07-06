import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DollarSign, 
  ShoppingCart, 
  Star, 
  MessageSquare,
  Plus,
  Edit,
  TrendingUp,
  BarChart3,
  Bot,
  Eye,
  Pause,
  Play
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

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

  const { data: sellerAgents = [] } = useQuery({
    queryKey: ['/api/seller/agents'],
    enabled: isAuthenticated,
  });

  const { data: sellerOrders = [] } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders?type=seller');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const toggleAgentStatusMutation = useMutation({
    mutationFn: async ({ agentId, isActive }: { agentId: number; isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/agents/${agentId}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/agents'] });
      toast({
        title: "Success",
        description: "Agent status updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update agent status. Please try again.",
        variant: "destructive",
      });
    },
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

  const activeOrders = sellerOrders.filter((order: any) => 
    order.status === 'pending' || order.status === 'in_progress'
  );
  const completedOrders = sellerOrders.filter((order: any) => order.status === 'completed');
  const totalEarnings = completedOrders.reduce((sum: number, order: any) => 
    sum + parseFloat(order.amount), 0
  );
  const totalReviews = sellerAgents.reduce((sum: number, agent: any) => 
    sum + (agent.totalReviews || 0), 0
  );

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
                      {user?.sellerLevel === 'top_rated' ? 'Top Rated Seller' :
                       user?.sellerLevel === 'level2' ? 'Level 2 Seller' : 'Level 1 Seller'}
                    </p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  <Button variant="default" className="w-full justify-start">
                    <TrendingUp className="mr-3 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bot className="mr-3 h-4 w-4" />
                    My Agents
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setLocation('/create-agent')}
                  >
                    <Plus className="mr-3 h-4 w-4" />
                    Create Agent
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingCart className="mr-3 h-4 w-4" />
                    Orders
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart3 className="mr-3 h-4 w-4" />
                    Analytics
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Total Earnings</p>
                      <p className="text-2xl font-bold text-blue-700">${totalEarnings.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-semibold">Active Orders</p>
                      <p className="text-2xl font-bold text-green-700">{activeOrders.length}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-semibold">Total Reviews</p>
                      <p className="text-2xl font-bold text-purple-700">{totalReviews}</p>
                    </div>
                    <Star className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-semibold">Response Rate</p>
                      <p className="text-2xl font-bold text-orange-700">{user?.responseRate || 100}%</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Agents */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My AI Agents</CardTitle>
                  <Button onClick={() => setLocation('/create-agent')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Agent
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sellerAgents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No agents created yet</p>
                    <Button onClick={() => setLocation('/create-agent')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Agent
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellerAgents.map((agent: any) => (
                      <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-secondary">{agent.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={agent.isActive ? "default" : "secondary"}>
                              {agent.isActive ? "Active" : "Paused"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAgentStatusMutation.mutate({
                                agentId: agent.id,
                                isActive: !agent.isActive
                              })}
                              disabled={toggleAgentStatusMutation.isPending}
                            >
                              {agent.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {agent.totalOrders || 0} orders • {agent.avgRating?.toFixed(1) || "0.0"} rating • ${agent.basicPrice}-${agent.premiumPrice || agent.basicPrice} pricing
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Created: {new Date(agent.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            +${(parseFloat(agent.basicPrice) * (agent.totalOrders || 0)).toFixed(2)} earned
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {sellerOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders received yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellerOrders.slice(0, 5).map((order: any) => (
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
                          ${order.amount} • {order.packageType} Package
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Message Buyer
                            </Button>
                          </div>
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
