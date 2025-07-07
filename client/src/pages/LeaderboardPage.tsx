import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  DollarSign,
  Bot,
  ShoppingCart,
  Star,
  Crown,
  Zap,
  Target,
  Users,
  Coins
} from "lucide-react";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("sellers");

  // Mock data - replace with real API calls
  const topSellers = [
    {
      id: 1,
      name: "AI Solutions Pro",
      avatar: "",
      totalEarnings: 125000,
      agentsSold: 245,
      rating: 4.9,
      totalReviews: 89,
      level: "Top Rated",
      joinDate: "2024-01-15",
      monthlyGrowth: 15.2
    },
    {
      id: 2,
      name: "DataBot Expert",
      avatar: "",
      totalEarnings: 98500,
      agentsSold: 187,
      rating: 4.8,
      totalReviews: 72,
      level: "Level 2",
      joinDate: "2024-02-20",
      monthlyGrowth: 12.8
    },
    {
      id: 3,
      name: "ML Wizard",
      avatar: "",
      totalEarnings: 87300,
      agentsSold: 156,
      rating: 4.7,
      totalReviews: 64,
      level: "Level 2",
      joinDate: "2024-03-10",
      monthlyGrowth: 18.5
    },
    {
      id: 4,
      name: "Automation King",
      avatar: "",
      totalEarnings: 76200,
      agentsSold: 134,
      rating: 4.6,
      totalReviews: 58,
      level: "Level 1",
      joinDate: "2024-04-05",
      monthlyGrowth: 22.1
    },
    {
      id: 5,
      name: "Code Assistant Pro",
      avatar: "",
      totalEarnings: 65400,
      agentsSold: 112,
      rating: 4.5,
      totalReviews: 45,
      level: "Level 1",
      joinDate: "2024-05-12",
      monthlyGrowth: 19.7
    }
  ];

  const topBuyers = [
    {
      id: 1,
      name: "Tech Startup Inc",
      avatar: "",
      totalSpent: 45000,
      agentsPurchased: 28,
      favoriteCategory: "Automation",
      memberSince: "2024-01-10",
      level: "Premium"
    },
    {
      id: 2,
      name: "Digital Agency",
      avatar: "",
      totalSpent: 38500,
      agentsPurchased: 22,
      favoriteCategory: "Design",
      memberSince: "2024-02-15",
      level: "Pro"
    },
    {
      id: 3,
      name: "E-commerce Solutions",
      avatar: "",
      totalSpent: 32000,
      agentsPurchased: 19,
      favoriteCategory: "Analytics",
      memberSince: "2024-03-01",
      level: "Pro"
    },
    {
      id: 4,
      name: "Content Creator Hub",
      avatar: "",
      totalSpent: 28750,
      agentsPurchased: 17,
      favoriteCategory: "Writing",
      memberSince: "2024-03-20",
      level: "Basic"
    },
    {
      id: 5,
      name: "Marketing Experts",
      avatar: "",
      totalSpent: 25600,
      agentsPurchased: 15,
      favoriteCategory: "Analytics",
      memberSince: "2024-04-01",
      level: "Basic"
    }
  ];

  const topByPoints = [
    {
      id: 1,
      name: "Points Master",
      avatar: "",
      totalPoints: 87500,
      pointsThisMonth: 12300,
      referrals: 45,
      loginStreak: 89,
      level: "Diamond"
    },
    {
      id: 2,
      name: "Referral King",
      avatar: "",
      totalPoints: 76200,
      pointsThisMonth: 9800,
      referrals: 38,
      loginStreak: 67,
      level: "Platinum"
    },
    {
      id: 3,
      name: "Daily Champion",
      avatar: "",
      totalPoints: 65400,
      pointsThisMonth: 8500,
      referrals: 32,
      loginStreak: 156,
      level: "Gold"
    },
    {
      id: 4,
      name: "Active Trader",
      avatar: "",
      totalPoints: 58900,
      pointsThisMonth: 7200,
      referrals: 28,
      loginStreak: 45,
      level: "Gold"
    },
    {
      id: 5,
      name: "Community Helper",
      avatar: "",
      totalPoints: 52300,
      pointsThisMonth: 6100,
      referrals: 24,
      loginStreak: 78,
      level: "Silver"
    }
  ];

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">{rank}</div>;
    }
  };

  const getLevelColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'top rated':
      case 'diamond': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'level 2':
      case 'platinum': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'level 1':
      case 'gold': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'premium': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'pro':
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🏆 Leaderboards
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Celebrate our top performers and community champions
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">2,847</div>
                <div className="text-sm text-gray-600">Active Sellers</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">12,547</div>
                <div className="text-sm text-gray-600">Total Buyers</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Bot className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">8,934</div>
                <div className="text-sm text-gray-600">AI Agents</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Coins className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">2.8M</div>
                <div className="text-sm text-gray-600">Points Distributed</div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sellers">Top Sellers</TabsTrigger>
              <TabsTrigger value="buyers">Top Buyers</TabsTrigger>
              <TabsTrigger value="points">Points Leaders</TabsTrigger>
            </TabsList>

            {/* Top Sellers Tab */}
            <TabsContent value="sellers" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Podium - Top 3 */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                        Top Sellers by Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {topSellers.slice(0, 3).map((seller, index) => (
                          <div key={seller.id} className={`text-center p-6 rounded-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-200' :
                            index === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-2 border-gray-200' :
                            'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-2 border-amber-200'
                          }`}>
                            <div className="relative mb-4">
                              {getRankIcon(index + 1)}
                              <Avatar className="h-16 w-16 mx-auto mt-2">
                                <AvatarImage src={seller.avatar} />
                                <AvatarFallback className="text-lg font-bold">
                                  {seller.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{seller.name}</h3>
                            <Badge className={getLevelColor(seller.level)} variant="secondary">
                              {seller.level}
                            </Badge>
                            <div className="mt-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Earnings:</span>
                                <span className="font-semibold">₦{seller.totalEarnings.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Agents Sold:</span>
                                <span className="font-semibold">{seller.agentsSold}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Rating:</span>
                                <span className="font-semibold flex items-center">
                                  {seller.rating} <Star className="h-3 w-3 text-yellow-500 ml-1" />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Full Rankings */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Complete Rankings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topSellers.map((seller, index) => (
                          <div key={seller.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-8 h-8">
                                {getRankIcon(index + 1)}
                              </div>
                              <Avatar>
                                <AvatarImage src={seller.avatar} />
                                <AvatarFallback>
                                  {seller.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{seller.name}</div>
                                <div className="text-sm text-gray-600">
                                  Member since {new Date(seller.joinDate).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge className={getLevelColor(seller.level)} variant="secondary">
                                {seller.level}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-600">
                                ₦{seller.totalEarnings.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                {seller.agentsSold} agents • {seller.rating}⭐
                              </div>
                              <div className="text-xs text-blue-600">
                                +{seller.monthlyGrowth}% this month
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Top Buyers Tab */}
            <TabsContent value="buyers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
                    Top Buyers by Spending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topBuyers.map((buyer, index) => (
                      <div key={buyer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(index + 1)}
                          </div>
                          <Avatar>
                            <AvatarImage src={buyer.avatar} />
                            <AvatarFallback>
                              {buyer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{buyer.name}</div>
                            <div className="text-sm text-gray-600">
                              Favorite: {buyer.favoriteCategory}
                            </div>
                          </div>
                          <Badge className={getLevelColor(buyer.level)} variant="secondary">
                            {buyer.level}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">
                            ₦{buyer.totalSpent.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {buyer.agentsPurchased} agents purchased
                          </div>
                          <div className="text-xs text-gray-500">
                            Since {new Date(buyer.memberSince).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Points Leaders Tab */}
            <TabsContent value="points" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                    Points Champions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topByPoints.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(index + 1)}
                          </div>
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-600">
                              {user.referrals} referrals • {user.loginStreak} day streak
                            </div>
                          </div>
                          <Badge className={getLevelColor(user.level)} variant="secondary">
                            {user.level}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-yellow-600">
                            {user.totalPoints.toLocaleString()} pts
                          </div>
                          <div className="text-sm text-gray-600">
                            +{user.pointsThisMonth.toLocaleString()} this month
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Achievement Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-purple-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="font-semibold">AI Solutions Pro</div>
                  <div className="text-sm text-gray-600">Reached ₦100K earnings</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-semibold">Points Master</div>
                  <div className="text-sm text-gray-600">50 successful referrals</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold">Daily Champion</div>
                  <div className="text-sm text-gray-600">100 day login streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}