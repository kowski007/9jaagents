import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showNumber = true,
  className = "" 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex text-yellow-400">
        {[...Array(maxRating)].map((_, i) => (
          <Star 
            key={i} 
            className={`${sizeClasses[size]} ${i < Math.floor(rating) ? 'fill-current' : ''}`} 
          />
        ))}
      </div>
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
