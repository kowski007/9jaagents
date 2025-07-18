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
  pointsHistory,
  notifications,
  dailyLogins,
  wallets,
  walletTransactions,
  withdrawalRequests,
  adminCommissions,
  type User,
  type UpsertUser,
  type Category,
  type Agent,
  type Order,
  type Review,
  type CartItem,
  type Message,
  type Favorite,
  type PointsHistory,
  type Notification,
  type InsertNotification,
  type InsertPointsHistory,
  type InsertDailyLogin,
  type InsertCategory,
  type InsertAgent,
  type InsertOrder,
  type InsertReview,
  type InsertCartItem,
  type InsertMessage,
  type InsertFavorite,
  type Wallet,
  type WalletTransaction,
  type WithdrawalRequest,
  type AdminCommission,
  type InsertWallet,
  type InsertWalletTransaction,
  type InsertWithdrawalRequest,
  type InsertAdminCommission,
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

  // Points and Referral operations
  getUserPoints(userId: string): Promise<number>;
  addPoints(userId: string, points: number, type: string, source: string, description: string, referenceId?: string): Promise<void>;
  getPointsHistory(userId: string): Promise<PointsHistory[]>;
  checkDailyLogin(userId: string): Promise<boolean>;
  recordDailyLogin(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Wallet operations
  getWallet(userId: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(userId: string, amount: number): Promise<Wallet>;
  addWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getWalletTransactions(userId: string, limit?: number): Promise<WalletTransaction[]>;

  // Withdrawal operations
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getWithdrawalRequests(userId?: string, status?: string): Promise<WithdrawalRequest[]>;
  updateWithdrawalStatus(id: number, status: string, adminNotes?: string): Promise<WithdrawalRequest>;

  // Admin commission operations
  createAdminCommission(commission: InsertAdminCommission): Promise<AdminCommission>;
  getAdminCommissions(status?: string): Promise<AdminCommission[]>;
  collectAdminCommission(id: number): Promise<AdminCommission>;

  // Platform settings methods
  getPlatformSettings(): Promise<any>;
  savePlatformSettings(settings: any): Promise<any>;
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

  async getUserPoints(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    return user?.totalPoints || 0;
  }

  async addPoints(userId: string, points: number, type: string, source: string, description: string, referenceId?: string): Promise<void> {
    // Add to points history
    await db.insert(pointsHistory).values({
      userId,
      points,
      type,
      source,
      description,
      referenceId,
    });

    // Update user total points
    await db.update(users)
      .set({
        totalPoints: sql`${users.totalPoints} + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Create notification for points earned
    if (type === 'earned') {
      await this.createNotification({
        userId,
        type: 'points',
        title: 'Points Earned!',
        message: `You earned ${points} points from ${description}`,
        actionUrl: '/points',
        data: { points, source }
      });
    }
  }

  async getPointsHistory(userId: string): Promise<PointsHistory[]> {
    return await db.select()
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(desc(pointsHistory.createdAt));
  }

  async checkDailyLogin(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.select()
      .from(dailyLogins)
      .where(
        and(
          eq(dailyLogins.userId, userId),
          eq(dailyLogins.loginDate, today)
        )
      )
      .limit(1);

    return existing.length > 0;
  }

  async recordDailyLogin(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    // Check if already logged in today
    const alreadyLoggedIn = await this.checkDailyLogin(userId);
    if (alreadyLoggedIn) {
      throw new Error('Daily login already claimed today');
    }

    // Record daily login
    const pointsEarned = 100;
    await db.insert(dailyLogins).values({
      userId,
      loginDate: today,
      pointsEarned,
    });

    // Add points
    await this.addPoints(userId, pointsEarned, 'earned', 'daily_login', 'Daily login bonus');

    // Update user last login date
    await db.update(users)
      .set({ lastLoginDate: today })
      .where(eq(users.id, userId));

    return pointsEarned;
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values({
      ...notificationData,
    }).returning();
    return result[0];
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }
  async getUsers(filters?: { role?: string; orderBy?: string; limit?: number }): Promise<User[]> {
    let query = await db.select().from(users);

    if (filters?.role) {
      query = (query as any).where(eq(users.role, filters.role as any));
    }

    if (filters?.orderBy === 'totalPoints') {
      query = (query as any).orderBy(desc(users.totalPoints));
    }

    if (filters?.limit) {
      query = (query as any).limit(filters.limit);
    }

    return query;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getReferralsByUser(userId: string): Promise<any[]> {
    try {
      // Get referrals where this user is the referrer
      const referrals = await db.select().from(pointsHistory)
        .where(
          and(
            eq(pointsHistory.userId, userId),
            like(pointsHistory.source, 'referral_%')
          )
        )
        .orderBy(desc(pointsHistory.createdAt));

      // Group by referenceId to get unique referrals
      const uniqueReferrals = referrals.reduce((acc, referral) => {
        if (referral.referenceId && !acc.find(r => r.referenceId === referral.referenceId)) {
          acc.push({
            id: referral.id,
            referenceId: referral.referenceId,
            name: `User ${referral.referenceId.split('_')[1] || 'Unknown'}`,
            email: `user${referral.referenceId.split('_')[1] || 'unknown'}@example.com`,
            signupDate: referral.createdAt.toISOString().split('T')[0],
            status: referral.source.includes('purchase') ? 'completed' : 
                   referral.source.includes('agent_list') ? 'active' : 'pending',
            totalEarned: referrals
              .filter(r => r.referenceId === referral.referenceId)
              .reduce((sum, r) => sum + r.points, 0)
          });
        }
        return acc;
      }, [] as any[]);

      return uniqueReferrals;
    } catch (error) {
      console.error("Error getting referrals:", error);
      return [];
    }
  }

  async getReferralEarnings(userId: string, period: 'total' | 'month' | 'pending'): Promise<number> {
    try {
      // Get referral-related points from points history
      let query = db.select().from(pointsHistory)
        .where(
          and(
            eq(pointsHistory.userId, userId),
            like(pointsHistory.source, 'referral_%')
          )
        );

      if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.where(sql`${pointsHistory.createdAt} >= ${monthAgo.toISOString()}`);
      }

      const referralPoints = await query;
      return referralPoints.reduce((sum, point) => sum + point.points, 0);
    } catch (error) {
      console.error("Error getting referral earnings:", error);
      return 0;
    }
  }

  async processReferralSignup(referrerCode: string, newUserId: string): Promise<void> {
    try {
      // Find the referrer by referral code
      const referrer = await db.select().from(users)
        .where(eq(users.referralCode, referrerCode))
        .limit(1);

      if (referrer[0]) {
        // Award points to referrer for signup
        await this.addPoints(
          referrer[0].id, 
          1000, 
          'earned', 
          'referral_signup', 
          'Referral signup bonus', 
          `ref_signup_${newUserId}`
        );

        // Award points to new user for being referred
        await this.addPoints(
          newUserId, 
          500, 
          'earned', 
          'referral_welcome', 
          'Welcome bonus for being referred', 
          `ref_welcome_${referrer[0].id}`
        );

        console.log(`Referral processed: ${referrer[0].id} referred ${newUserId}`);
      }
    } catch (error) {
      console.error("Error processing referral signup:", error);
    }
  }

  async processReferralAgentList(sellerId: string): Promise<void> {
    try {
      // Check if this seller was referred
      const welcomeBonus = await db.select().from(pointsHistory)
        .where(
          and(
            eq(pointsHistory.userId, sellerId),
            eq(pointsHistory.source, 'referral_welcome')
          )
        )
        .limit(1);

      if (welcomeBonus[0] && welcomeBonus[0].referenceId) {
        const referrerId = welcomeBonus[0].referenceId.replace('ref_welcome_', '');
        
        // Award points to referrer for agent listing
        await this.addPoints(
          referrerId, 
          3000, 
          'earned', 
          'referral_agent_list', 
          'Referral agent listing bonus', 
          `ref_agent_${sellerId}`
        );

        console.log(`Referral agent list bonus: ${referrerId} gets 3000 points for ${sellerId} listing agent`);
      }
    } catch (error) {
      console.error("Error processing referral agent list:", error);
    }
  }

  async processReferralPurchase(buyerId: string, amount: number): Promise<void> {
    try {
      // Check if this buyer was referred
      const welcomeBonus = await db.select().from(pointsHistory)
        .where(
          and(
            eq(pointsHistory.userId, buyerId),
            eq(pointsHistory.source, 'referral_welcome')
          )
        )
        .limit(1);

      if (welcomeBonus[0] && welcomeBonus[0].referenceId) {
        const referrerId = welcomeBonus[0].referenceId.replace('ref_welcome_', '');
        
        // Award points to referrer for purchase (5% of purchase amount as points)
        const pointsEarned = Math.min(Math.floor(amount * 0.05), 5000); // Cap at 5000 points
        
        await this.addPoints(
          referrerId, 
          pointsEarned, 
          'earned', 
          'referral_purchase', 
          `Referral purchase bonus (${amount} purchase)`, 
          `ref_purchase_${buyerId}`
        );

        console.log(`Referral purchase bonus: ${referrerId} gets ${pointsEarned} points for ${buyerId} purchase`);
      }
    } catch (error) {
      console.error("Error processing referral purchase:", error);
    }
  }

  // Wallet operations
  async getWallet(userId: string): Promise<Wallet | undefined> {
    const result = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return result[0];
  }

  async createWallet(walletData: InsertWallet): Promise<Wallet> {
    const result = await db.insert(wallets).values(walletData).returning();
    return result[0];
  }

  async updateWalletBalance(userId: string, amount: number): Promise<Wallet> {
    const result = await db
      .update(wallets)
      .set({ 
        balance: sql`${wallets.balance} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, userId))
      .returning();
    return result[0];
  }

  async addWalletTransaction(transactionData: InsertWalletTransaction): Promise<WalletTransaction> {
    const result = await db.insert(walletTransactions).values(transactionData).returning();
    return result[0];
  }

  async getWalletTransactions(userId: string, limit = 50): Promise<WalletTransaction[]> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return [];

    const result = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, wallet.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit);
    return result;
  }

  // Withdrawal operations
  async createWithdrawalRequest(requestData: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const result = await db.insert(withdrawalRequests).values(requestData).returning();
    return result[0];
  }

  async getWithdrawalRequests(userId?: string, status?: string): Promise<WithdrawalRequest[]> {
    let query = db.select().from(withdrawalRequests);

    if (userId) {
      query = query.where(eq(withdrawalRequests.userId, userId));
    }

    if (status) {
      query = query.where(eq(withdrawalRequests.status, status));
    }

    return query.orderBy(desc(withdrawalRequests.createdAt));
  }

  async updateWithdrawalStatus(id: number, status: string, adminNotes?: string): Promise<WithdrawalRequest> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'processed') {
      updateData.processedAt = new Date();
    }

    const result = await db
      .update(withdrawalRequests)
      .set(updateData)
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return result[0];
  }

  // Admin commission operations
  async createAdminCommission(commissionData: InsertAdminCommission): Promise<AdminCommission> {
    const result = await db.insert(adminCommissions).values(commissionData).returning();
    return result[0];
  }

  async getAdminCommissions(status?: string): Promise<AdminCommission[]> {
    let query = db.select().from(adminCommissions);

    if (status) {
      query = query.where(eq(adminCommissions.status, status));
    }

    return query.orderBy(desc(adminCommissions.createdAt));
  }

  async collectAdminCommission(id: number): Promise<AdminCommission> {
    const result = await db
      .update(adminCommissions)
      .set({ 
        status: 'collected', 
        collectedAt: new Date() 
      })
      .where(eq(adminCommissions.id, id))
      .returning();
    return result[0];
  }

    // Platform settings methods
    async getPlatformSettings() {
      try {
        // For now, we'll store settings in a simple JSON file or return defaults
        // In production, you'd have a dedicated settings table
        return null; // Will trigger creation of defaults
      } catch (error) {
        console.error("Error getting platform settings:", error);
        return null;
      }
    }
  
    async savePlatformSettings(settings: any) {
      try {
        // For now, just log the settings
        // In production, save to a dedicated settings table
        console.log("Platform settings saved:", settings);
        return settings;
      } catch (error) {
        console.error("Error saving platform settings:", error);
        throw error;
      }
    }
}

export const storage = new PostgreSQLStorage();