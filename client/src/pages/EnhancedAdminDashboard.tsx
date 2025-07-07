import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Bot, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Star,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Globe,
  Eye,
  Edit,
  Trash2,
  Ban,
  UnlockKeyhole,
  Crown,
  Award,
  Target,
  Filter,
  Search,
  Download,
  RefreshCw,
  Plus,
  X,
  MessageSquare,
  FileText,
  Zap,
  Trending
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";
import { apiRequest } from "@/lib/queryClient";

export default function EnhancedAdminDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastEnhanced();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock admin data - replace with real API calls
  const adminStats = {
    totalUsers: 12547,
    totalSellers: 2847,
    totalAgents: 8934,
    totalOrders: 45623,
    totalRevenue: 2847692.50,
    monthlyRevenue: 298456.75,
    platformFee: 5, // percentage
    activeUsers: 8945,
    pendingAgents: 23,
    reportedAgents: 7,
    userGrowth: 12.5,
    revenueGrowth: 8.7
  };

  const topSellers = [
    { id: 1, name: "AI Solutions Pro", email: "seller1@example.com", revenue: 45678.90, agents: 12, rating: 4.9 },
    { id: 2, name: "DataBot Expert", email: "seller2@example.com", revenue: 38429.50, agents: 8, rating: 4.8 },
    { id: 3, name: "ML Wizard", email: "seller3@example.com", revenue: 32156.25, agents: 15, rating: 4.7 }
  ];

  const recentUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "user", joinDate: "2025-07-07", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "seller", joinDate: "2025-07-06", status: "active" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "user", joinDate: "2025-07-05", status: "pending" }
  ];

  const flaggedAgents = [
    { id: 1, title: "Suspicious AI Tool", seller: "Unknown User", reports: 5, reason: "Malicious content" },
    { id: 2, title: "Broken Agent", seller: "Test Seller", reports: 3, reason: "Not working" }
  ];

  const platformSettings = {
    commissionRate: 5,
    minimumPayout: 50,
    autoApproval: false,
    maintenanceMode: false,
    allowNewRegistrations: true,
    emailNotifications: true
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
        variant={activeTab === "users" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("users")}
      >
        <Users className="mr-3 h-4 w-4" />
        Users & Sellers
      </Button>
      <Button 
        variant={activeTab === "agents" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("agents")}
      >
        <Bot className="mr-3 h-4 w-4" />
        Agents Management
      </Button>
      <Button 
        variant={activeTab === "orders" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("orders")}
      >
        <ShoppingCart className="mr-3 h-4 w-4" />
        Orders & Payments
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
        variant={activeTab === "moderation" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("moderation")}
      >
        <Shield className="mr-3 h-4 w-4" />
        Moderation
      </Button>
      <Button 
        variant={activeTab === "settings" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => setActiveTab("settings")}
      >
        <Settings className="mr-3 h-4 w-4" />
        Platform Settings
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Admin Sidebar */}
          <div className="hidden lg:block lg:w-64 bg-white dark:bg-gray-800 shadow-sm border-r dark:border-gray-700 lg:min-h-screen">
            <div className="p-6">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Admin Panel</h3>
                  <Badge variant="destructive">Super Admin</Badge>
                </div>
              </div>
              <Navigation />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Platform management and oversight</p>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Users</p>
                          <p className="text-2xl font-bold text-blue-700">{adminStats.totalUsers.toLocaleString()}</p>
                          <p className="text-xs text-green-600">+{adminStats.userGrowth}% this month</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Total Agents</p>
                          <p className="text-2xl font-bold text-purple-700">{adminStats.totalAgents.toLocaleString()}</p>
                          <p className="text-xs text-yellow-600">{adminStats.pendingAgents} pending approval</p>
                        </div>
                        <Bot className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-700">${adminStats.totalRevenue.toLocaleString()}</p>
                          <p className="text-xs text-green-600">+{adminStats.revenueGrowth}% this month</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Active Orders</p>
                          <p className="text-2xl font-bold text-orange-700">{adminStats.totalOrders.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">All time</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue and Growth Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Monthly Revenue</span>
                          <span className="font-semibold">${adminStats.monthlyRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Platform Fee ({adminStats.platformFee}%)</span>
                          <span className="font-semibold">${(adminStats.monthlyRevenue * adminStats.platformFee / 100).toLocaleString()}</span>
                        </div>
                        <Progress value={75} className="w-full" />
                        <div className="text-xs text-gray-500">75% of monthly target reached</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Sellers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topSellers.map((seller, index) => (
                          <div key={seller.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">{index + 1}</Badge>
                              <div>
                                <div className="font-medium">{seller.name}</div>
                                <div className="text-sm text-gray-500">{seller.agents} agents</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${seller.revenue.toLocaleString()}</div>
                              <div className="text-sm text-yellow-600">{seller.rating} ⭐</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pending Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Agent Approvals</span>
                        <Badge variant="secondary">{adminStats.pendingAgents}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reported Content</span>
                        <Badge variant="destructive">{adminStats.reportedAgents}</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        Review All
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Status</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <Badge variant="default">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active Users</span>
                        <span className="font-semibold">{adminStats.activeUsers.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">New Users Today</span>
                        <span className="font-semibold">127</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Orders Today</span>
                        <span className="font-semibold">89</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue Today</span>
                        <span className="font-semibold">$12,345</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Platform Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Platform Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        Platform Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                        <Input 
                          id="commissionRate" 
                          type="number" 
                          defaultValue={platformSettings.commissionRate}
                          min="1"
                          max="50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minimumPayout">Minimum Payout ($)</Label>
                        <Input 
                          id="minimumPayout" 
                          type="number" 
                          defaultValue={platformSettings.minimumPayout}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-approve Agents</Label>
                          <p className="text-sm text-gray-600">Automatically approve new agent listings</p>
                        </div>
                        <Switch defaultChecked={platformSettings.autoApproval} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-gray-600">Put platform in maintenance mode</p>
                        </div>
                        <Switch defaultChecked={platformSettings.maintenanceMode} />
                      </div>
                      <Button>Save Configuration</Button>
                    </CardContent>
                  </Card>

                  {/* User Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        User Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow New Registrations</Label>
                          <p className="text-sm text-gray-600">Enable new user sign-ups</p>
                        </div>
                        <Switch defaultChecked={platformSettings.allowNewRegistrations} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-600">Send platform notifications to users</p>
                        </div>
                        <Switch defaultChecked={platformSettings.emailNotifications} />
                      </div>
                      <div>
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <Textarea 
                          id="welcomeMessage" 
                          rows={3} 
                          defaultValue="Welcome to AgentMarket! Start exploring AI agents today."
                        />
                      </div>
                      <Button>Update Settings</Button>
                    </CardContent>
                  </Card>

                  {/* Analytics & Reporting */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Analytics & Reporting
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export User Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export Revenue Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export Agent Analytics
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export Platform Logs
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Security & Compliance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Security & Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SSL Certificate</span>
                        <Badge variant="default">Valid</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">GDPR Compliance</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Backup</span>
                        <Badge variant="default">Daily</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        View Security Report
                      </Button>
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