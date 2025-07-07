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

      // Create a sample user for demo agents
      const sampleUserId = 'demo_user_123';
      await db.insert(users).values({
        id: sampleUserId,
        email: 'demo@agentmarket.com',
        firstName: 'Demo',
        lastName: 'Seller',
        role: 'seller'
      }).onConflictDoNothing();

      // Insert sample agents
      const sampleAgents = [
        {
          sellerId: sampleUserId,
          title: 'Customer Support AI Agent',
          description: 'Advanced AI agent that handles customer inquiries 24/7 with natural language processing and sentiment analysis.',
          categoryId: 6,
          basicPrice: '49.99',
          standardPrice: '99.99',
          premiumPrice: '199.99',
          basicDescription: 'Basic customer support with FAQ responses',
          standardDescription: 'Enhanced support with sentiment analysis and escalation',
          premiumDescription: 'Full-featured support with custom integrations and analytics',
          basicDeliveryDays: 3,
          standardDeliveryDays: 5,
          premiumDeliveryDays: 7,
          tags: ['customer-service', 'chatbot', 'automation'],
          features: ['24/7 availability', 'Multi-language support', 'Sentiment analysis', 'Integration ready'],
          useCases: [
            { title: 'E-commerce Support', description: 'Handle order inquiries and returns automatically' },
            { title: 'SaaS Support', description: 'Provide technical support and onboarding assistance' }
          ],
          supportedFormats: ['JSON', 'REST API', 'Webhook'],
          integrations: ['Slack', 'Discord', 'Zendesk'],
          apiEndpoints: true,
          responseTime: 'instant',
          accuracy: 'high',
          modelType: 'GPT-4',
          languages: ['English', 'Spanish', 'French'],
          industries: ['E-commerce', 'SaaS', 'Healthcare'],
          avgRating: '4.8',
          totalReviews: 24,
          totalOrders: 156
        },
        {
          sellerId: sampleUserId,
          title: 'Content Writing Assistant',
          description: 'Professional AI writer that creates engaging blog posts, articles, and marketing copy tailored to your brand voice.',
          categoryId: 1,
          basicPrice: '29.99',
          standardPrice: '59.99',
          premiumPrice: '119.99',
          basicDescription: 'Basic blog posts and articles up to 1000 words',
          standardDescription: 'SEO-optimized content with research and fact-checking',
          premiumDescription: 'Premium content with brand voice training and unlimited revisions',
          basicDeliveryDays: 2,
          standardDeliveryDays: 3,
          premiumDeliveryDays: 5,
          tags: ['content-writing', 'seo', 'marketing'],
          features: ['SEO optimization', 'Plagiarism checking', 'Brand voice adaptation', 'Multiple formats'],
          useCases: [
            { title: 'Blog Content', description: 'Create engaging blog posts that drive traffic' },
            { title: 'Marketing Copy', description: 'Write compelling sales and marketing materials' }
          ],
          supportedFormats: ['Markdown', 'HTML', 'Plain Text'],
          integrations: ['WordPress', 'Contentful', 'HubSpot'],
          responseTime: 'fast',
          accuracy: 'high',
          modelType: 'GPT-4',
          languages: ['English'],
          industries: ['Marketing', 'E-commerce', 'Technology'],
          avgRating: '4.6',
          totalReviews: 18,
          totalOrders: 89
        },
        {
          sellerId: sampleUserId,
          title: 'Data Analytics Dashboard',
          description: 'Intelligent analytics agent that processes your data and generates actionable insights with beautiful visualizations.',
          categoryId: 4,
          basicPrice: '79.99',
          standardPrice: '149.99',
          premiumPrice: '299.99',
          basicDescription: 'Basic data analysis with standard charts',
          standardDescription: 'Advanced analytics with predictive modeling',
          premiumDescription: 'Complete business intelligence solution with real-time dashboards',
          basicDeliveryDays: 5,
          standardDeliveryDays: 7,
          premiumDeliveryDays: 10,
          tags: ['analytics', 'data-science', 'business-intelligence'],
          features: ['Real-time processing', 'Predictive analytics', 'Custom dashboards', 'Data visualization'],
          useCases: [
            { title: 'Sales Analytics', description: 'Track and predict sales performance' },
            { title: 'User Behavior', description: 'Analyze user engagement and conversion patterns' }
          ],
          supportedFormats: ['CSV', 'JSON', 'SQL', 'Excel'],
          integrations: ['Google Analytics', 'Salesforce', 'Tableau'],
          apiEndpoints: true,
          responseTime: 'moderate',
          accuracy: 'high',
          modelType: 'Custom ML',
          languages: ['English'],
          industries: ['Finance', 'E-commerce', 'SaaS'],
          avgRating: '4.9',
          totalReviews: 31,
          totalOrders: 67
        }
      ];

      await db.insert(agents).values(sampleAgents);
      console.log('Sample agents inserted');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}