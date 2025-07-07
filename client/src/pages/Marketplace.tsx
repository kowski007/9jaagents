import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PenTool, 
  Code, 
  Palette, 
  TrendingUp, 
  Languages, 
  Bot,
  Search,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List
} from "lucide-react";
import AgentCard from "@/components/AgentCard";
import Layout from "@/components/Layout";

export default function Marketplace() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState("all");

  // Parse URL params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const urlSearch = searchParams.get('search');
  const urlCategory = searchParams.get('category');

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents', selectedCategory, urlSearch, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      if (urlSearch) params.append('search', urlSearch);
      if (sortBy) params.append('sort', sortBy);

      const response = await fetch(`/api/agents?${params}`);
      return response.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    enabled: agents.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categoryIcons = {
    "Writing": PenTool,
    "Coding": Code,
    "Design": Palette,
    "Analytics": TrendingUp,
    "Translation": Languages,
    "Automation": Bot,
  };

  const filteredAgents = agents.filter((agent: any) => {
    if (priceRange === "under50" && agent.basicPrice >= 50) return false;
    if (priceRange === "50to100" && (agent.basicPrice < 50 || agent.basicPrice > 100)) return false;
    if (priceRange === "over100" && agent.basicPrice <= 100) return false;
    return true;
  });

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                AI Agent Marketplace
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Discover and hire expert AI agents for your projects
              </p>

              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex rounded-lg overflow-hidden shadow-lg">
                  <Input
                    type="text"
                    placeholder="Search for AI agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-6 py-3 text-gray-900 border-0 focus:ring-0"
                  />
                  <Button 
                    type="submit"
                    size="lg"
                    className="px-8 py-3 bg-secondary text-white hover:bg-gray-800"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Filters and Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-64 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === null ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Categories
                    </Button>
                    {categories.map((category: any) => {
                      const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Bot;
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <IconComponent className="mr-2 h-4 w-4" />
                          {category.name}
                          <span className="ml-auto text-xs text-gray-500">
                            {category.agentCount}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Price Range</h3>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under50">Under $50</SelectItem>
                      <SelectItem value="50to100">$50 - $100</SelectItem>
                      <SelectItem value="over100">Over $100</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Sort By</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold">
                    {urlSearch ? `Search Results for "${urlSearch}"` : 'All Agents'}
                  </h2>
                  <Badge variant="outline">
                    {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Agents Grid */}
              {agentsLoading ? (
                <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Card key={i} className="bg-white overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <Skeleton className="h-12 w-12 rounded-full mr-3" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                    <Button onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                      setPriceRange("all");
                      setLocation('/marketplace');
                    }}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
                  {filteredAgents.map((agent: any) => {
                    const seller = users.find((u: any) => u.id === agent.sellerId);
                    return (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        seller={seller}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}