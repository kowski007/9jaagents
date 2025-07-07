import type { Express, Request, Response, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Admin middleware
const isAdmin: RequestHandler = async (req, res, next) => {
  const userId = (req as any).user?.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};
import { 
  insertAgentSchema, 
  insertOrderSchema, 
  insertReviewSchema,
  insertCartItemSchema,
  insertMessageSchema,
  insertFavoriteSchema 
} from "@shared/schema";
import bcrypt from 'bcrypt';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      profile_image_url?: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Email auth schemas
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const signupSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl: null,
        hashedPassword,
      });

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Email login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.login({ 
        claims: { 
          sub: user.id, 
          email: user.email, 
          first_name: user.firstName, 
          last_name: user.lastName 
        },
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      }, (err) => {
        if (err) {
          console.error("Session error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        res.json({ message: "Login successful", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    } catch (error) {
      console.error("Error logging in user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Agent routes
  app.get('/api/agents', async (req, res) => {
    try {
      const { categoryId, search, sort } = req.query;
      const agents = await storage.getAgents({
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
      });
      
      // Sort agents based on sort parameter
      let sortedAgents = [...agents];
      switch (sort) {
        case 'newest':
          sortedAgents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'price_low':
          sortedAgents.sort((a, b) => (a.basicPrice || 0) - (b.basicPrice || 0));
          break;
        case 'price_high':
          sortedAgents.sort((a, b) => (b.basicPrice || 0) - (a.basicPrice || 0));
          break;
        case 'rating':
          sortedAgents.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
          break;
        default: // popular
          sortedAgents.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
      }
      
      console.log(`Fetched ${sortedAgents.length} agents with filters:`, { categoryId, search, sort });
      res.json(sortedAgents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get('/api/agents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post('/api/agents', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const agentData = insertAgentSchema.parse({
        ...req.body,
        sellerId: userId,
      });
      const agent = await storage.createAgent(agentData);
      res.status(201).json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  app.put('/api/agents/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.claims.sub;

      const existing = await storage.getAgent(id);
      if (!existing) {
        return res.status(404).json({ message: "Agent not found" });
      }

      if (existing.sellerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const agentData = insertAgentSchema.partial().parse(req.body);
      const agent = await storage.updateAgent(id, agentData);
      res.json(agent);
    } catch (error) {
      console.error("Error updating agent:", error);
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  app.delete('/api/agents/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.claims.sub;

      const existing = await storage.getAgent(id);
      if (!existing) {
        return res.status(404).json({ message: "Agent not found" });
      }

      if (existing.sellerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteAgent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Get seller's agents
  app.get('/api/seller/agents', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const sellerId = req.user!.claims.sub;
      const agents = await storage.getAgentsBySeller(sellerId);
      res.json(agents);
    } catch (error) {
      console.error("Error fetching seller agents:", error);
      res.status(500).json({ message: "Failed to fetch seller agents" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { type, status } = req.query;

      const filters: any = { status: status as string };
      if (type === 'buyer') {
        filters.buyerId = userId;
      } else if (type === 'seller') {
        filters.sellerId = userId;
      } else {
        // Get both buyer and seller orders
        const buyerOrders = await storage.getOrders({ buyerId: userId, status: status as string });
        const sellerOrders = await storage.getOrders({ sellerId: userId, status: status as string });
        const allOrders = [...buyerOrders, ...sellerOrders];
        return res.json(allOrders);
      }

      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.claims.sub;

      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.buyerId !== userId && order.sellerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        buyerId: userId,
      });

      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.claims.sub;

      const existing = await storage.getOrder(id);
      if (!existing) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (existing.buyerId !== userId && existing.sellerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const orderData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(id, orderData);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Review routes
  app.get('/api/agents/:id/reviews', async (req, res) => {
    try {
      const agentId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByAgent(agentId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: userId,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });

      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.claims.sub;

      const existing = await storage.getCartItems(userId);
      const cartItem = existing.find(item => item.id === id);

      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      const cartItemData = insertCartItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateCartItem(id, cartItemData);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.claims.sub;

      const existing = await storage.getCartItems(userId);
      const cartItem = existing.find(item => item.id === id);

      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      await storage.removeFromCart(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      await storage.clearCart(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Message routes
  app.get('/api/messages', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { orderId } = req.query;

      const messages = await storage.getMessages({
        orderId: orderId ? parseInt(orderId as string) : undefined,
        senderId: userId,
      });

      const receivedMessages = await storage.getMessages({
        orderId: orderId ? parseInt(orderId as string) : undefined,
        receiverId: userId,
      });

      const allMessages = [...messages, ...receivedMessages];
      res.json(allMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Favorite routes
  app.get('/api/favorites', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId,
      });

      const favorite = await storage.addToFavorites(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:agentId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const userId = req.user!.claims.sub;

      await storage.removeFromFavorites(userId, agentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Paystack webhook (for payment confirmation)
  app.post('/api/paystack/webhook', async (req, res) => {
    try {
      const { event, data } = req.body;

      if (event === 'charge.success') {
        // Update order status to paid
        const reference = data.reference;
        // Find order by paystack reference and update status
        // This is a simplified implementation
        console.log('Payment successful:', reference);
      }

      res.status(200).send();
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ message: "Failed to handle webhook" });
    }
  });

  // Seller registration route
  app.post('/api/become-seller', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { businessName, description, expertise, experience, portfolio, motivation } = req.body;

      // Update user role to seller
      const updatedUser = await storage.updateUserRole(userId, 'seller');
      
      // You could store the additional seller information in a separate table if needed
      // For now, we just update the role
      
      res.json({ 
        message: "Successfully became a seller!",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error becoming seller:", error);
      res.status(500).json({ message: "Failed to become seller" });
    }
  });

  // Points routes
  app.post('/api/points/daily-login', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const points = await storage.recordDailyLogin(userId);
      res.json({ message: "Daily login bonus claimed!", points });
    } catch (error: any) {
      if (error.message.includes('already claimed')) {
        return res.status(400).json({ message: "Daily login already claimed today" });
      }
      console.error("Error claiming daily login:", error);
      res.status(500).json({ message: "Failed to claim daily bonus" });
    }
  });

  app.post('/api/points/exchange', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { points, bankDetails } = req.body;

      if (!points || points < 1000) {
        return res.status(400).json({ message: "Minimum exchange is 1,000 points" });
      }

      const userPoints = await storage.getUserPoints(userId);
      if (points > userPoints) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Deduct points and create exchange request
      await storage.addPoints(userId, -points, 'spent', 'points_exchange', `Exchanged ${points} points for Naira`);
      
      // Create notification
      await storage.createNotification({
        userId,
        type: 'points',
        title: 'Points Exchange Requested',
        message: `Your request to exchange ${points} points has been submitted and is being processed.`,
        actionUrl: '/points?tab=exchange'
      });

      res.json({ message: "Exchange request submitted successfully!" });
    } catch (error) {
      console.error("Error processing points exchange:", error);
      res.status(500).json({ message: "Failed to process exchange" });
    }
  });

  app.get('/api/points/history', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const history = await storage.getPointsHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching points history:", error);
      res.status(500).json({ message: "Failed to fetch points history" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/mark-all-read', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  // Leaderboard route
  app.get('/api/leaderboard', async (req, res) => {
    try {
      // Get top sellers - using mock data for now since we don't have real sales data
      const topSellers = await storage.getUsers({ role: 'seller', limit: 10 });
      const topBuyers = await storage.getUsers({ role: 'user', limit: 10 });
      const topByPoints = await storage.getUsers({ orderBy: 'totalPoints', limit: 10 });

      res.json({
        topSellers: topSellers.map((user, index) => ({
          id: user.id,
          name: user.firstName || user.email?.split('@')[0] || 'User',
          avatar: user.profileImageUrl || '',
          totalEarnings: user.totalEarnings || Math.floor(Math.random() * 100000) + 10000,
          agentsSold: Math.floor(Math.random() * 200) + 50,
          rating: (Math.random() * 1 + 4).toFixed(1),
          totalReviews: Math.floor(Math.random() * 100) + 20,
          level: index < 3 ? 'Top Rated' : index < 6 ? 'Level 2' : 'Level 1',
          joinDate: user.createdAt || new Date().toISOString(),
          monthlyGrowth: (Math.random() * 20 + 5).toFixed(1)
        })),
        topBuyers: topBuyers.map((user, index) => ({
          id: user.id,
          name: user.firstName || user.email?.split('@')[0] || 'User',
          avatar: user.profileImageUrl || '',
          totalSpent: user.totalSpent || Math.floor(Math.random() * 50000) + 5000,
          agentsPurchased: Math.floor(Math.random() * 30) + 5,
          favoriteCategory: ['Automation', 'Design', 'Analytics', 'Writing'][Math.floor(Math.random() * 4)],
          memberSince: user.createdAt || new Date().toISOString(),
          level: index < 2 ? 'Premium' : index < 5 ? 'Pro' : 'Basic'
        })),
        topByPoints: topByPoints.map((user, index) => ({
          id: user.id,
          name: user.firstName || user.email?.split('@')[0] || 'User',
          avatar: user.profileImageUrl || '',
          totalPoints: user.totalPoints || Math.floor(Math.random() * 80000) + 10000,
          pointsThisMonth: Math.floor(Math.random() * 15000) + 2000,
          referrals: Math.floor(Math.random() * 50) + 10,
          loginStreak: Math.floor(Math.random() * 100) + 20,
          level: index < 2 ? 'Diamond' : index < 4 ? 'Platinum' : index < 7 ? 'Gold' : 'Silver'
        }))
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Referral routes
  app.get('/api/referral/stats', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      // Generate referral code if user doesn't have one
      let referralCode = user?.referralCode;
      if (!referralCode) {
        referralCode = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        await storage.updateUser(userId, { referralCode });
      }

      // Get real referral data
      const referrals = await storage.getReferralsByUser(userId);
      const activeReferrals = referrals.filter((r: any) => r.status === 'active');
      const completedReferrals = referrals.filter((r: any) => r.status === 'completed');
      
      const totalEarned = await storage.getReferralEarnings(userId, 'total');
      const thisMonthEarnings = await storage.getReferralEarnings(userId, 'month');
      const pendingEarnings = await storage.getReferralEarnings(userId, 'pending');

      const referralStats = {
        referralCode,
        totalReferrals: referrals.length,
        activeReferrals: activeReferrals.length,
        totalEarned,
        pendingEarnings,
        thisMonthEarnings,
        conversionRate: referrals.length > 0 ? Math.round((completedReferrals.length / referrals.length) * 100) : 0,
        nextMilestone: 50,
        milestoneReward: 10000
      };

      res.json(referralStats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  app.get('/api/referral/history', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const referralHistory = await storage.getReferralsByUser(userId);
      res.json(referralHistory);
    } catch (error) {
      console.error("Error fetching referral history:", error);
      res.status(500).json({ message: "Failed to fetch referral history" });
    }
  });

  // Admin routes
  app.post('/api/admin/give-points', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, points, reason } = req.body;
      await storage.addPoints(userId, points, 'admin_granted', 'admin', reason || 'Admin bonus');
      res.json({ message: "Points granted successfully!" });
    } catch (error) {
      console.error("Error giving points:", error);
      res.status(500).json({ message: "Failed to give points" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.put('/api/admin/users/:id/toggle-status', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.toggleUserActiveStatus(id);
      res.json(user);
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ message: "Failed to toggle user status" });
    }
  });

  app.get('/api/admin/orders', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders({});
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const agents = await storage.getAgents({});
      const orders = await storage.getOrders({});
      
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.amount || '0'), 0);
      const completedOrders = orders.filter(order => order.status === 'completed');
      const pendingOrders = orders.filter(order => order.status === 'pending');
      const activeAgents = agents.filter(agent => agent.isActive);
      const sellers = users.filter(user => user.role === 'seller');
      
      res.json({
        totalUsers: users.length,
        totalSellers: sellers.length,
        totalAgents: agents.length,
        activeAgents: activeAgents.length,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue,
        monthlyRevenue: totalRevenue * 0.3, // Estimate based on recent activity
        platformFee: 5,
        activeUsers: users.filter(user => user.isActive).length
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Wallet routes
  app.get('/api/wallet', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      let wallet = await storage.getWallet(userId);
      
      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await storage.createWallet({ userId });
      }
      
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.get('/api/wallet/transactions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const transactions = await storage.getWalletTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/wallet/deposit', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Create Paystack payment
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: req.user!.claims.email,
          amount: amount * 100, // Convert to kobo
          callback_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/wallet/deposit/callback`,
          metadata: {
            user_id: userId,
            type: 'deposit'
          }
        })
      });
      
      const paystackData = await paystackResponse.json();
      
      if (!paystackData.status) {
        return res.status(400).json({ message: "Payment initialization failed" });
      }
      
      res.json({
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference
      });
    } catch (error) {
      console.error("Error initiating deposit:", error);
      res.status(500).json({ message: "Failed to initiate deposit" });
    }
  });

  app.post('/api/wallet/deposit/callback', async (req, res) => {
    try {
      const { reference } = req.body;
      
      // Verify payment with Paystack
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        }
      });
      
      const verifyData = await verifyResponse.json();
      
      if (verifyData.status && verifyData.data.status === 'success') {
        const { amount, metadata } = verifyData.data;
        const userId = metadata.user_id;
        const amountInNaira = amount / 100;
        
        // Get or create wallet
        let wallet = await storage.getWallet(userId);
        if (!wallet) {
          wallet = await storage.createWallet({ userId });
        }
        
        // Update wallet balance
        await storage.updateWalletBalance(userId, amountInNaira);
        
        // Add transaction record
        await storage.addWalletTransaction({
          walletId: wallet.id,
          type: 'deposit',
          amount: amountInNaira.toString(),
          description: 'Wallet deposit via Paystack',
          reference: reference,
          status: 'success',
          metadata: { payment_method: 'paystack' }
        });
        
        res.json({ message: "Deposit successful", amount: amountInNaira });
      } else {
        res.status(400).json({ message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error processing deposit callback:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  app.post('/api/wallet/withdraw', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { amount, bankName, accountNumber, accountName } = req.body;
      
      if (!amount || amount <= 0 || !bankName || !accountNumber || !accountName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check wallet balance
      const wallet = await storage.getWallet(userId);
      if (!wallet || parseFloat(wallet.balance) < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // Create withdrawal request
      const withdrawalRequest = await storage.createWithdrawalRequest({
        userId,
        amount: amount.toString(),
        bankName,
        accountNumber,
        accountName
      });
      
      // Deduct from wallet (pending approval)
      await storage.updateWalletBalance(userId, -amount);
      
      // Add transaction record
      await storage.addWalletTransaction({
        walletId: wallet.id,
        type: 'withdrawal',
        amount: amount.toString(),
        description: 'Withdrawal request submitted',
        reference: `WR-${withdrawalRequest.id}`,
        status: 'pending',
        metadata: { 
          withdrawal_request_id: withdrawalRequest.id,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName
        }
      });
      
      res.json({ message: "Withdrawal request submitted", request: withdrawalRequest });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  app.get('/api/wallet/withdrawals', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const withdrawals = await storage.getWithdrawalRequests(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Agent purchase with wallet
  app.post('/api/agents/:id/purchase', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const agentId = parseInt(req.params.id);
      const { tier, paymentMethod } = req.body; // 'wallet' or 'paystack'
      
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Calculate price based on tier
      let price = 0;
      if (tier === 'basic') price = parseFloat(agent.basicPrice);
      else if (tier === 'standard') price = parseFloat(agent.standardPrice || '0');
      else if (tier === 'premium') price = parseFloat(agent.premiumPrice || '0');
      
      if (price <= 0) {
        return res.status(400).json({ message: "Invalid tier selected" });
      }
      
      if (paymentMethod === 'wallet') {
        // Pay with wallet
        const wallet = await storage.getWallet(userId);
        if (!wallet || parseFloat(wallet.balance) < price) {
          return res.status(400).json({ message: "Insufficient wallet balance" });
        }
        
        // Create order
        const order = await storage.createOrder({
          buyerId: userId,
          sellerId: agent.sellerId,
          agentId: agentId,
          tier: tier,
          amount: price.toString(),
          status: 'paid'
        });
        
        // Deduct from buyer wallet
        await storage.updateWalletBalance(userId, -price);
        
        // Add to seller wallet (minus commission)
        const commission = price * 0.1; // 10% commission
        const sellerAmount = price - commission;
        
        let sellerWallet = await storage.getWallet(agent.sellerId);
        if (!sellerWallet) {
          sellerWallet = await storage.createWallet({ userId: agent.sellerId });
        }
        
        await storage.updateWalletBalance(agent.sellerId, sellerAmount);
        
        // Record transactions
        await storage.addWalletTransaction({
          walletId: wallet.id,
          type: 'purchase',
          amount: price.toString(),
          description: `Purchased ${agent.title} (${tier})`,
          reference: `ORDER-${order.id}`,
          status: 'success',
          metadata: { order_id: order.id, agent_id: agentId, tier }
        });
        
        await storage.addWalletTransaction({
          walletId: sellerWallet.id,
          type: 'sale',
          amount: sellerAmount.toString(),
          description: `Sale of ${agent.title} (${tier})`,
          reference: `ORDER-${order.id}`,
          status: 'success',
          metadata: { order_id: order.id, agent_id: agentId, tier }
        });
        
        // Record admin commission
        await storage.createAdminCommission({
          orderId: order.id,
          amount: commission.toString(),
          percentage: '10.00'
        });
        
        res.json({ message: "Purchase successful", order });
      } else {
        // Pay with Paystack
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: req.user!.claims.email,
            amount: price * 100,
            callback_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/agents/purchase/callback`,
            metadata: {
              user_id: userId,
              agent_id: agentId,
              tier: tier,
              type: 'purchase'
            }
          })
        });
        
        const paystackData = await paystackResponse.json();
        
        if (!paystackData.status) {
          return res.status(400).json({ message: "Payment initialization failed" });
        }
        
        res.json({
          authorization_url: paystackData.data.authorization_url,
          reference: paystackData.data.reference
        });
      }
    } catch (error) {
      console.error("Error processing agent purchase:", error);
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  app.post('/api/agents/purchase/callback', async (req, res) => {
    try {
      const { reference } = req.body;
      
      // Verify payment with Paystack
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        }
      });
      
      const verifyData = await verifyResponse.json();
      
      if (verifyData.status && verifyData.data.status === 'success') {
        const { amount, metadata } = verifyData.data;
        const { user_id: userId, agent_id: agentId, tier } = metadata;
        const price = amount / 100;
        
        const agent = await storage.getAgent(parseInt(agentId));
        if (!agent) {
          return res.status(404).json({ message: "Agent not found" });
        }
        
        // Create order
        const order = await storage.createOrder({
          buyerId: userId,
          sellerId: agent.sellerId,
          agentId: parseInt(agentId),
          tier: tier,
          amount: price.toString(),
          status: 'paid'
        });
        
        // Add to seller wallet (minus commission)
        const commission = price * 0.1;
        const sellerAmount = price - commission;
        
        let sellerWallet = await storage.getWallet(agent.sellerId);
        if (!sellerWallet) {
          sellerWallet = await storage.createWallet({ userId: agent.sellerId });
        }
        
        await storage.updateWalletBalance(agent.sellerId, sellerAmount);
        
        // Record seller transaction
        await storage.addWalletTransaction({
          walletId: sellerWallet.id,
          type: 'sale',
          amount: sellerAmount.toString(),
          description: `Sale of ${agent.title} (${tier})`,
          reference: reference,
          status: 'success',
          metadata: { order_id: order.id, agent_id: agentId, tier, payment_method: 'paystack' }
        });
        
        // Record admin commission
        await storage.createAdminCommission({
          orderId: order.id,
          amount: commission.toString(),
          percentage: '10.00'
        });
        
        res.json({ message: "Purchase successful", order });
      } else {
        res.status(400).json({ message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error processing purchase callback:", error);
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  // Admin commission routes
  app.get('/api/admin/commissions', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const status = req.query.status as string | undefined;
      const commissions = await storage.getAdminCommissions(status);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching admin commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  app.post('/api/admin/commissions/:id/collect', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const commissionId = parseInt(req.params.id);
      const commission = await storage.collectAdminCommission(commissionId);
      res.json(commission);
    } catch (error) {
      console.error("Error collecting commission:", error);
      res.status(500).json({ message: "Failed to collect commission" });
    }
  });

  // Admin withdrawal management
  app.get('/api/admin/withdrawals', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const status = req.query.status as string | undefined;
      const withdrawals = await storage.getWithdrawalRequests(undefined, status);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching admin withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.put('/api/admin/withdrawals/:id', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      const withdrawal = await storage.updateWithdrawalStatus(withdrawalId, status, adminNotes);
      res.json(withdrawal);
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      res.status(500).json({ message: "Failed to update withdrawal" });
    }
  });

  // Super Admin Routes
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const agents = await storage.getAgents();
      const orders = await storage.getOrders({});
      const commissions = await storage.getAdminCommissions();
      
      const totalUsers = users.length;
      const totalAgents = agents.length;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
      const totalPoints = users.reduce((sum, user) => sum + (user.totalPoints || 0), 0);
      const pointsExchanged = 0; // TODO: Calculate from exchange history
      const pointsValue = totalPoints * 1; // 1 point = 1 naira
      
      res.json({
        totalUsers,
        totalAgents,
        totalRevenue,
        totalPoints,
        pointsExchanged,
        pointsValue
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { email, firstName, lastName, role, isActive, totalPoints } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const newUser = await storage.upsertUser({
        id: `admin-created-${Date.now()}`,
        email,
        firstName,
        lastName,
        role: role || 'user',
        isActive: isActive !== undefined ? isActive : true,
        totalPoints: totalPoints || 0
      });
      
      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/admin/users/:id', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Update user role if provided
      if (updates.role) {
        await storage.updateUserRole(id, updates.role);
      }
      
      // Toggle status if provided
      if (updates.isActive !== undefined) {
        const user = await storage.getUser(id);
        if (user && user.isActive !== updates.isActive) {
          await storage.toggleUserActiveStatus(id);
        }
      }
      
      // Update other fields if needed
      const updatedUser = await storage.getUser(id);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // For safety, we'll mark as inactive instead of actual deletion
      await storage.toggleUserActiveStatus(id);
      
      res.json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get('/api/admin/agents', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const agents = await storage.getAgents();
      
      // Fetch seller and category info for each agent
      const enrichedAgents = await Promise.all(
        agents.map(async (agent) => {
          const seller = await storage.getUser(agent.sellerId);
          const categories = await storage.getCategories();
          const category = categories.find(c => c.id === agent.categoryId);
          
          return {
            ...agent,
            seller,
            category
          };
        })
      );
      
      res.json(enrichedAgents);
    } catch (error) {
      console.error("Error fetching admin agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.delete('/api/admin/agents/:id', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const agentId = parseInt(req.params.id);
      await storage.deleteAgent(agentId);
      res.json({ message: "Agent deleted successfully" });
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  app.get('/api/admin/settings', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      // Return default platform settings - in production this would come from a settings table
      const settings = {
        siteName: "AgentMarket",
        commissionRate: 10,
        minWithdrawal: 1000,
        maxWithdrawal: 500000,
        pointsToNairaRate: 1,
        defaultUserRole: "user",
        maintenanceMode: false,
        registrationEnabled: true
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/admin/settings', isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = req.body;
      
      // In production, you would save these settings to a database table
      // For now, we'll just return success
      
      res.json({ message: "Settings updated successfully", settings });
    } catch (error) {
      console.error("Error updating admin settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}