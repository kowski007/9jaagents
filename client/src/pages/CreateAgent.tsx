import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Bot, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

export default function ListAgent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/seller/agents'],
    enabled: isAuthenticated,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    enabled: isAuthenticated,
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

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const filteredAgents = agents.filter((agent: any) => {
    const matchesSearch = agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && agent.isActive) ||
                         (statusFilter === "inactive" && !agent.isActive);
    return matchesSearch && matchesStatus;
  });

  const sortedAgents = [...filteredAgents].sort((a: any, b: any) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price_low":
        return parseFloat(a.basicPrice) - parseFloat(b.basicPrice);
      case "price_high":
        return parseFloat(b.basicPrice) - parseFloat(a.basicPrice);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My AI Agents</h1>
              <p className="text-gray-600">Manage your AI agents and track their performance</p>
            </div>
          </div>
          <Button onClick={() => setLocation('/create-agent')}>
            <Plus className="mr-2 h-4 w-4" />
            List an Agent
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-700">
                    {agents.filter((a: any) => a.isActive).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg. Price</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ${agents.length > 0 ? (agents.reduce((sum: number, a: any) => sum + parseFloat(a.basicPrice), 0) / agents.length).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">This Month</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {agents.filter((a: any) => {
                      const agentDate = new Date(a.createdAt);
                      const now = new Date();
                      return agentDate.getMonth() === now.getMonth() && agentDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search your agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Agents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Agents ({sortedAgents.length})</span>
              {sortedAgents.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setLocation('/marketplace')}>
                  <Eye className="mr-2 h-4 w-4" />
                  View in Marketplace
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-3 w-2/3 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedAgents.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {agents.length === 0 ? "No agents listed yet" : "No agents match your filters"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {agents.length === 0 
                    ? "List your first AI agent to start selling your services"
                    : "Try adjusting your search or filters"
                  }
                </p>
                {agents.length === 0 && (
                  <Button onClick={() => setLocation('/create-agent')}>
                    <Plus className="mr-2 h-4 w-4" />
                    List Your First Agent
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAgents.map((agent: any) => (
                  <div key={agent.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-green-600 rounded-lg flex items-center justify-center">
                      <Bot className="h-8 w-8 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{agent.title}</h3>
                        <Badge variant={agent.isActive ? "default" : "secondary"}>
                          {agent.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryName(agent.categoryId)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{agent.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          From ${agent.basicPrice}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {agent.basicDeliveryDays} days
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          {agent.rating ? agent.rating.toFixed(1) : "New"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/agent/${agent.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/edit-agent/${agent.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}