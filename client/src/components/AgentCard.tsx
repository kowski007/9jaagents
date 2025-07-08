import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, ShoppingCart, Bot } from "lucide-react";
import { Agent, User } from "@shared/schema";
import AgentDetailModal from "./AgentDetailModal";
import PurchaseModal from "./PurchaseModal";

interface AgentCardProps {
  agent: Agent;
  seller?: User;
}

export default function AgentCard({ agent, seller }: AgentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    // TODO: Add to favorites API call
  };

  // Check if agent has a free package
  const isFreeAgent = agent.freeDescription && agent.freeDescription.trim().length > 0;
  const hasPreview = agent.demoUrl && agent.demoUrl.trim().length > 0;

  // Emoji map for categories
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
    <>
      <Card className="bg-white hover:shadow-xl transition-shadow overflow-hidden border border-gray-200 rounded-2xl cursor-pointer group">
        <CardContent className="p-6" onClick={() => setIsModalOpen(true)}>
          <div className="flex items-center mb-4">
            <Avatar className="h-14 w-14 mr-4 ring-2 ring-primary">
              <AvatarImage src={seller?.profileImageUrl || ""} />
              <AvatarFallback>
                {seller?.firstName?.[0] || seller?.email?.[0] || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg text-secondary group-hover:text-primary transition-colors line-clamp-1">{agent.title}</h3>
              <p className="text-xs text-gray-500">
                by {seller?.firstName || seller?.email?.split('@')[0] || "Seller"}
              </p>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {agent.tags && agent.tags.length > 0 && agent.tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="border-primary text-primary flex items-center gap-1 text-xs px-2 py-1">
                <span>{categoryEmojis[tag] || "🏷️"}</span>
                {tag}
              </Badge>
            ))}
          </div>

          <h4 className="text-base font-medium text-gray-800 mb-2 line-clamp-2 min-h-[2.5em]">{agent.description}</h4>

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
              <span className="text-xs text-gray-600">
                {Number(agent.avgRating).toFixed(1) || "0.0"} ({agent.totalReviews || 0})
              </span>
            </div>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {seller?.sellerLevel === 'top_rated' ? 'Top Rated' : 
               seller?.sellerLevel === 'level2' ? 'Level 2 Seller' : 
               'Level 1 Seller'}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              {isFreeAgent ? (
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-2 py-1">
                  Free
                </Badge>
              ) : (
                <span className="text-base font-bold text-secondary">
                  From ${agent.basicPrice}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavorite}
                className="p-2"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
              {!isFreeAgent && hasPreview && (
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (agent.demoUrl) {
                      window.open(agent.demoUrl, '_blank');
                    }
                  }}
                  className="px-2"
                >
                  <Bot className="h-4 w-4 text-primary" />
                </Button>
              )}
              <Button 
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPurchaseModalOpen(true);
                }}
                className="px-2"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="ml-1"
              >
                View
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
      
      <PurchaseModal
        agent={agent}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </>
  );
}
