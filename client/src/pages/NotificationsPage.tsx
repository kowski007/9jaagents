import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCircle, 
  X, 
  DollarSign, 
  ShoppingCart, 
  Star,
  MessageSquare,
  AlertCircle,
  Info,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";
import Layout from "@/components/Layout";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: number;
  type: 'order' | 'payment' | 'review' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToastEnhanced();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  // Mock notifications data - replace with real API
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'You have received a new order for your "AI Content Writer" agent.',
      isRead: false,
      createdAt: '2025-07-07T10:30:00Z',
      actionUrl: '/seller-dashboard?tab=orders'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $49.99 has been processed for order #1234.',
      isRead: false,
      createdAt: '2025-07-07T09:15:00Z',
    },
    {
      id: 3,
      type: 'review',
      title: 'New Review',
      message: 'Your agent received a 5-star review from a satisfied customer.',
      isRead: true,
      createdAt: '2025-07-06T16:45:00Z',
    },
    {
      id: 4,
      type: 'system',
      title: 'Platform Update',
      message: 'New features have been added to the seller dashboard.',
      isRead: true,
      createdAt: '2025-07-06T14:20:00Z',
    }
  ];

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('PUT', `/api/notifications/${notificationId}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', '/api/notifications/mark-all-read', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      showSuccess("All notifications marked as read");
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case 'payment': return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'review': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'system': return <Info className="h-5 w-5 text-gray-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Stay updated with your latest activities
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="mt-2">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="order">Orders</TabsTrigger>
              <TabsTrigger value="payment">Payments</TabsTrigger>
              <TabsTrigger value="review">Reviews</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No notifications found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You're all caught up! Check back later for new updates.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`${!notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <Badge variant="default" className="text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                              {notification.actionUrl && (
                                <Button variant="link" size="sm" className="p-0 h-auto">
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}