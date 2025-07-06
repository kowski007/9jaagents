import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Bot, 
  Shield, 
  Zap, 
  Users,
  TrendingUp,
  Search,
  PenTool,
  Code,
  Palette,
  Languages
} from "lucide-react";
import Layout from "@/components/Layout";
import AuthModal from "@/components/AuthModal";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: "Writing", icon: PenTool, count: 1234 },
    { name: "Coding", icon: Code, count: 987 },
    { name: "Design", icon: Palette, count: 756 },
    { name: "Analytics", icon: TrendingUp, count: 543 },
    { name: "Translation", icon: Languages, count: 432 },
    { name: "Automation", icon: Bot, count: 321 },
  ];

  const popularTags = [
    "Content Writing",
    "Code Generation", 
    "Data Analysis",
    "Image Generation",
    "Translation"
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {popularTags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="px-4 py-2 bg-white bg-opacity-20 text-white text-sm cursor-pointer hover:bg-opacity-30 transition-all"
                  onClick={() => setLocation(`/?search=${encodeURIComponent(tag)}`)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
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
            {categories.map((category) => (
              <Card 
                key={category.name}
                className="text-center p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer"
                onClick={() => setLocation(`/?category=${category.name.toLowerCase()}`)}
              >
                <CardContent className="p-0">
                  <category.icon className="h-12 w-12 text-primary mb-3 mx-auto" />
                  <h3 className="font-semibold text-secondary">{category.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{category.count} agents</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">How It Works</h2>
            <p className="text-gray-600">Get started with AI agents in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Browse & Search</h3>
              <p className="text-gray-600">
                Discover thousands of AI agents across different categories and specializations
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Choose & Purchase</h3>
              <p className="text-gray-600">
                Select the perfect package for your needs and make a secure payment
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive high-quality AI-powered results delivered on time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trust our AI agents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-green-600"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-secondary"
              onClick={() => setLocation('/')}
            >
              Browse Agents
            </Button>
          </div>
        </div>
      </section>
      </div>
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </Layout>
  );
}