import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, 
  Gift, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Banknote,
  Copy,
  Share2,
  Target,
  Award,
  Zap
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";
import { apiRequest } from "@/lib/queryClient";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function PointsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastEnhanced();
  const queryClient = useQueryClient();
  const [exchangeAmount, setExchangeAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: ""
  });

  // Mock data - replace with real API calls
  const pointsData = {
    totalPoints: user?.totalPoints || 0,
    todayPoints: 0,
    weeklyPoints: 350,
    monthlyPoints: 1250,
    exchangeRate: 10, // 10 points = 1 Naira
    dailyLoginStreak: 7,
    nextReward: 500
  };

  const pointsHistory = [
    { id: 1, type: "earned", source: "daily_login", points: 100, description: "Daily login bonus", date: "2025-07-07" },
    { id: 2, type: "earned", source: "referral_signup", points: 1000, description: "Friend signup bonus", date: "2025-07-06" },
    { id: 3, type: "earned", source: "referral_purchase", points: 5000, description: "Referral purchase bonus", date: "2025-07-05" },
    { id: 4, type: "spent", source: "points_exchange", points: -2000, description: "Exchanged for ₦200", date: "2025-07-04" }
  ];

  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    pendingEarnings: 2500,
    totalEarned: 15000,
    referralCode: user?.referralCode || "USER123ABC"
  };

  const dailyLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/points/daily-login', {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      showSuccess("Daily Login Bonus", `You earned ${data.points} points!`);
    },
    onError: (error: any) => {
      if (error.message.includes('already claimed')) {
        showError("Already Claimed", "You've already claimed today's login bonus!");
      } else {
        showError("Error", "Failed to claim daily bonus");
      }
    }
  });

  const exchangePointsMutation = useMutation({
    mutationFn: async (data: { points: number; bankDetails: any }) => {
      const response = await apiRequest('POST', '/api/points/exchange', data);
      return response.json();
    },
    onSuccess: () => {
      showSuccess("Exchange Requested", "Your points exchange request has been submitted!");
      setExchangeAmount("");
      setBankDetails({ accountName: "", accountNumber: "", bankName: "", routingNumber: "" });
    },
    onError: () => {
      showError("Error", "Failed to submit exchange request");
    }
  });

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralStats.referralCode);
    showSuccess("Copied!", "Referral code copied to clipboard");
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${referralStats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    showSuccess("Copied!", "Referral link copied to clipboard");
  };

  const handleExchange = () => {
    const points = parseInt(exchangeAmount);
    if (!points || points < 1000) {
      showError("Invalid Amount", "Minimum exchange is 1,000 points");
      return;
    }
    if (points > pointsData.totalPoints) {
      showError("Insufficient Points", "You don't have enough points");
      return;
    }
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
      showError("Missing Details", "Please fill in all bank details");
      return;
    }

    exchangePointsMutation.mutate({ points, bankDetails });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Points & Rewards</h1>
            <p className="text-gray-600 dark:text-gray-400">Earn points and exchange them for real money</p>
          </div>

          {/* Points Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="md:col-span-2 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">Total Points</p>
                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                      {pointsData.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      ≈ ₦{(pointsData.totalPoints / pointsData.exchangeRate).toLocaleString()}
                    </p>
                  </div>
                  <Coins className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{pointsData.weeklyPoints}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Login Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{pointsData.dailyLoginStreak}</p>
                    <p className="text-xs text-gray-500">days</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="earn" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="earn">Earn Points</TabsTrigger>
              <TabsTrigger value="exchange">Exchange</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Earn Points Tab */}
            <TabsContent value="earn" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Daily Login */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                      Daily Login
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">100</div>
                        <div className="text-sm text-gray-600">Points per day</div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => dailyLoginMutation.mutate()}
                        disabled={dailyLoginMutation.isPending}
                      >
                        {dailyLoginMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Gift className="h-4 w-4 mr-2" />
                            Claim Daily Bonus
                          </>
                        )}
                      </Button>
                      <div className="text-xs text-center text-gray-500">
                        Streak: {pointsData.dailyLoginStreak} days
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Referral System */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-500" />
                      Refer Friends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Signup:</span>
                          <span className="font-semibold">1,000 pts</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>List Agent:</span>
                          <span className="font-semibold">3,000 pts</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Purchase:</span>
                          <span className="font-semibold">5,000 pts</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" onClick={shareReferralLink}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Other Ways to Earn */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-purple-500" />
                      Other Ways
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>List an Agent</span>
                        <span className="font-semibold">500 pts</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Complete Order</span>
                        <span className="font-semibold">200 pts</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Leave Review</span>
                        <span className="font-semibold">50 pts</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        More ways to earn coming soon!
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Exchange Tab */}
            <TabsContent value="exchange" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Banknote className="h-5 w-5 mr-2 text-green-500" />
                      Exchange Points for Naira
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Exchange Rate:</strong> {pointsData.exchangeRate} points = ₦1
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                        Minimum exchange: 1,000 points (₦100)
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="exchangeAmount">Points to Exchange</Label>
                      <Input
                        id="exchangeAmount"
                        type="number"
                        placeholder="Enter points amount"
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(e.target.value)}
                        min="1000"
                        max={pointsData.totalPoints}
                      />
                      {exchangeAmount && (
                        <div className="text-sm text-gray-600 mt-1">
                          = ₦{(parseInt(exchangeAmount) / pointsData.exchangeRate).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>Bank Details</Label>
                      <Input
                        placeholder="Account Name"
                        value={bankDetails.accountName}
                        onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                      />
                      <Input
                        placeholder="Account Number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      />
                      <Input
                        placeholder="Bank Name"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                      />
                    </div>

                    <Button 
                      className="w-full"
                      onClick={handleExchange}
                      disabled={exchangePointsMutation.isPending}
                    >
                      {exchangePointsMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          Exchange Points
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Exchange History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">2,000 points</div>
                          <div className="text-sm text-gray-600">₦200 • Pending</div>
                        </div>
                        <Badge variant="secondary">Processing</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">5,000 points</div>
                          <div className="text-sm text-gray-600">₦500 • Completed</div>
                        </div>
                        <Badge variant="default">Paid</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      Your Referral Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={referralStats.referralCode} 
                        readOnly 
                        className="font-mono text-center text-lg"
                      />
                      <Button variant="outline" size="sm" onClick={copyReferralCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{referralStats.totalReferrals}</div>
                        <div className="text-sm text-gray-600">Total Referrals</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{referralStats.totalEarned.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Points Earned</div>
                      </div>
                    </div>

                    <Button className="w-full" onClick={shareReferralLink}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Referral Link
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Referral Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm">Friend Signs Up</span>
                        </div>
                        <Badge variant="outline">1,000 pts</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm">Friend Lists Agent</span>
                        </div>
                        <Badge variant="outline">3,000 pts</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center">
                          <Zap className="h-5 w-5 text-purple-500 mr-2" />
                          <span className="text-sm">Friend Purchases</span>
                        </div>
                        <Badge variant="outline">5,000 pts</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Points History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pointsHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            item.type === 'earned' 
                              ? 'bg-green-100 dark:bg-green-900/20' 
                              : 'bg-red-100 dark:bg-red-900/20'
                          }`}>
                            {item.type === 'earned' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowRight className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-gray-600">{item.date}</div>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.type === 'earned' ? '+' : ''}{item.points.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}