import { db } from './db';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import {
  users,
  categories,
  agents,
  orders,
  reviews,
  cartItems,
  messages,
  favorites,
  type User,
  type UpsertUser,
  type Category,
  type Agent,
  type Order,
  type Review,
  type CartItem,
  type Message,
  type Favorite,
  type InsertCategory,
  type InsertAgent,
  type InsertOrder,
  type InsertReview,
  type InsertCartItem,
  type InsertMessage,
  type InsertFavorite,
} from "@shared/schema";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  toggleUserActiveStatus(id: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Agent operations
  getAgents(filters?: { categoryId?: number; search?: string }): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentsBySeller(sellerId: string): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent>;
  deleteAgent(id: number): Promise<void>;

  // Order operations
  getOrders(filters?: { buyerId?: string; sellerId?: string; status?: string }): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;

  // Review operations
  getReviewsByAgent(agentId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Cart operations
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, cartItem: Partial<InsertCartItem>): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Message operations
  getMessages(filters: { senderId?: string; receiverId?: string; orderId?: number }): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;

  // Favorite operations
  getFavorites(userId: string): Promise<Favorite[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: string, agentId: number): Promise<void>;
}

export class PostgreSQLStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = await this.getUser(userData.id);

    if (existing) {
      const result = await db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, userData.id))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(users)
        .values({ ...userData, createdAt: new Date(), updatedAt: new Date() })
        .returning();
      return result[0];
    }
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const result = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!result[0]) throw new Error('User not found');
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async toggleUserActiveStatus(id: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error('User not found');

    const result = await db
      .update(users)
      .set({ isActive: !user.isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(categoryData).returning();
    return result[0];
  }

  // Agent operations
  async getAgents(filters?: { categoryId?: number; search?: string }): Promise<Agent[]> {
    let query = db.select().from(agents).where(eq(agents.isActive, true));

    if (filters?.categoryId) {
      query = query.where(eq(agents.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      query = query.where(
        or(
          like(sql`LOWER(${agents.title})`, searchTerm),
          like(sql`LOWER(${agents.description})`, searchTerm)
        )
      );
    }

    const result = await query.orderBy(desc(agents.avgRating));
    return result;
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const result = await db.select().from(agents).where(eq(agents.id, id));
    return result[0];
  }

  async getAgentsBySeller(sellerId: string): Promise<Agent[]> {
    return await db.select().from(agents)
      .where(eq(agents.sellerId, sellerId))
      .orderBy(desc(agents.createdAt));
  }

  async createAgent(agentData: InsertAgent): Promise<Agent> {
    const result = await db.insert(agents).values({
      ...agentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Update category agent count
    if (agentData.categoryId) {
      await db
        .update(categories)
        .set({ 
          agentCount: sql`${categories.agentCount} + 1` 
        })
        .where(eq(categories.id, agentData.categoryId));
    }

    return result[0];
  }

  async updateAgent(id: number, agentData: Partial<InsertAgent>): Promise<Agent> {
    const result = await db
      .update(agents)
      .set({ ...agentData, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();

    if (!result[0]) throw new Error("Agent not found");
    return result[0];
  }

  async deleteAgent(id: number): Promise<void> {
    const agent = await this.getAgent(id);

    await db.delete(agents).where(eq(agents.id, id));

    // Update category agent count
    if (agent?.categoryId) {
      await db
        .update(categories)
        .set({ 
          agentCount: sql`GREATEST(${categories.agentCount} - 1, 0)` 
        })
        .where(eq(categories.id, agent.categoryId));
    }
  }

  // Order operations
  async getOrders(filters?: { buyerId?: string; sellerId?: string; status?: string }): Promise<Order[]> {
    let query = db.select().from(orders);
    const conditions = [];

    if (filters?.buyerId) conditions.push(eq(orders.buyerId, filters.buyerId));
    if (filters?.sellerId) conditions.push(eq(orders.sellerId, filters.sellerId));
    if (filters?.status) conditions.push(eq(orders.status, filters.status));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Update agent total orders
    await db
      .update(agents)
      .set({ 
        totalOrders: sql`${agents.totalOrders} + 1` 
      })
      .where(eq(agents.id, orderData.agentId));

    return result[0];
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order> {
    const result = await db
      .update(orders)
      .set({ ...orderData, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    if (!result[0]) throw new Error("Order not found");
    return result[0];
  }

  // Review operations
  async getReviewsByAgent(agentId: number): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.agentId, agentId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values({
      ...reviewData,
      createdAt: new Date(),
    }).returning();

    // Update agent rating
    const agentReviews = await this.getReviewsByAgent(reviewData.agentId);
    const totalRating = agentReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / agentReviews.length;

    await db
      .update(agents)
      .set({ 
        avgRating: avgRating,
        totalReviews: agentReviews.length
      })
      .where(eq(agents.id, reviewData.agentId));

    return result[0];
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems)
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existing = await db.select().from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItemData.userId),
          eq(cartItems.agentId, cartItemData.agentId),
          eq(cartItems.packageType, cartItemData.packageType)
        )
      );

    if (existing[0]) {
      const result = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + (cartItemData.quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return result[0];
    }

    const result = await db.insert(cartItems).values({
      ...cartItemData,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async updateCartItem(id: number, cartItemData: Partial<InsertCartItem>): Promise<CartItem> {
    const result = await db
      .update(cartItems)
      .set(cartItemData)
      .where(eq(cartItems.id, id))
      .returning();

    if (!result[0]) throw new Error("Cart item not found");
    return result[0];
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Message operations
  async getMessages(filters: { senderId?: string; receiverId?: string; orderId?: number }): Promise<Message[]> {
    let query = db.select().from(messages);
    const conditions = [];

    if (filters.senderId) conditions.push(eq(messages.senderId, filters.senderId));
    if (filters.receiverId) conditions.push(eq(messages.receiverId, filters.receiverId));
    if (filters.orderId) conditions.push(eq(messages.orderId, filters.orderId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(messages.createdAt);
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values({
      ...messageData,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
  }

  // Favorite operations
  async getFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async addToFavorites(favoriteData: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values({
      ...favoriteData,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async removeFromFavorites(userId: string, agentId: number): Promise<void> {
    await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.agentId, agentId)
        )
      );
  }
}

export const storage = new PostgreSQLStorage();