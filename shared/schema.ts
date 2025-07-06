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
  basicDescription: text("basic_description").notNull(),
  standardDescription: text("standard_description"),
  premiumDescription: text("premium_description"),
  basicDeliveryDays: integer("basic_delivery_days").notNull(),
  standardDeliveryDays: integer("standard_delivery_days"),
  premiumDeliveryDays: integer("premium_delivery_days"),
  tags: text("tags").array(),
  features: text("features").array(),
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

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ createdAt: true });

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
export type Agent = typeof agents.$inferSelect;
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