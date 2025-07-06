import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart } from "lucide-react";
import { Agent, User } from "@shared/schema";
import AgentDetailModal from "./AgentDetailModal";

interface AgentCardProps {
  agent: Agent;
  seller?: User;
}

export default function AgentCard({ agent, seller }: AgentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    // TODO: Add to favorites API call
  };

  // Check if agent has a free package
  const isFreeAgent = agent.freeDescription && agent.freeDescription.trim().length > 0;
  const hasPreview = agent.demoUrl && agent.demoUrl.trim().length > 0;

  return (
    <>
      <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 cursor-pointer">
        <CardContent className="p-6" onClick={() => setIsModalOpen(true)}>
          <div className="flex items-center mb-4">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={seller?.profileImageUrl || ""} />
              <AvatarFallback>
                {seller?.firstName?.[0] || seller?.email?.[0] || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-secondary">{agent.title}</h3>
              <p className="text-sm text-gray-500">
                by {seller?.firstName || seller?.email?.split('@')[0] || "Seller"}
              </p>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-secondary mb-2 line-clamp-2">
            {agent.description}
          </h4>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(Number(agent.avgRating) || 0) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {Number(agent.avgRating).toFixed(1) || "0.0"} ({agent.totalReviews || 0})
              </span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {seller?.sellerLevel === 'top_rated' ? 'Top Rated' : 
               seller?.sellerLevel === 'level2' ? 'Level 2 Seller' : 
               'Level 1 Seller'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isFreeAgent ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Free
                </Badge>
              ) : (
                <span className="text-lg font-bold text-secondary">
                  From ${agent.basicPrice}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="p-2"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
              {!isFreeAgent && hasPreview && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (agent.demoUrl) {
                      window.open(agent.demoUrl, '_blank');
                    }
                  }}
                >
                  Preview
                </Button>
              )}
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AgentDetailModal
        agent={agent}
        seller={seller}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
