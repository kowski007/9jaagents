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
      const { categoryId, search } = req.query;
      const agents = await storage.getAgents({
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
      });
      res.json(agents);
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

  // Admin routes
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

  const httpServer = createServer(app);
  return httpServer;
}