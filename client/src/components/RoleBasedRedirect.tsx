import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function RoleBasedRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we're on the landing page and user is authenticated
    if (!isLoading && isAuthenticated && user && location === "/") {
      // Check if user has seller privileges
      if (user.role === "seller" || user.role === "admin") {
        // If they're a seller, go to seller dashboard
        setLocation("/seller-dashboard");
      } else {
        // If they're just a buyer, go to buyer dashboard
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, location, setLocation]);

  return null; // This component doesn't render anything
}