import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PenTool, 
  Code, 
  Palette, 
  TrendingUp, 
  Languages, 
  Bot,
  Search,
  Filter
} from "lucide-react";
import AgentCard from "@/components/AgentCard";
import Layout from "@/components/Layout";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Parse URL params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const urlSearch = searchParams.get('search');
  const urlCategory = searchParams.get('category');

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents', selectedCategory, urlSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      if (urlSearch) params.append('search', urlSearch);
      
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
      setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
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

  const featuredAgents = agents.slice(0, 8);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find the Perfect AI Agent for Your Needs
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover, hire, and work with expert AI agents from around the world
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex rounded-lg overflow-hidden shadow-lg">
                <Input
                  type="text"
                  placeholder="What AI service are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 text-gray-900 text-lg border-0 focus:ring-0"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="px-8 py-4 bg-secondary text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </form>

            {urlSearch && (
              <div className="mt-4">
                <Badge variant="secondary" className="bg-white bg-opacity-20 text-white">
                  Searching for: {urlSearch}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Browse by Category</h2>
            <p className="text-gray-600">Explore AI agents across different specializations</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="text-center p-6">
                  <CardContent className="p-0">
                    <Skeleton className="h-12 w-12 mx-auto mb-3 rounded-full" />
                    <Skeleton className="h-4 w-16 mx-auto mb-2" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : (
              categories.map((category: any) => {
                const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Bot;
                return (
                  <Card 
                    key={category.id}
                    className={`text-center p-6 hover:shadow-lg transition-all cursor-pointer ${
                      selectedCategory === category.id ? 'border-primary' : 'hover:border-primary'
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  >
                    <CardContent className="p-0">
                      <IconComponent className="h-12 w-12 text-primary mb-3 mx-auto" />
                      <h3 className="font-semibold text-secondary">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{category.agentCount} agents</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Featured Agents Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              {urlSearch ? `Search Results for "${urlSearch}"` : 'Featured AI Agents'}
            </h2>
            <p className="text-gray-600">
              {urlSearch ? `Found ${agents.length} agents` : 'Top-rated agents delivering exceptional results'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agentsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
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
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : agents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No agents found.</p>
                <p className="text-gray-400 mt-2">Try adjusting your search or browse different categories.</p>
              </div>
            ) : (
              featuredAgents.map((agent: any) => {
                const seller = users.find((u: any) => u.id === agent.sellerId);
                return (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    seller={seller}
                  />
                );
              })
            )}
          </div>

          {agents.length > 8 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All {agents.length} Agents
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
