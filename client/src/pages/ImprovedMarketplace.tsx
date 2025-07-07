import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Bot,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Eye,
  Heart,
  ShoppingCart,
  X,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import Layout from "@/components/Layout";
import AgentCard from "@/components/AgentCard";
import AgentDetailModal from "@/components/AgentDetailModal";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";

export default function ImprovedMarketplace() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const { showSuccess, showError } = useToastEnhanced();

  // State management
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);

  // Parse URL search params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const urlSearch = params.get('search');
    const urlCategory = params.get('category');
    
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [searchParams]);

  // Fetch data
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents', selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);
      
      const response = await fetch(`/api/agents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    },
  });

  // Filter agents based on local filters
  const filteredAgents = agents.filter(agent => {
    if (priceRange && (agent.basicPrice < priceRange[0] || agent.basicPrice > priceRange[1])) {
      return false;
    }
    if (onlyFeatured && !agent.featured) return false;
    if (onlyNew) {
      const createdDate = new Date(agent.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (createdDate < weekAgo) return false;
    }
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    setLocation(`/marketplace?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("popular");
    setPriceRange([0, 1000]);
    setOnlyFeatured(false);
    setOnlyNew(false);
    setLocation('/marketplace');
  };

  const featuredCategories = categories.slice(0, 6);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                AI Agent Marketplace
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                Discover, deploy, and scale AI agents built by expert developers worldwide
              </p>
              
              {/* Enhanced Search Bar */}
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search AI agents... (e.g., content writer, data analyzer)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-6 text-lg"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-64 py-6">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" size="lg" className="px-8 py-6">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </form>
              </div>
            </div>

            {/* Quick Category Links */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {featuredCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center space-y-2 bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80"
                  onClick={() => {
                    setSelectedCategory(category.id.toString());
                    const params = new URLSearchParams();
                    params.append('category', category.id.toString());
                    setLocation(`/marketplace?${params.toString()}`);
                  }}
                >
                  <Bot className="h-6 w-6" />
                  <span className="text-sm font-medium">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.agentCount || 0}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-80">
              <div className="sticky top-8 space-y-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-primary hover:text-primary/80"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Sort Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Sort By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Price Range */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Price Range</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}+</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Filters */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured" className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span>Featured Only</span>
                      </Label>
                      <Switch
                        id="featured"
                        checked={onlyFeatured}
                        onCheckedChange={setOnlyFeatured}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new" className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span>New This Week</span>
                      </Label>
                      <Switch
                        id="new"
                        checked={onlyNew}
                        onCheckedChange={setOnlyNew}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === "" ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory("")}
                      >
                        All Categories
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id.toString() ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => setSelectedCategory(category.id.toString())}
                        >
                          <span>{category.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {category.agentCount || 0}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'AI Agents'}
                  </h2>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
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

              {/* Active Filters */}
              {(searchQuery || selectedCategory || onlyFeatured || onlyNew) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {searchQuery}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {categories.find(c => c.id.toString() === selectedCategory)?.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
                    </Badge>
                  )}
                  {onlyFeatured && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Featured
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setOnlyFeatured(false)} />
                    </Badge>
                  )}
                  {onlyNew && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      New This Week
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setOnlyNew(false)} />
                    </Badge>
                  )}
                </div>
              )}

              {/* Results Grid/List */}
              {agentsLoading ? (
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-48 w-full mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-16">
                  <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No agents found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Try adjusting your search criteria or browse different categories
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button onClick={clearFilters}>
                      Clear Filters
                    </Button>
                    <Button variant="outline" onClick={() => setLocation('/create-agent')}>
                      <Plus className="h-4 w-4 mr-2" />
                      List Your Agent
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {filteredAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setIsDetailModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <AgentDetailModal
            agent={selectedAgent}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedAgent(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}