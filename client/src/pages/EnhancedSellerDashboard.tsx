import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Play,
  Home,
  User,
  Activity,
  Settings,
  Bell,
  Calendar,
  FileText,
  Award,
  Target,
  Users,
  Zap,
  CreditCard,
  Shield,
  Globe,
  Smartphone,
  Mail,
  Phone
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";
import Layout from "@/components/Layout";
import { apiRequest } from "@/lib/queryClient";

export default function EnhancedSellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToastEnhanced();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock enhanced data - replace with real API calls
  const sellerStats = {
    totalEarnings: 15847.50,
    monthlyEarnings: 3245.75,
    totalOrders: 127,
    activeAgents: 8,
    avgRating: 4.8,
    completionRate: 96,
    responseTime: "2h",
    level: "Level 2",
    nextLevelProgress: 75
  };

  const recentOrders = [
    { id: 1, agent: "AI Content Writer", buyer: "John Doe", amount: 149.99, status: "completed", date: "2025-07-07" },
    { id: 2, agent: "Data Analyzer Pro", buyer: "Jane Smith", amount: 299.99, status: "in_progress", date: "2025-07-06" },
    { id: 3, agent: "SEO Optimizer", buyer: "Mike Johnson", amount: 99.99, status: "pending", date: "2025-07-05" }
  ];

  const analytics = {
    views: [120, 135, 165, 180, 155, 170, 190],
    sales: [5, 8, 12, 6, 15, 10, 18],
    revenue: [500, 800, 1200, 600, 1500, 1000, 1800]
  };

  const Navigation = () => (
    <div className="space-y-1">
      <Button 
        variant={activeTab === "overview" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("overview")}
      >
        <BarChart3 className="mr-3 h-4 w-4" />
        Overview
      </Button>
      <Button 
        variant={activeTab === "agents" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("agents")}
      >
        <Bot className="mr-3 h-4 w-4" />
        My Agents
      </Button>
      <Button 
        variant={activeTab === "orders" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("orders")}
      >
        <ShoppingCart className="mr-3 h-4 w-4" />
        Orders
      </Button>
      <Button 
        variant={activeTab === "analytics" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("analytics")}
      >
        <TrendingUp className="mr-3 h-4 w-4" />
        Analytics
      </Button>
      <Button 
        variant={activeTab === "messages" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("messages")}
      >
        <MessageSquare className="mr-3 h-4 w-4" />
        Messages
      </Button>
      <Button 
        variant={activeTab === "earnings" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("earnings")}
      >
        <DollarSign className="mr-3 h-4 w-4" />
        Earnings
      </Button>
      <Button 
        variant={activeTab === "settings" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("settings")}
      >
        <Settings className="mr-3 h-4 w-4" />
        Settings
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64 bg-white dark:bg-gray-800 shadow-sm border-r dark:border-gray-700 lg:min-h-screen">
            <div className="p-6">
              <div className="flex items-center mb-8">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-primary text-white">
                    {user?.firstName?.[0] || user?.email?.[0] || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {user?.firstName || user?.email?.split('@')[0] || "Seller"}
                  </h3>
                  <Badge variant="secondary">{sellerStats.level} Seller</Badge>
                </div>
              </div>
              <Navigation />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your AI agent business</p>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                          <p className="text-2xl font-bold text-green-600">${sellerStats.totalEarnings.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Agents</p>
                          <p className="text-2xl font-bold text-blue-600">{sellerStats.activeAgents}</p>
                        </div>
                        <Bot className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold text-purple-600">{sellerStats.totalOrders}</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average Rating</p>
                          <p className="text-2xl font-bold text-yellow-600">{sellerStats.avgRating}</p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Seller Level Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Current Level</span>
                          <Badge variant="secondary">{sellerStats.level}</Badge>
                        </div>
                        <Progress value={sellerStats.nextLevelProgress} className="w-full" />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Progress to Top Rated</span>
                          <span>{sellerStats.nextLevelProgress}%</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Complete 25 more orders and maintain 4.9+ rating to reach Top Rated status
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Completion Rate</span>
                          <span className="font-semibold text-green-600">{sellerStats.completionRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg Response Time</span>
                          <span className="font-semibold">{sellerStats.responseTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Customer Rating</span>
                          <span className="font-semibold text-yellow-600">{sellerStats.avgRating}/5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{order.agent}</h4>
                            <p className="text-sm text-gray-600">Buyer: {order.buyer}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${order.amount}</div>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Profile Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input id="businessName" defaultValue="AI Solutions Pro" />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" rows={3} defaultValue="Expert AI agent developer with 5+ years experience" />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" defaultValue="https://aisolutionspro.com" />
                      </div>
                      <Button>Update Profile</Button>
                    </CardContent>
                  </Card>

                  {/* Notification Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="h-5 w-5 mr-2" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>New Order Alerts</Label>
                          <p className="text-sm text-gray-600">Receive notifications for new orders</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Payment Notifications</Label>
                          <p className="text-sm text-gray-600">Get notified when payments are processed</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Review Alerts</Label>
                          <p className="text-sm text-gray-600">Notifications for new reviews</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Marketing Emails</Label>
                          <p className="text-sm text-gray-600">Promotional emails and tips</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Payment Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="paypalEmail">PayPal Email</Label>
                        <Input id="paypalEmail" type="email" defaultValue="seller@example.com" />
                      </div>
                      <div>
                        <Label htmlFor="bankAccount">Bank Account</Label>
                        <Input id="bankAccount" defaultValue="****1234" />
                      </div>
                      <div>
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input id="taxId" defaultValue="12-3456789" />
                      </div>
                      <Button>Update Payment Info</Button>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Login Notifications</Label>
                          <p className="text-sm text-gray-600">Get notified of account logins</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button variant="outline">Change Password</Button>
                      <Button variant="outline">Download Account Data</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}