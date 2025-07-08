import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart, Share } from "lucide-react";
import { Agent, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AgentDetailModalProps {
  agent: Agent;
  seller?: User;
  isOpen?: boolean; // not used anymore
  onClose?: () => void; // not used anymore
}

export default function AgentDetailModal({ agent, seller }: AgentDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isFreeAgent = agent.freeDescription && agent.freeDescription.trim().length > 0;
  const [selectedPackage, setSelectedPackage] = useState<'free' | 'basic' | 'standard' | 'premium'>(isFreeAgent ? 'free' : 'basic');

  const { data: reviewsData } = useQuery({
    queryKey: [`/api/agents/${agent.id}/reviews`],
  });
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  const addToCartMutation = useMutation({
    mutationFn: async (packageType: string) => {
      if (!isAuthenticated) {
        window.location.href = '/auth';
        return;
      }
      const response = await apiRequest('POST', '/api/cart', {
        agentId: agent.id,
        packageType,
        quantity: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Agent added to cart successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add agent to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        window.location.href = '/auth';
        return;
      }
      const response = await apiRequest('POST', '/api/favorites', {
        agentId: agent.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Agent added to favorites!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const packages = [
    ...(agent.freeDescription ? [{
      type: 'free' as const,
      name: 'Free',
      price: '0',
      description: agent.freeDescription,
      deliveryDays: agent.freeDeliveryDays,
    }] : []),
    {
      type: 'basic' as const,
      name: 'Basic',
      price: agent.basicPrice,
      description: agent.basicDescription,
      deliveryDays: agent.basicDeliveryDays,
    },
    ...(agent.standardPrice ? [{
      type: 'standard' as const,
      name: 'Standard',
      price: agent.standardPrice,
      description: agent.standardDescription,
      deliveryDays: agent.standardDeliveryDays,
    }] : []),
    ...(agent.premiumPrice ? [{
      type: 'premium' as const,
      name: 'Premium',
      price: agent.premiumPrice,
      description: agent.premiumDescription,
      deliveryDays: agent.premiumDeliveryDays,
    }] : []),
  ];

  const selectedPackageData = packages.find(p => p.type === selectedPackage) || packages[0];

  // Map for emoji icons for known categories
  const categoryEmojis: Record<string, string> = {
    "Data scientists": "🧑‍🔬",
    "Bolt and Uber indrive": "🚗",
    "Loan": "💸",
    "Flight bookings": "✈️",
    "Universities": "🎓",
    "Schools": "🏫",
    "Elections": "🗳️",
    "Sport": "🏆",
    "Companies registration": "📝",
    "Lawyers": "⚖️",
    "Real Estate": "🏠",
    "Delivery 🚚": "🚚",
    "Content Creation": "✍️",
    "Pharmacy": "💊",
    "Computer Village": "💻",
    "Insurance": "🛡️",
    "Alaba": "🛒",
    "DJ": "🎧",
    "Rents": "🏢",
    "Ev naija": "🇳🇬",
    "Fuel": "⛽",
    "Local governments": "🏛️",
    "Movies": "🎬",
    "Cinema": "🍿",
    "Restaurants": "🍽️",
    "Politics": "🏛️",
    "Police": "👮",
    "Law": "⚖️",
    "Auto sales": "🚙",
    "Traffic": "🚦",
    "Travel tickets": "🎫",
    "Food": "🍲",
    "Churches": "⛪",
    "Cleaning services": "🧹",
    "Snacks": "🍪",
    "Jobs": "💼",
    "Iron sales": "🔩",
    "Advert": "📢",
    "Events": "🎉"
  };

  return (
    <div className="max-w-5xl mx-auto bg-background rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-8">
        <Avatar className="h-16 w-16 mr-4">
          <AvatarImage src={seller?.profileImageUrl || ""} />
          <AvatarFallback>
            {seller?.firstName?.[0] || seller?.email?.[0] || "S"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{agent.title}</h1>
          <p className="text-gray-600">
            by {seller?.firstName || seller?.email?.split('@')[0] || "Seller"}
          </p>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(agent.avgRating || 0) ? 'fill-current' : ''}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {typeof agent.avgRating === 'number' ? agent.avgRating.toFixed(1) : '0.0'} ({agent.totalReviews || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Video/Demo Section */}
          {agent.demoUrl && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-secondary mb-4">Demo & Preview</h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Button 
                  onClick={() => window.open(agent.demoUrl, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <span>▶</span>
                  <span>View Live Demo</span>
                </Button>
              </div>
            </div>
          )}

          <h3 className="text-xl font-semibold text-secondary mb-4">About This Agent</h3>
          <p className="text-gray-600 mb-6">{agent.description}</p>

          {/* Key Features */}
          {agent.features && agent.features.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-secondary mb-4">Key Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agent.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Use Cases */}
          {agent.useCases && agent.useCases.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-secondary mb-4">Perfect For</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agent.useCases.map((useCase, index) => (
                  <Card key={index} className="p-4 border-l-4 border-blue-500">
                    <h5 className="font-semibold text-gray-800 mb-2">{useCase.title}</h5>
                    <p className="text-sm text-gray-600">{useCase.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications */}
          {(agent.apiEndpoints || agent.supportedFormats || agent.integrations) && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-secondary mb-4">Technical Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {agent.apiEndpoints && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2">API Access</h5>
                    <p className="text-sm text-gray-600">REST API included</p>
                  </div>
                )}
                {agent.supportedFormats && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2">Supported Formats</h5>
                    <p className="text-sm text-gray-600">{agent.supportedFormats.join(', ')}</p>
                  </div>
                )}
                {agent.integrations && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2">Integrations</h5>
                    <p className="text-sm text-gray-600">{agent.integrations.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {agent.tags && agent.tags.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-secondary mb-3">Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-primary text-primary flex items-center gap-1">
                    <span>{categoryEmojis[tag] || "🏷️"}</span>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <h4 className="text-lg font-semibold text-secondary mb-3">Recent Reviews:</h4>
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((review: any) => (
                <div key={review.id} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-secondary">Anonymous User</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review this agent!</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-gray-50 sticky top-4">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-secondary mb-4">Package Options</h4>
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <Card 
                    key={pkg.type}
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg.type ? 'border-primary' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPackage(pkg.type)}
                  >
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-secondary capitalize">{pkg.name}</h5>
                      <p className="text-2xl font-bold text-secondary mt-2">${pkg.price}</p>
                      <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                      <p className="text-sm text-gray-600">{pkg.deliveryDays} days delivery</p>
                      <Button 
                        className="w-full mt-4" 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCartMutation.mutate(pkg.type);
                        }}
                        disabled={addToCartMutation.isPending}
                      >
                        {addToCartMutation.isPending ? 'Adding...' : `Select ${pkg.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full mb-3"
                  onClick={() => addToFavoritesMutation.mutate()}
                  disabled={addToFavoritesMutation.isPending}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {addToFavoritesMutation.isPending ? 'Adding...' : 'Save to Favorites'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.share?.({
                      title: agent.title,
                      text: agent.description,
                      url: window.location.href,
                    });
                  }}
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
