import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CreditCard, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";

export default function Checkout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [paymentData, setPaymentData] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    address: "",
    city: "",
    country: "Nigeria",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['/api/agents'],
    enabled: cartItems.length > 0,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: (order) => {
      // Initialize Paystack payment
      initiatePaystackPayment(order);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Success",
        description: "Payment successful! Your orders have been created.",
      });
      setLocation('/dashboard');
    },
  });

  const getCartItemDetails = (cartItem: any) => {
    const agent = agents.find((a: any) => a.id === cartItem.agentId);
    if (!agent) return null;

    let price = 0;
    let description = '';
    let deliveryDays = 0;
    
    switch (cartItem.packageType) {
      case 'basic':
        price = agent.basicPrice;
        description = agent.basicDescription;
        deliveryDays = agent.basicDeliveryDays;
        break;
      case 'standard':
        price = agent.standardPrice;
        description = agent.standardDescription;
        deliveryDays = agent.standardDeliveryDays;
        break;
      case 'premium':
        price = agent.premiumPrice;
        description = agent.premiumDescription;
        deliveryDays = agent.premiumDeliveryDays;
        break;
    }

    return {
      agent,
      price,
      description,
      deliveryDays,
      total: price * cartItem.quantity,
    };
  };

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const details = getCartItemDetails(item);
    return sum + (details?.total || 0);
  }, 0);

  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  const initiatePaystackPayment = (order: any) => {
    // @ts-ignore
    const handler = PaystackPop.setup({
      key: process.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxx', // Replace with actual public key
      email: paymentData.email,
      amount: Math.round(total * 100), // Amount in kobo
      currency: 'NGN',
      ref: `order_${order.id}_${Date.now()}`,
      metadata: {
        order_id: order.id,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order.id
          }
        ]
      },
      callback: function(response: any) {
        // Payment was successful
        console.log('Payment successful:', response);
        clearCartMutation.mutate();
      },
      onClose: function() {
        toast({
          title: "Payment Cancelled",
          description: "You cancelled the payment. Your order is still saved.",
          variant: "destructive",
        });
      }
    });
    handler.openIframe();
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty.",
        variant: "destructive",
      });
      return;
    }

    // Validate payment data
    if (!paymentData.email || !paymentData.firstName || !paymentData.lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create orders for each cart item
    for (const item of cartItems) {
      const details = getCartItemDetails(item);
      if (!details) continue;

      const orderData = {
        sellerId: details.agent.sellerId,
        agentId: item.agentId,
        packageType: item.packageType,
        amount: details.price,
        serviceFee: details.price * 0.05,
        totalAmount: details.price + (details.price * 0.05),
        deliveryDate: new Date(Date.now() + details.deliveryDays * 24 * 60 * 60 * 1000),
        paystackReference: `order_${Date.now()}`,
      };

      createOrderMutation.mutate(orderData);
      break; // For demo, just process the first item
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-secondary mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some AI agents to your cart before checking out.</p>
              <Button onClick={() => setLocation('/')}>
                Browse Agents
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Checkout</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handlePayment} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-4">Payment Information</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm text-blue-700">Secure payment powered by Paystack</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={paymentData.email}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-4">Billing Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={paymentData.firstName}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={paymentData.lastName}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={paymentData.address}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={paymentData.city}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, city: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Select value={paymentData.country} onValueChange={(value) => setPaymentData(prev => ({ ...prev, country: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nigeria">Nigeria</SelectItem>
                              <SelectItem value="Ghana">Ghana</SelectItem>
                              <SelectItem value="Kenya">Kenya</SelectItem>
                              <SelectItem value="South Africa">South Africa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={createOrderMutation.isPending}
                  >
                    <Lock className="mr-2 h-5 w-5" />
                    {createOrderMutation.isPending ? 'Processing...' : `Pay $${total.toFixed(2)} with Paystack`}
                  </Button>
                </form>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cartItems.map((item: any) => {
                        const details = getCartItemDetails(item);
                        if (!details) return null;

                        return (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{details.agent.title}</p>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {item.packageType}
                              </Badge>
                            </div>
                            <span className="text-sm font-semibold">${details.total.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      
                      <Separator />
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Subtotal</span>
                        <span className="text-sm">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Service Fee (5%)</span>
                        <span className="text-sm">${serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-6 text-center">
                      By clicking "Pay" you agree to our Terms of Service and Privacy Policy
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paystack Script */}
      <script src="https://js.paystack.co/v1/inline.js"></script>
    </Layout>
  );
}
