import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentDetailModal({ agent, seller, isOpen, onClose }: AgentDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');

  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/agents/${agent.id}/reviews`],
    enabled: isOpen,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (packageType: string) => {
      if (!isAuthenticated) {
        window.location.href = '/api/login';
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
    onError: (error) => {
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
        window.location.href = '/api/login';
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const packages = [
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage src={seller?.profileImageUrl || ""} />
                <AvatarFallback>
                  {seller?.firstName?.[0] || seller?.email?.[0] || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{agent.title}</DialogTitle>
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
                    {agent.avgRating?.toFixed(1) || "0.0"} ({agent.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-secondary mb-4">About This Agent</h3>
            <p className="text-gray-600 mb-6">{agent.description}</p>

            {agent.features && agent.features.length > 0 && (
              <>
                <h4 className="text-lg font-semibold text-secondary mb-3">What You Get:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                  {agent.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}

            {agent.tags && agent.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-secondary mb-3">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
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
      </DialogContent>
    </Dialog>
  );
}
