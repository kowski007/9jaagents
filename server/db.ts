
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, 
  categories, 
  agents, 
  orders, 
  reviews, 
  cartItems, 
  messages, 
  favorites 
} from '@shared/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection
const client = postgres(connectionString);
export const db = drizzle(client);

// Initialize sample data if needed
export async function initializeDatabase() {
  try {
    // Check if categories exist
    const existingCategories = await db.select().from(categories).limit(1);
    
    if (existingCategories.length === 0) {
      console.log('Initializing database with sample data...');
      
      // Insert categories
      const defaultCategories = [
        { name: "Writing", icon: "fas fa-pen-nib", description: "Content creation and writing services", agentCount: 0 },
        { name: "Coding", icon: "fas fa-code", description: "Programming and development services", agentCount: 0 },
        { name: "Design", icon: "fas fa-palette", description: "Graphic design and visual services", agentCount: 0 },
        { name: "Analytics", icon: "fas fa-chart-line", description: "Data analysis and insights", agentCount: 0 },
        { name: "Translation", icon: "fas fa-language", description: "Language translation services", agentCount: 0 },
        { name: "Automation", icon: "fas fa-robot", description: "Process automation and workflows", agentCount: 0 },
      ];
      
      await db.insert(categories).values(defaultCategories);
      console.log('Sample categories inserted');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
