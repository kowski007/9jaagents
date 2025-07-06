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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private agents: Map<number, Agent> = new Map();
  private orders: Map<number, Order> = new Map();
  private reviews: Map<number, Review> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private messages: Map<number, Message> = new Map();
  private favorites: Map<string, Favorite> = new Map();
  
  private currentCategoryId = 1;
  private currentAgentId = 1;
  private currentOrderId = 1;
  private currentReviewId = 1;
  private currentCartItemId = 1;
  private currentMessageId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const defaultCategories: InsertCategory[] = [
      { name: "Writing", icon: "fas fa-pen-nib", description: "Content creation and writing services", agentCount: 0 },
      { name: "Coding", icon: "fas fa-code", description: "Programming and development services", agentCount: 0 },
      { name: "Design", icon: "fas fa-palette", description: "Graphic design and visual services", agentCount: 0 },
      { name: "Analytics", icon: "fas fa-chart-line", description: "Data analysis and insights", agentCount: 0 },
      { name: "Translation", icon: "fas fa-language", description: "Language translation services", agentCount: 0 },
      { name: "Automation", icon: "fas fa-robot", description: "Process automation and workflows", agentCount: 0 },
    ];

    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      ...categoryData,
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  // Agent operations
  async getAgents(filters?: { categoryId?: number; search?: string }): Promise<Agent[]> {
    let agents = Array.from(this.agents.values()).filter(agent => agent.isActive);
    
    if (filters?.categoryId) {
      agents = agents.filter(agent => agent.categoryId === filters.categoryId);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      agents = agents.filter(agent => 
        agent.title.toLowerCase().includes(search) ||
        agent.description.toLowerCase().includes(search) ||
        agent.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    return agents.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAgentsBySeller(sellerId: string): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.sellerId === sellerId);
  }

  async createAgent(agentData: InsertAgent): Promise<Agent> {
    const agent: Agent = {
      id: this.currentAgentId++,
      ...agentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.agents.set(agent.id, agent);
    
    // Update category agent count
    if (agent.categoryId) {
      const category = this.categories.get(agent.categoryId);
      if (category) {
        category.agentCount = (category.agentCount || 0) + 1;
      }
    }
    
    return agent;
  }

  async updateAgent(id: number, agentData: Partial<InsertAgent>): Promise<Agent> {
    const existing = this.agents.get(id);
    if (!existing) throw new Error("Agent not found");
    
    const agent: Agent = {
      ...existing,
      ...agentData,
      updatedAt: new Date(),
    };
    this.agents.set(id, agent);
    return agent;
  }

  async deleteAgent(id: number): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      this.agents.delete(id);
      
      // Update category agent count
      if (agent.categoryId) {
        const category = this.categories.get(agent.categoryId);
        if (category) {
          category.agentCount = Math.max(0, (category.agentCount || 0) - 1);
        }
      }
    }
  }

  // Order operations
  async getOrders(filters?: { buyerId?: string; sellerId?: string; status?: string }): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (filters?.buyerId) {
      orders = orders.filter(order => order.buyerId === filters.buyerId);
    }
    
    if (filters?.sellerId) {
      orders = orders.filter(order => order.sellerId === filters.sellerId);
    }
    
    if (filters?.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    return orders.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const order: Order = {
      id: this.currentOrderId++,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(order.id, order);
    
    // Update agent total orders
    const agent = this.agents.get(order.agentId);
    if (agent) {
      agent.totalOrders = (agent.totalOrders || 0) + 1;
    }
    
    return order;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order> {
    const existing = this.orders.get(id);
    if (!existing) throw new Error("Order not found");
    
    const order: Order = {
      ...existing,
      ...orderData,
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  // Review operations
  async getReviewsByAgent(agentId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.agentId === agentId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const review: Review = {
      id: this.currentReviewId++,
      ...reviewData,
      createdAt: new Date(),
    };
    this.reviews.set(review.id, review);
    
    // Update agent rating
    const agent = this.agents.get(review.agentId);
    if (agent) {
      const reviews = Array.from(this.reviews.values()).filter(r => r.agentId === review.agentId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      agent.avgRating = totalRating / reviews.length;
      agent.totalReviews = reviews.length;
    }
    
    return review;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === cartItemData.userId && 
               item.agentId === cartItemData.agentId && 
               item.packageType === cartItemData.packageType
    );
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + (cartItemData.quantity || 1);
      return existingItem;
    }
    
    const cartItem: CartItem = {
      id: this.currentCartItemId++,
      ...cartItemData,
      createdAt: new Date(),
    };
    this.cartItems.set(cartItem.id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, cartItemData: Partial<InsertCartItem>): Promise<CartItem> {
    const existing = this.cartItems.get(id);
    if (!existing) throw new Error("Cart item not found");
    
    const cartItem: CartItem = {
      ...existing,
      ...cartItemData,
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
    for (const [id, item] of this.cartItems.entries()) {
      if (item.userId === userId) {
        this.cartItems.delete(id);
      }
    }
  }

  // Message operations
  async getMessages(filters: { senderId?: string; receiverId?: string; orderId?: number }): Promise<Message[]> {
    let messages = Array.from(this.messages.values());
    
    if (filters.senderId) {
      messages = messages.filter(msg => msg.senderId === filters.senderId);
    }
    
    if (filters.receiverId) {
      messages = messages.filter(msg => msg.receiverId === filters.receiverId);
    }
    
    if (filters.orderId) {
      messages = messages.filter(msg => msg.orderId === filters.orderId);
    }
    
    return messages.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.currentMessageId++,
      ...messageData,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.isRead = true;
    }
  }

  // Favorite operations
  async getFavorites(userId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async addToFavorites(favoriteData: InsertFavorite): Promise<Favorite> {
    const key = `${favoriteData.userId}-${favoriteData.agentId}`;
    const favorite: Favorite = {
      ...favoriteData,
      createdAt: new Date(),
    };
    this.favorites.set(key, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: string, agentId: number): Promise<void> {
    const key = `${userId}-${agentId}`;
    this.favorites.delete(key);
  }
}

export const storage = new MemStorage();
