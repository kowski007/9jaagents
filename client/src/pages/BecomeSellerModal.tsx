import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, Check, X, Shield, TrendingUp, Users } from "lucide-react";
import { useLocation } from "wouter";

interface BecomeSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeSellerModal({ isOpen, onClose }: BecomeSellerModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    expertise: "",
    experience: "",
    portfolio: "",
    motivation: "",
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const becomeSeller = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/become-seller', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Application Submitted!",
        description: "Welcome to AgentMarket as a seller! Redirecting to your seller dashboard...",
      });
      setTimeout(() => {
        setLocation('/seller-dashboard');
        onClose();
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedToStep2 = formData.businessName.trim() && formData.description.trim() && formData.expertise.trim();
  const canSubmit = canProceedToStep2 && formData.experience.trim() && formData.motivation.trim();

  const handleSubmit = () => {
    if (canSubmit) {
      becomeSeller.mutate(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Become a Seller on AgentMarket</DialogTitle>
          <DialogDescription>
            Join thousands of AI experts sharing their agents with the world
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-primary/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Earn Money</h3>
                  <p className="text-xs text-gray-600">Monetize your AI expertise</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Global Reach</h3>
                  <p className="text-xs text-gray-600">Connect with worldwide clients</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Secure Platform</h3>
                  <p className="text-xs text-gray-600">Protected transactions</p>
                </CardContent>
              </Card>
            </div>

            {/* Basic Information Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business/Professional Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g., AI Solutions Pro, DataBot Expert"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Brief Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what kind of AI agents you create and your specialization..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="expertise">Area of Expertise *</Label>
                <Input
                  id="expertise"
                  placeholder="e.g., NLP, Computer Vision, Automation, Data Analysis"
                  value={formData.expertise}
                  onChange={(e) => handleInputChange('expertise', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!canProceedToStep2}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">Experience Level *</Label>
                <Textarea
                  id="experience"
                  placeholder="Tell us about your experience with AI/ML, years in the field, notable projects..."
                  rows={3}
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio/Examples (Optional)</Label>
                <Input
                  id="portfolio"
                  placeholder="Link to your portfolio, GitHub, or previous work examples"
                  value={formData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="motivation">Why join AgentMarket? *</Label>
                <Textarea
                  id="motivation"
                  placeholder="What motivates you to sell AI agents? What value do you want to provide to clients?"
                  rows={3}
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                />
              </div>
            </div>

            {/* Seller Level Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="h-5 w-5 text-primary mr-2" />
                  Starting Seller Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary">Level 1 Seller</Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      You'll start as a Level 1 seller and can grow to Level 2 and Top Rated based on performance.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">5% Platform Fee</p>
                    <p className="text-xs text-gray-500">On successful orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmit || becomeSeller.isPending}
              >
                {becomeSeller.isPending ? "Submitting..." : "Become a Seller"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}