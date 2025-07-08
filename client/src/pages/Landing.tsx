import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bot, 
  Shield, 
  Star, 
  Users, 
  TrendingUp, 
  Zap, 
  CheckCircle,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Headphones,
  Palette,
  Search,
  ShoppingCart,
  PenTool, 
  Code, 
  Languages,
  Filter
} from "lucide-react";
import AgentCard from "@/components/AgentCard";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Parse URL params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const urlSearch = searchParams.get('search');

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">

      {/* Hero Section with Search */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
            🚀 New: AI Agent Marketplace
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            The Future of AI
            <br />
            <span className="text-4xl md:text-6xl">Is Here</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover, purchase, and deploy powerful AI agents for your business. 
            From customer service to content creation, find the perfect AI solution 
            in our curated marketplace.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
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
                className="px-8 py-4 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
          </form>

          {urlSearch && (
            <div className="mb-8">
              <Badge variant="secondary" className="bg-white bg-opacity-20 text-blue-600">
                Searching for: {urlSearch}
              </Badge>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-3 text-lg border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900"
              onClick={() => window.location.href = '/login'}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Start Selling
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{agents.length || '1,000+'}+</div>
              <div className="text-gray-600 dark:text-gray-300">AI Agents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
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
                      selectedCategory === category.id ? 'border-blue-600' : 'hover:border-blue-600'
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  >
                    <CardContent className="p-0">
                      <IconComponent className="h-12 w-12 text-blue-600 mb-3 mx-auto" />
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
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

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose AgentMarket?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We make it easy to find, purchase, and deploy AI agents for your business
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-300">Enterprise-grade security and 99.9% uptime</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600 dark:text-gray-300">All agents are tested and reviewed by experts</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">Simple APIs and one-click deployment</p>
            </div>
            <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-orange-700">Earn Rewards</h3>
              <p className="text-gray-700">Earn points for daily logins, referrals, and activities. Exchange for real money!</p>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-purple-700">Referral System</h3>
              <p className="text-gray-700">Invite friends and earn up to 5,000 points per successful referral</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300">Expert support team ready to help you succeed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using AI agents to automate and grow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">AgentMarket</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                The premier marketplace for AI agents. Discover, purchase, and deploy intelligent automation solutions for your business.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Sell Agents
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    API Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AgentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </Layout>
  );
}
