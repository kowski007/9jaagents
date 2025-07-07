import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Wallet, 
  Check, 
  Clock, 
  Star,
  Shield,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";
import { apiRequest } from "@/lib/queryClient";
import type { Agent } from "@shared/schema";

interface PurchaseModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseModal({ agent, isOpen, onClose }: PurchaseModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToastEnhanced();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet' | 'paystack'>('paystack');

  // Fetch wallet data
  const { data: wallet } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: isAuthenticated
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: { tier: string; paymentMethod: string }) => {
      const response = await apiRequest(`/api/agents/${agent.id}/purchase`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        // Redirect to Paystack
        window.location.href = data.authorization_url;
      } else {
        showSuccess("Purchase Successful", "Agent purchased successfully with wallet!");
        onClose();
        queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      }
    },
    onError: (error: any) => {
      showError("Purchase Failed", error.message || "Failed to process purchase");
    }
  });

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return "Not available";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(Number(amount));
  };

  const getTierDetails = (tier: 'basic' | 'standard' | 'premium') => {
    switch (tier) {
      case 'basic':
        return {
          name: 'Basic',
          price: agent.basicPrice,
          description: agent.basicDescription,
          deliveryDays: agent.basicDeliveryDays,
          icon: <Shield className="h-5 w-5" />
        };
      case 'standard':
        return {
          name: 'Standard',
          price: agent.standardPrice,
          description: agent.standardDescription,
          deliveryDays: agent.standardDeliveryDays,
          icon: <Star className="h-5 w-5" />
        };
      case 'premium':
        return {
          name: 'Premium',
          price: agent.premiumPrice,
          description: agent.premiumDescription,
          deliveryDays: agent.premiumDeliveryDays,
          icon: <Zap className="h-5 w-5" />
        };
    }
  };

  const selectedTierDetails = getTierDetails(selectedTier);
  const hasWalletBalance = wallet && parseFloat(wallet.balance) >= parseFloat(selectedTierDetails.price || '0');

  const handlePurchase = () => {
    if (!selectedTierDetails.price || parseFloat(selectedTierDetails.price) <= 0) {
      showError("Invalid Tier", "Selected tier is not available");
      return;
    }

    if (selectedPaymentMethod === 'wallet' && !hasWalletBalance) {
      showError("Insufficient Balance", "Your wallet balance is insufficient for this purchase");
      return;
    }

    purchaseMutation.mutate({
      tier: selectedTier,
      paymentMethod: selectedPaymentMethod
    });
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-center text-gray-600">Please log in to purchase this agent.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase {agent.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tier Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Package</h3>
            <RadioGroup value={selectedTier} onValueChange={(value) => setSelectedTier(value as any)}>
              <div className="space-y-3">
                {/* Basic Tier */}
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="basic" id="basic" />
                  <Label htmlFor="basic" className="flex-1 cursor-pointer">
                    <Card className="p-4 hover:border-primary transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Basic</h4>
                            <p className="text-sm text-gray-600">{agent.basicDescription}</p>
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {agent.basicDeliveryDays} days delivery
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(agent.basicPrice)}</p>
                        </div>
                      </div>
                    </Card>
                  </Label>
                </div>

                {/* Standard Tier */}
                {agent.standardPrice && (
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <Card className="p-4 hover:border-primary transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Star className="h-5 w-5 text-yellow-600" />
                            <div>
                              <h4 className="font-medium">Standard</h4>
                              <p className="text-sm text-gray-600">{agent.standardDescription}</p>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {agent.standardDeliveryDays} days delivery
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(agent.standardPrice)}</p>
                            <Badge variant="secondary">Popular</Badge>
                          </div>
                        </div>
                      </Card>
                    </Label>
                  </div>
                )}

                {/* Premium Tier */}
                {agent.premiumPrice && (
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label htmlFor="premium" className="flex-1 cursor-pointer">
                      <Card className="p-4 hover:border-primary transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Zap className="h-5 w-5 text-purple-600" />
                            <div>
                              <h4 className="font-medium">Premium</h4>
                              <p className="text-sm text-gray-600">{agent.premiumDescription}</p>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {agent.premiumDeliveryDays} days delivery
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(agent.premiumPrice)}</p>
                            <Badge variant="default">Best Value</Badge>
                          </div>
                        </div>
                      </Card>
                    </Label>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>

          {/* Payment Method Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <RadioGroup value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as any)}>
              <div className="space-y-3">
                {/* Wallet Payment */}
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="wallet" id="wallet" disabled={!hasWalletBalance} />
                  <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                    <Card className={`p-4 transition-colors ${hasWalletBalance ? 'hover:border-primary' : 'opacity-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Wallet className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium">Wallet Balance</h4>
                            <p className="text-sm text-gray-600">
                              Available: {formatCurrency(wallet?.balance || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {hasWalletBalance ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">Sufficient</Badge>
                          ) : (
                            <Badge variant="destructive">Insufficient</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Label>
                </div>

                {/* Paystack Payment */}
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="paystack" id="paystack" />
                  <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                    <Card className="p-4 hover:border-primary transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Card Payment</h4>
                            <p className="text-sm text-gray-600">Pay with debit/credit card via Paystack</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">Secure</Badge>
                        </div>
                      </div>
                    </Card>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Purchase Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-medium">{selectedTierDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">{formatCurrency(selectedTierDetails.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-medium">{selectedTierDetails.deliveryDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">
                    {selectedPaymentMethod === 'wallet' ? 'Wallet' : 'Card Payment'}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedTierDetails.price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={purchaseMutation.isPending}>
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={purchaseMutation.isPending || (!selectedTierDetails.price || parseFloat(selectedTierDetails.price) <= 0)}
            >
              {purchaseMutation.isPending ? "Processing..." : 
               selectedPaymentMethod === 'wallet' ? "Purchase Now" : "Continue to Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}