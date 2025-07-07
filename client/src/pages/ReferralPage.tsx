import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Share2, 
  Copy, 
  Gift,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  Clock,
  Zap,
  Star,
  DollarSign
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";

export default function ReferralPage() {
  const { user } = useAuth();
  const { showSuccess } = useToastEnhanced();

  const { data: referralData } = useQuery({
    queryKey: ['/api/referral/stats'],
    queryFn: async () => {
      const response = await fetch('/api/referral/stats');
      if (!response.ok) throw new Error('Failed to fetch referral stats');
      return response.json();
    },
  });

  const { data: referralHistory = [] } = useQuery({
    queryKey: ['/api/referral/history'],
    queryFn: async () => {
      const response = await fetch('/api/referral/history');
      if (!response.ok) throw new Error('Failed to fetch referral history');
      return response.json();
    },
  });

  const defaultReferralData = {
    referralCode: user?.referralCode || "USER123ABC",
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarned: 0,
    pendingEarnings: 0,
    thisMonthEarnings: 0,
    conversionRate: 0,
    nextMilestone: 50,
    milestoneReward: 10000
  };

  const currentReferralData = referralData || defaultReferralData;

  

  const milestones = [
    { referrals: 10, reward: 5000, completed: true },
    { referrals: 25, reward: 10000, completed: false },
    { referrals: 50, reward: 25000, completed: false },
    { referrals: 100, reward: 50000, completed: false }
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText(currentReferralData.referralCode);
    showSuccess("Copied!", "Referral code copied to clipboard");
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${currentReferralData.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    showSuccess("Copied!", "Referral link copied to clipboard");
  };

  const shareOnSocial = (platform: string) => {
    const referralLink = `${window.location.origin}?ref=${currentReferralData.referralCode}`;
    const message = "Join AgentMarket and discover amazing AI agents! Use my referral code to get started.";
    
    let shareUrl = "";
    switch(platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + " " + referralLink)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Referral Program</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Invite friends and earn points for every successful referral
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">Total Referrals</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {currentReferralData.totalReferrals}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentReferralData.activeReferrals}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">{currentReferralData.totalEarned.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-purple-600">{currentReferralData.thisMonthEarnings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">points earned</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Share Your Code */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2 text-primary" />
                    Share Your Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={currentReferralData.referralCode} 
                      readOnly 
                      className="font-mono text-center text-lg bg-gray-50 dark:bg-gray-800"
                    />
                    <Button variant="outline" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button onClick={shareReferralLink} className="w-full mb-4">
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Referral Link
                    </Button>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" onClick={() => shareOnSocial('twitter')}>
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shareOnSocial('facebook')}>
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shareOnSocial('linkedin')}>
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shareOnSocial('whatsapp')}>
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Referral History */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referralHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No referrals yet. Start sharing your code to earn rewards!</p>
                      </div>
                    ) : (
                      referralHistory.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{referral.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{referral.name}</div>
                            <div className="text-sm text-gray-600">{referral.email}</div>
                            <div className="text-xs text-gray-500">Joined: {referral.signupDate}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            referral.status === 'completed' ? 'default' :
                            referral.status === 'active' ? 'secondary' : 'outline'
                          }>
                            {referral.status}
                          </Badge>
                          <div className="text-sm font-semibold text-green-600 mt-1">
                            {referral.totalEarned.toLocaleString()} pts
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Reward Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-yellow-500" />
                    Reward Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-orange-500" />
                    Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to next milestone</span>
                      <span>{currentReferralData.totalReferrals}/{currentReferralData.nextMilestone}</span>
                    </div>
                    <Progress value={(currentReferralData.totalReferrals / currentReferralData.nextMilestone) * 100} />
                  </div>

                  {milestones.map((milestone, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        milestone.completed 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center">
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        )}
                        <span className="text-sm">{milestone.referrals} Referrals</span>
                      </div>
                      <Badge variant={milestone.completed ? "default" : "outline"}>
                        {milestone.reward.toLocaleString()} pts
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Referral Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>• Share your code with friends interested in AI</div>
                    <div>• Post on social media with engaging content</div>
                    <div>• Explain the benefits of the platform</div>
                    <div>• Follow up with referred friends</div>
                    <div>• Join communities related to AI and automation</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}