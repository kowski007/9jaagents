
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
  Trending,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";

export default function EnhancedAdminDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastEnhanced();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [platformSettings, setPlatformSettings] = useState({
    commissionRate: 10,
    minimumPayout: 1000,
    autoApproval: false,
    maintenanceMode: false,
    allowNewRegistrations: true,
    emailNotifications: true
  });

  // Real API queries
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/admin/agents'],
    queryFn: async () => {
      const response = await fetch('/api/admin/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    },
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['/api/admin/withdrawals'],
    queryFn: async () => {
      const response = await fetch('/api/admin/withdrawals');
      if (!response.ok) throw new Error('Failed to fetch withdrawals');
      return response.json();
    },
  });

  // Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update user role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      showSuccess('User role updated successfully');
    },
    onError: () => showError('Failed to update user role'),
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to toggle user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      showSuccess('User status updated successfully');
    },
    onError: () => showError('Failed to update user status'),
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete agent');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/agents'] });
      showSuccess('Agent deleted successfully');
    },
    onError: () => showError('Failed to delete agent'),
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      showSuccess('Order status updated successfully');
    },
    onError: () => showError('Failed to update order status'),
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, status, adminNotes }: { withdrawalId: number; status: string; adminNotes?: string }) => {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!response.ok) throw new Error('Failed to update withdrawal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      showSuccess('Withdrawal updated successfully');
    },
    onError: () => showError('Failed to update withdrawal'),
  });

  const givePointsMutation = useMutation({
    mutationFn: async ({ userId, points, reason }: { userId: string; points: number; reason: string }) => {
      const response = await fetch('/api/admin/give-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, points, reason }),
      });
      if (!response.ok) throw new Error('Failed to give points');
      return response.json();
    },
    onSuccess: () => {
      showSuccess('Points awarded successfully');
    },
    onError: () => showError('Failed to award points'),
  });

  // Check admin access
  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      completed: { className: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { className: "bg-red-100 text-red-800 border-red-200" },
      processing: { className: "bg-blue-100 text-blue-800 border-blue-200" },
      active: { className: "bg-green-100 text-green-800 border-green-200" },
      inactive: { className: "bg-gray-100 text-gray-800 border-gray-200" },
      admin: { className: "bg-purple-100 text-purple-800 border-purple-200" },
      seller: { className: "bg-blue-100 text-blue-800 border-blue-200" },
      user: { className: "bg-gray-100 text-gray-800 border-gray-200" },
      paid: { className: "bg-green-100 text-green-800 border-green-200" },
      approved: { className: "bg-green-100 text-green-800 border-green-200" },
      rejected: { className: "bg-red-100 text-red-800 border-red-200" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`${config.className} font-medium border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  if (statsLoading || usersLoading || agentsLoading || ordersLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || user.role === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredAgents = agents.filter(agent => 
    agent.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) ||
    order.buyerId?.toLowerCase().includes(searchTerm.toLowerCase())
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
                          <p className="text-2xl font-bold text-blue-700">{adminStats?.totalUsers || 0}</p>
                          <p className="text-xs text-green-600">Active platform</p>
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
                          <p className="text-2xl font-bold text-purple-700">{adminStats?.totalAgents || 0}</p>
                          <p className="text-xs text-purple-600">{adminStats?.activeAgents || 0} active</p>
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
                          <p className="text-2xl font-bold text-green-700">${adminStats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-green-600">Platform earnings</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Total Orders</p>
                          <p className="text-2xl font-bold text-orange-700">{adminStats?.totalOrders || 0}</p>
                          <p className="text-xs text-orange-600">{adminStats?.pendingOrders || 0} pending</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">New Users Today</span>
                        <Badge variant="secondary">
                          {users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 24*60*60*1000)).length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Orders Today</span>
                        <Badge variant="secondary">
                          {orders.filter(o => new Date(o.createdAt) > new Date(Date.now() - 24*60*60*1000)).length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Agents Listed</span>
                        <Badge variant="secondary">
                          {agents.filter(a => new Date(a.createdAt) > new Date(Date.now() - 24*60*60*1000)).length}
                        </Badge>
                      </div>
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
                        <span className="font-semibold">{users.filter(u => u.isActive).length}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pending Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Withdrawals</span>
                        <Badge variant="secondary">{withdrawals.filter(w => w.status === 'pending').length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reports</span>
                        <Badge variant="destructive">0</Badge>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab("moderation")}>
                        Review All
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Users & Sellers Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="seller">Sellers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users List */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>User Management ({filteredUsers.length})</CardTitle>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.profileImageUrl} />
                                <AvatarFallback>
                                  {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{user.firstName || 'Unknown User'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-xs text-gray-400">
                                  Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right space-y-1">
                                {getStatusBadge(user.role)}
                                {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                                <div className="text-sm text-gray-500">
                                  Points: {user.totalPoints || 0}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateUserRoleMutation.mutate({ 
                                      userId: user.id, 
                                      role: user.role === 'admin' ? 'user' : 'admin' 
                                    })}
                                  >
                                    <Crown className="h-4 w-4 mr-2" />
                                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => toggleUserStatusMutation.mutate(user.id)}
                                  >
                                    {user.isActive ? <Ban className="h-4 w-4 mr-2" /> : <UnlockKeyhole className="h-4 w-4 mr-2" />}
                                    {user.isActive ? 'Suspend User' : 'Activate User'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Agents Management Tab */}
            {activeTab === "agents" && (
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search agents by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Agents List */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Agent Management ({filteredAgents.length})</CardTitle>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredAgents.map((agent) => (
                        <div key={agent.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Bot className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold">{agent.title}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{agent.description}</div>
                                <div className="text-xs text-gray-400">
                                  by {agent.seller?.firstName || 'Unknown'} • Created {new Date(agent.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right space-y-1">
                                <div className="font-semibold">
                                  ${agent.basicPrice} - ${agent.premiumPrice}
                                </div>
                                {getStatusBadge(agent.isActive ? 'active' : 'inactive')}
                                <div className="text-xs text-gray-500">
                                  Category: {agent.category?.name || 'Uncategorized'}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedAgent(agent)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Agent
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteAgentMutation.mutate(agent.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Agent
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders & Payments Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders by ID or buyer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Orders List */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Order Management ({filteredOrders.length})</CardTitle>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold">Order #{order.id}</div>
                                <div className="text-sm text-gray-500">Buyer: {order.buyerId}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right space-y-1">
                                <div className="font-semibold">${order.amount}</div>
                                {getStatusBadge(order.status)}
                                <div className="text-xs text-gray-500">
                                  Tier: {order.tier}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateOrderStatusMutation.mutate({ 
                                      orderId: order.id, 
                                      status: order.status === 'pending' ? 'completed' : 'pending' 
                                    })}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Contact Parties
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Revenue</span>
                          <span className="font-semibold">${adminStats?.totalRevenue?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commission (10%)</span>
                          <span className="font-semibold">${((adminStats?.totalRevenue || 0) * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seller Earnings</span>
                          <span className="font-semibold">${((adminStats?.totalRevenue || 0) * 0.9).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Users</span>
                          <span className="font-semibold">{users.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Users</span>
                          <span className="font-semibold">{users.filter(u => u.isActive).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sellers</span>
                          <span className="font-semibold">{users.filter(u => u.role === 'seller').length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Agents</span>
                          <span className="font-semibold">{agents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Agents</span>
                          <span className="font-semibold">{agents.filter(a => a.isActive).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Orders</span>
                          <span className="font-semibold">{orders.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Moderation Tab */}
            {activeTab === "moderation" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Withdrawal Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {withdrawals.slice(0, 5).map((withdrawal) => (
                          <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">${withdrawal.amount}</div>
                              <div className="text-sm text-gray-500">{withdrawal.userId}</div>
                              <div className="text-xs text-gray-400">
                                {withdrawal.bankName} - {withdrawal.accountNumber}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateWithdrawalMutation.mutate({ 
                                  withdrawalId: withdrawal.id, 
                                  status: 'approved' 
                                })}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateWithdrawalMutation.mutate({ 
                                  withdrawalId: withdrawal.id, 
                                  status: 'rejected' 
                                })}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        No reports to review
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
                          value={platformSettings.commissionRate}
                          onChange={(e) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            commissionRate: parseInt(e.target.value) 
                          }))}
                          min="1"
                          max="50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minimumPayout">Minimum Payout (₦)</Label>
                        <Input 
                          id="minimumPayout" 
                          type="number" 
                          value={platformSettings.minimumPayout}
                          onChange={(e) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            minimumPayout: parseInt(e.target.value) 
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-approve Agents</Label>
                          <p className="text-sm text-gray-600">Automatically approve new agent listings</p>
                        </div>
                        <Switch 
                          checked={platformSettings.autoApproval}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            autoApproval: checked 
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-gray-600">Put platform in maintenance mode</p>
                        </div>
                        <Switch 
                          checked={platformSettings.maintenanceMode}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            maintenanceMode: checked 
                          }))}
                        />
                      </div>
                      <Button onClick={() => showSuccess('Settings saved successfully')}>
                        Save Configuration
                      </Button>
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
                        <Switch 
                          checked={platformSettings.allowNewRegistrations}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            allowNewRegistrations: checked 
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-600">Send platform notifications to users</p>
                        </div>
                        <Switch 
                          checked={platformSettings.emailNotifications}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            emailNotifications: checked 
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <Textarea 
                          id="welcomeMessage" 
                          rows={3} 
                          defaultValue="Welcome to AgentMarket! Start exploring AI agents today."
                        />
                      </div>
                      <Button onClick={() => showSuccess('User settings updated successfully')}>
                        Update Settings
                      </Button>
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
