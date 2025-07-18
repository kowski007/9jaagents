import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  hashedPassword: varchar("hashed_password"),
  role: varchar("role").default("user").notNull(), // user, seller, admin
  isActive: boolean("is_active").default(true).notNull(),
  sellerLevel: varchar("seller_level").default("none"), // none, level1, level2, top_rated
  buyerLevel: varchar("buyer_level").default("level1"), // level1, level2, level3
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  responseRate: integer("response_rate").default(100),
  totalPoints: integer("total_points").default(0),
  referralCode: varchar("referral_code").unique(),
  lastLoginDate: varchar("last_login_date"), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
  agentCount: integer("agent_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  basicPrice: decimal("basic_price", { precision: 10, scale: 2 }).notNull(),
  standardPrice: decimal("standard_price", { precision: 10, scale: 2 }),
  premiumPrice: decimal("premium_price", { precision: 10, scale: 2 }),
  freeDescription: text("free_description"),
  freeDeliveryDays: integer("free_delivery_days"),
  basicDescription: text("basic_description").notNull(),
  standardDescription: text("standard_description"),
  premiumDescription: text("premium_description"),
  basicDeliveryDays: integer("basic_delivery_days").notNull(),
  standardDeliveryDays: integer("standard_delivery_days"),
  premiumDeliveryDays: integer("premium_delivery_days"),
  tags: text("tags").array(),
  features: text("features").array(),
  useCases: jsonb("use_cases"), // Array of {title, description} objects
  supportedFormats: text("supported_formats").array(),
  integrations: text("integrations").array(),
  apiEndpoints: boolean("api_endpoints").default(false),
  responseTime: text("response_time"), // instant, fast, moderate, slow
  accuracy: text("accuracy"), // high, medium, basic
  modelType: text("model_type"), // gpt-4, gpt-3.5, claude, etc.
  trainingData: text("training_data"),
  languages: text("languages").array(),
  industries: text("industries").array(),
  imageUrl: text("image_url"), // Agent avatar/thumbnail
  demoUrl: text("demo_url"), // Live preview/demo link
  sourceCodeUrl: text("source_code_url"), // GitHub/code repository
  documentationUrl: text("documentation_url"), // Documentation link
  videoUrl: text("video_url"), // Demo video
  isActive: boolean("is_active").default(true),
  totalOrders: integer("total_orders").default(0),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  packageType: varchar("package_type").notNull(), // basic, standard, premium
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, in_progress, completed, cancelled, disputed
  deliveryDate: timestamp("delivery_date"),
  requirements: text("requirements"),
  deliverables: text("deliverables"),
  paystackReference: text("paystack_reference"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  packageType: varchar("package_type").notNull(),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  userId: varchar("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.agentId] }),
}));

// Points and Referral System Tables
export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  type: varchar("type").notNull(), // 'earned', 'spent', 'admin_granted'
  source: varchar("source").notNull(), // 'daily_login', 'referral_signup', 'referral_agent_list', 'referral_purchase', 'admin', 'points_exchange'
  description: text("description").notNull(),
  referenceId: varchar("reference_id"), // reference to order, user, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const userReferrals = pgTable("user_referrals", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredId: varchar("referred_id").notNull().references(() => users.id),
  referralCode: varchar("referral_code").notNull().unique(),
  signupBonus: boolean("signup_bonus").default(false),
  agentListBonus: boolean("agent_list_bonus").default(false),
  purchaseBonus: boolean("purchase_bonus").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyLogins = pgTable("daily_logins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  loginDate: varchar("login_date").notNull(), // YYYY-MM-DD format
  pointsEarned: integer("points_earned").default(100),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserDate: index("unique_user_date").on(table.userId, table.loginDate),
}));

export const pointsExchange = pgTable("points_exchange", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  pointsSpent: integer("points_spent").notNull(),
  nairaAmount: decimal("naira_amount", { precision: 10, scale: 2 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).notNull(), // points per naira
  status: varchar("status").default("pending"), // pending, approved, completed, rejected
  bankDetails: jsonb("bank_details"), // bank account information
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'order', 'payment', 'review', 'message', 'system', 'points', 'referral'
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  data: jsonb("data"), // additional data for the notification
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet system tables
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency").default("NGN").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  type: varchar("type").notNull(), // deposit, withdrawal, purchase, sale, commission, refund
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  reference: varchar("reference").unique(), // Paystack reference or internal ref
  status: varchar("status").default("pending"), // pending, success, failed, cancelled
  metadata: jsonb("metadata"), // Additional transaction data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  status: varchar("status").default("pending"), // pending, approved, rejected, processed
  adminNotes: text("admin_notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminCommissions = pgTable("admin_commissions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, collected
  collectedAt: timestamp("collected_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ createdAt: true });
export const insertPointsHistorySchema = createInsertSchema(pointsHistory).omit({ id: true, createdAt: true });
export const insertUserReferralSchema = createInsertSchema(userReferrals).omit({ id: true, createdAt: true });
export const insertDailyLoginSchema = createInsertSchema(dailyLogins).omit({ id: true, createdAt: true });
export const insertPointsExchangeSchema = createInsertSchema(pointsExchange).omit({ id: true, createdAt: true, processedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdminCommissionSchema = createInsertSchema(adminCommissions).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  hashedPassword?: string | null;
};
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Agent = {
  id: number;
  sellerId: string;
  title: string;
  description: string;
  categoryId: number;
  basicPrice: number;
  standardPrice?: number | null;
  premiumPrice?: number | null;
  freeDescription?: string | null;
  freeDeliveryDays?: number | null;
  basicDescription: string;
  standardDescription?: string | null;
  premiumDescription?: string | null;
  basicDeliveryDays: number;
  standardDeliveryDays?: number | null;
  premiumDeliveryDays?: number | null;
  tags?: string[];
  features?: string[] | null;
  useCases?: Array<{
    title: string;
    description: string;
  }>;
  supportedFormats?: string[];
  integrations?: string[];
  apiEndpoints?: boolean;
  responseTime?: string;
  accuracy?: string;
  modelType?: string;
  trainingData?: string;
  languages?: string[];
  industries?: string[];
  imageUrl?: string | null;
  demoUrl?: string;
  sourceCodeUrl?: string | null;
  documentationUrl?: string | null;
  videoUrl?: string | null;
  isActive?: boolean | null;
  totalOrders?: number | null;
  avgRating?: number | null;
  totalReviews?: number | null;
  createdAt: Date;
  updatedAt: Date;
};
export type Order = typeof orders.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type PointsHistory = typeof pointsHistory.$inferSelect;
export type UserReferral = typeof userReferrals.$inferSelect;
export type DailyLogin = typeof dailyLogins.$inferSelect;
export type PointsExchange = typeof pointsExchange.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertPointsHistory = z.infer<typeof insertPointsHistorySchema>;
export type InsertUserReferral = z.infer<typeof insertUserReferralSchema>;
export type InsertDailyLogin = z.infer<typeof insertDailyLoginSchema>;
export type InsertPointsExchange = z.infer<typeof insertPointsExchangeSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type AdminCommission = typeof adminCommissions.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type InsertAdminCommission = z.infer<typeof insertAdminCommissionSchema>;