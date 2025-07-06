import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Bot, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Activity,
  Star,
  MessageSquare,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardStats {
  totalUsers: number;
  totalAgents: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeAgents: number;
  userGrowth: number;
  revenueGrowth: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Check if user is admin
  if (!user || (user as any).role !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-violet-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-purple-100">
            <div className="w-16 h-16 bg-gradient-purple rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    },
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  if (usersLoading || agentsLoading || ordersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-violet-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-purple rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate stats
  const stats: DashboardStats = {
    totalUsers: (users as any)?.length || 0,
    totalAgents: (agents as any)?.length || 0,
    totalOrders: (orders as any)?.length || 0,
    totalRevenue: (orders as any)?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0,
    pendingOrders: (orders as any)?.filter((order: any) => order.status === 'pending')?.length || 0,
    activeAgents: (agents as any)?.filter((agent: any) => agent.isActive)?.length || 0,
    userGrowth: 12.5,
    revenueGrowth: 8.2,
  };

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
      user: { className: "bg-blue-100 text-blue-800 border-blue-200" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`${config.className} font-medium border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Welcome back, {(user as any)?.firstName || 'Admin'}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="border-purple-200 hover:bg-purple-50 text-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button className="bg-gradient-purple hover:opacity-90 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-hover border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-purple opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <div className="p-2 bg-gradient-purple rounded-lg shadow-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers}</div>
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">+{stats.userGrowth}%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-gray-600">Active Agents</CardTitle>
                <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg shadow-lg">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.activeAgents}</div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">{stats.totalAgents} total agents</div>
                  <Progress 
                    value={(stats.activeAgents / Math.max(stats.totalAgents, 1)) * 100} 
                    className="h-1.5" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-r from-blue-500 to-violet-500 opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                <div className="p-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg shadow-lg">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalOrders}</div>
                <div className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                  <span className="text-sm text-yellow-600 font-medium">{stats.pendingOrders} pending</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(stats.totalRevenue)}</div>
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">+{stats.revenueGrowth}%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white/90 backdrop-blur-sm border border-purple-100 shadow-lg p-1 h-12">
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-2"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="agents" 
                  className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-2"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Agents
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-2"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Orders
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-10 w-64 bg-white/90 backdrop-blur-sm border-purple-200 focus:border-purple-400"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 text-purple-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-purple-100 bg-gradient-purple-light">
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage user accounts and permissions across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-purple-50">
                    {(users as any)?.map((user: any) => (
                      <div key={user.id} className="p-6 hover:bg-purple-25 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-14 w-14 border-2 border-purple-100 shadow-lg">
                              <AvatarImage src={user.profileImageUrl} />
                              <AvatarFallback className="bg-gradient-purple text-white text-lg font-semibold">
                                {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-lg font-semibold text-gray-900">
                                {user.firstName || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400 mt-1">ID: {user.id}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusBadge((user as any).role === 'admin' ? 'admin' : 'user')}
                                {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                              </div>
                              <div className="text-sm text-gray-500">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-purple-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Activity className="h-4 w-4 mr-2" />
                                  View Activity
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Shield className="h-4 w-4 mr-2" />
                                  Suspend User
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
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-purple-100 bg-gradient-purple-light">
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    Agent Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Monitor and manage AI agents on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-purple-50">
                    {(agents as any)?.map((agent: any) => (
                      <div key={agent.id} className="p-6 hover:bg-purple-25 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-purple rounded-xl flex items-center justify-center shadow-lg">
                              <Bot className="h-7 w-7 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900">{agent.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-1 max-w-md">{agent.description}</div>
                              <div className="flex items-center space-x-3 mt-2">
                                <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                                  {agent.category}
                                </Badge>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                                  4.8 (124)
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900 mb-1">
                                {formatCurrency(agent.basicPrice)} - {formatCurrency(agent.premiumPrice)}
                              </div>
                              <div className="text-sm text-gray-500 mb-2">
                                by {agent.sellerId}
                              </div>
                              {getStatusBadge(agent.isActive ? 'active' : 'inactive')}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-purple-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Agent
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Activity className="h-4 w-4 mr-2" />
                                  View Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
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
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-purple-100 bg-gradient-purple-light">
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Order Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Track and manage customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-purple-50">
                    {(orders as any)?.map((order: any) => (
                      <div key={order.id} className="p-6 hover:bg-purple-25 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                              <ShoppingCart className="h-7 w-7 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900">Order #{order.id}</div>
                              <div className="text-sm text-gray-500">Customer: {order.buyerId}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900 mb-1">
                                {formatCurrency(order.totalAmount)}
                              </div>
                              <div className="text-sm text-gray-500 mb-2">
                                Agent ID: {order.agentId}
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-purple-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Contact Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Generate Invoice
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}