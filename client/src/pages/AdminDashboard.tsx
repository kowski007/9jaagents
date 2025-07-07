import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Trash2,
  Save,
  Settings
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface PlatformSettings {
  siteName: string;
  commissionRate: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  pointsToNairaRate: number;
  defaultUserRole: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  autoApproveAgents: boolean;
  emailNotifications: boolean;
  maxUploadSize: number;
  supportEmail: string;
}

function SystemHealthTab() {
  const { data: systemHealth, isLoading } = useQuery({
    queryKey: ['/api/admin/system-health'],
    queryFn: async () => {
      const response = await fetch('/api/admin/system-health');
      if (!response.ok) throw new Error('Failed to fetch system health');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-purple-100 bg-gradient-purple-light">
        <CardTitle className="text-xl text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          System Health
        </CardTitle>
        <CardDescription className="text-gray-600">
          Real-time system performance and health metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border ${
            systemHealth?.database?.status === 'healthy' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Database</h3>
              {systemHealth?.database?.status === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className={`text-lg font-bold mb-2 ${
              systemHealth?.database?.status === 'healthy' ? 'text-green-700' : 'text-red-700'
            }`}>
              {systemHealth?.database?.status === 'healthy' ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-sm text-gray-600">
              Response time: {systemHealth?.database?.responseTime || 'N/A'}
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">API Status</h3>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-700 mb-2">
              {systemHealth?.api?.status || 'Unknown'}
            </div>
            <p className="text-sm text-gray-600">
              Uptime: {Math.floor((systemHealth?.api?.uptime || 0) / 3600)}h {Math.floor(((systemHealth?.api?.uptime || 0) % 3600) / 60)}m
            </p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Storage</h3>
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-700 mb-2">Available</div>
            <p className="text-sm text-gray-600">
              Capacity: {systemHealth?.storage?.capacity || '85%'} used
            </p>
          </div>
          
          {systemHealth?.metrics && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 md:col-span-2 lg:col-span-3">
              <h3 className="font-semibold text-gray-900 mb-4">Platform Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xl font-bold text-gray-900">{systemHealth.metrics.totalUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-xl font-bold text-gray-900">{systemHealth.metrics.activeUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Agents</p>
                  <p className="text-xl font-bold text-gray-900">{systemHealth.metrics.totalAgents}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{systemHealth.metrics.totalOrders}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformSettingsForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings, isLoading } = useQuery<PlatformSettings>({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  const [formData, setFormData] = useState<PlatformSettings>({
    siteName: "AgentMarket",
    commissionRate: 10,
    minWithdrawal: 1000,
    maxWithdrawal: 500000,
    pointsToNairaRate: 1,
    defaultUserRole: "user",
    maintenanceMode: false,
    registrationEnabled: true,
    autoApproveAgents: false,
    emailNotifications: true,
    maxUploadSize: 10,
    supportEmail: "support@agentmarket.com"
  });

  // Update form data when settings are loaded
  useState(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: PlatformSettings) => {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setHasChanges(false);
      toast({
        title: "Settings Updated",
        description: "Platform settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Commission Settings */}
        <Card className="border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
            <CardTitle className="flex items-center text-purple-900">
              <DollarSign className="h-5 w-5 mr-2" />
              Commission Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="commissionRate" className="text-sm font-medium text-gray-700">
                Platform Fee (%)
              </Label>
              <Input
                id="commissionRate"
                type="number"
                min="1"
                max="50"
                value={formData.commissionRate}
                onChange={(e) => handleInputChange('commissionRate', parseInt(e.target.value))}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {formData.commissionRate}% commission on all transactions
              </p>
            </div>
            <div>
              <Label htmlFor="minWithdrawal" className="text-sm font-medium text-gray-700">
                Minimum Payout (₦)
              </Label>
              <Input
                id="minWithdrawal"
                type="number"
                min="100"
                value={formData.minWithdrawal}
                onChange={(e) => handleInputChange('minWithdrawal', parseInt(e.target.value))}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum amount sellers can withdraw
              </p>
            </div>
            <div>
              <Label htmlFor="maxWithdrawal" className="text-sm font-medium text-gray-700">
                Maximum Withdrawal (₦)
              </Label>
              <Input
                id="maxWithdrawal"
                type="number"
                min="1000"
                value={formData.maxWithdrawal}
                onChange={(e) => handleInputChange('maxWithdrawal', parseInt(e.target.value))}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum amount per withdrawal request
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card className="border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
            <CardTitle className="flex items-center text-purple-900">
              <Settings className="h-5 w-5 mr-2" />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Maintenance Mode
                </Label>
                <p className="text-xs text-gray-500">
                  Temporarily disable public access
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
                <Badge variant={formData.maintenanceMode ? "destructive" : "default"}>
                  {formData.maintenanceMode ? "On" : "Off"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Registration
                </Label>
                <p className="text-xs text-gray-500">
                  Allow new user registrations
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.registrationEnabled}
                  onCheckedChange={(checked) => handleInputChange('registrationEnabled', checked)}
                />
                <Badge variant={formData.registrationEnabled ? "default" : "destructive"}>
                  {formData.registrationEnabled ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Auto-approve Agents
                </Label>
                <p className="text-xs text-gray-500">
                  Automatically approve new agent listings
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.autoApproveAgents}
                  onCheckedChange={(checked) => handleInputChange('autoApproveAgents', checked)}
                />
                <Badge variant={formData.autoApproveAgents ? "default" : "secondary"}>
                  {formData.autoApproveAgents ? "On" : "Off"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings */}
      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
          <CardTitle className="flex items-center text-purple-900">
            <Shield className="h-5 w-5 mr-2" />
            Additional Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">
                Site Name
              </Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="pointsToNairaRate" className="text-sm font-medium text-gray-700">
                Points to Naira Rate
              </Label>
              <Input
                id="pointsToNairaRate"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.pointsToNairaRate}
                onChange={(e) => handleInputChange('pointsToNairaRate', parseFloat(e.target.value))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="defaultUserRole" className="text-sm font-medium text-gray-700">
                Default User Role
              </Label>
              <Select
                value={formData.defaultUserRole}
                onValueChange={(value) => handleInputChange('defaultUserRole', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxUploadSize" className="text-sm font-medium text-gray-700">
                Max Upload Size (MB)
              </Label>
              <Input
                id="maxUploadSize"
                type="number"
                min="1"
                max="100"
                value={formData.maxUploadSize}
                onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="supportEmail" className="text-sm font-medium text-gray-700">
                Support Email
              </Label>
              <Input
                id="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Switch
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
              <Label className="text-sm font-medium text-gray-700">
                Email Notifications
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={!hasChanges || updateSettingsMutation.isPending}
          className="bg-gradient-purple hover:opacity-90 text-white px-8"
        >
          {updateSettingsMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // All hooks must be called before any conditional returns
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!(user && (user as any).role === "admin"), // Only run if user is admin
  });

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    },
    enabled: !!(user && (user as any).role === "admin"), // Only run if user is admin
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!(user && (user as any).role === "admin"), // Only run if user is admin
  });

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      return response.json();
    },
    enabled: !!(user && (user as any).role === "admin"), // Only run if user is admin
  });

  // Action handlers
  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: suspend ? 'Administrative action' : undefined })
      });
      
      if (!response.ok) throw new Error('Failed to update user status');
      
      toast({
        title: "Success",
        description: `User ${suspend ? 'suspended' : 'activated'} successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) throw new Error('Failed to update user role');
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleViewUserActivity = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/activity`);
      if (!response.ok) throw new Error('Failed to fetch user activity');
      
      const activity = await response.json();
      // For now, just show a toast with basic info
      toast({
        title: "User Activity",
        description: `Orders: ${activity.totalOrders}, Sales: ${activity.totalSales}, Agents: ${activity.totalAgents}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user activity",
        variant: "destructive",
      });
    }
  };

  const handleToggleAgentStatus = async (agentId: number, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/agents/${agentId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) throw new Error('Failed to update agent status');
      
      toast({
        title: "Success",
        description: "Agent status updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete agent');
      
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes })
      });
      
      if (!response.ok) throw new Error('Failed to update order status');
      
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  // Check if user is admin - moved after hooks
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

  if (usersLoading || agentsLoading || ordersLoading || statsLoading) {
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

  // Use real stats from API
  const stats: DashboardStats = {
    totalUsers: adminStats?.totalUsers || 0,
    totalAgents: adminStats?.totalAgents || 0,
    totalOrders: adminStats?.totalOrders || 0,
    totalRevenue: adminStats?.totalRevenue || 0,
    pendingOrders: adminStats?.pendingOrders || 0,
    activeAgents: adminStats?.activeAgents || 0,
    userGrowth: adminStats?.userGrowth || 12,
    revenueGrowth: adminStats?.revenueGrowth || 8,
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
        <div className="flex">
          {/* Mobile Menu Button */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-white shadow-md"
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          )}

          {/* Admin Sidebar */}
          <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-40 lg:z-auto w-64 bg-white shadow-lg border-r border-purple-100 min-h-screen`}>
            <div className="p-6">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-purple w-12 h-12 rounded-full flex items-center justify-center mr-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Admin Panel</h3>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    Super Admin
                  </Badge>
                </div>
              </div>
              
              {/* Navigation Menu */}
              <nav className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Overview
                </div>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg w-full text-left">
                  <Activity className="h-4 w-4 mr-3" />
                  Dashboard
                </button>
                
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6">
                  Management
                </div>
                <button 
                  onClick={() => {
                    setActiveTab("users");
                    setIsSidebarOpen(false);
                  }} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                    activeTab === "users" 
                      ? "text-purple-700 bg-purple-100" 
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <Users className="h-4 w-4 mr-3" />
                  Users & Sellers
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("agents");
                    setIsSidebarOpen(false);
                  }} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                    activeTab === "agents" 
                      ? "text-purple-700 bg-purple-100" 
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <Bot className="h-4 w-4 mr-3" />
                  Agents Management
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("orders");
                    setIsSidebarOpen(false);
                  }} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                    activeTab === "orders" 
                      ? "text-purple-700 bg-purple-100" 
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mr-3" />
                  Orders & Payments
                </button>
                
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6">
                  Analytics
                </div>
                <button 
                  onClick={() => {
                    setActiveTab("analytics");
                    setIsSidebarOpen(false);
                  }} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                    activeTab === "analytics" 
                      ? "text-purple-700 bg-purple-100" 
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Analytics
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("moderation");
                    setIsSidebarOpen(false);
                  }} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                    activeTab === "moderation" 
                      ? "text-purple-700 bg-purple-100" 
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 mr-3" />
                  Moderation
                </button>
                
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6">
                  Settings
                </div>
                <button 
                  onClick={() => {
                    setActiveTab("settings");
                    setIsSidebarOpen(false);
                  }} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                    activeTab === "settings" 
                      ? "text-purple-700 bg-purple-100" 
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Platform Settings
                </button>
                <button 
                  onClick={() => {
                    setActiveTab("system");
                    setIsSidebarOpen(false);
                  }} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                    activeTab === "system" 
                      ? "text-purple-700 bg-purple-100" 
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <Activity className="h-4 w-4 mr-3" />
                  System Health
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                                <DropdownMenuItem onClick={() => handleViewUserActivity(user.id)}>
                                  <Activity className="h-4 w-4 mr-2" />
                                  View Activity
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className={user.isActive ? "text-red-600" : "text-green-600"}
                                  onClick={() => handleSuspendUser(user.id, !user.isActive)}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
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
                                <DropdownMenuItem onClick={() => window.open(`/marketplace/${agent.id}`, '_blank')}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className={agent.isActive ? "text-yellow-600" : "text-green-600"}
                                  onClick={() => handleToggleAgentStatus(agent.id, agent.isActive ? 'Admin review' : 'Approved by admin')}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {agent.isActive ? 'Suspend Agent' : 'Activate Agent'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAgent(agent.id)}>
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
                                <DropdownMenuItem onClick={() => window.open(`/orders/${order.id}`, '_blank')}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const newStatus = prompt('Enter new status (pending, in_progress, completed, cancelled, disputed):');
                                  if (newStatus) handleUpdateOrderStatus(order.id, newStatus);
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const notes = prompt('Enter admin notes (optional):');
                                  handleUpdateOrderStatus(order.id, 'completed', notes || undefined);
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => {
                                  const reason = prompt('Enter cancellation reason:');
                                  if (reason) handleUpdateOrderStatus(order.id, 'cancelled', reason);
                                }}>
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Cancel Order
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

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-purple-100 bg-gradient-purple-light">
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Platform performance metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Revenue Growth</h3>
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">+{stats.revenueGrowth}%</div>
                      <p className="text-sm text-gray-600">vs last month</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">User Growth</h3>
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">+{stats.userGrowth}%</div>
                      <p className="text-sm text-gray-600">vs last month</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Active Rate</h3>
                        <Activity className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {Math.round((stats.activeAgents / Math.max(stats.totalAgents, 1)) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">agents active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-purple-100 bg-gradient-purple-light">
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Content Moderation
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Review and moderate platform content
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Pending Reviews</h3>
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">0</div>
                      <p className="text-sm text-gray-600">agents awaiting approval</p>
                    </div>
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Reported Content</h3>
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">0</div>
                      <p className="text-sm text-gray-600">reports to review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-purple-100 bg-gradient-purple-light">
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Configure platform-wide settings and policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PlatformSettingsForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Health Tab */}
            <TabsContent value="system">
              <SystemHealthTab />
            </TabsContent>
          </Tabs>
        </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}