import { 
  User, InsertUser, 
  Category, InsertCategory,
  Listing, InsertListing,
  Purchase, InsertPurchase,
  Review, InsertReview,
  Quote, InsertQuote
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

interface ListingFilters {
  categoryId?: number;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Listing methods
  getListings(filters: ListingFilters): Promise<Listing[]>;
  getListingById(id: number): Promise<Listing | undefined>;
  getFeaturedListings(limit?: number): Promise<Listing[]>;
  getListingsBySellerId(sellerId: number): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: number): Promise<void>;
  
  // Purchase methods
  getPurchasesByBuyerId(buyerId: number): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  
  // Review methods
  getReviewsByListingId(listingId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Quote methods
  getQuotesByBuyerId(buyerId: number): Promise<Quote[]>;
  getQuotesBySellerId(sellerId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  
  // Dashboard methods
  getEarningsBySellerId(sellerId: number): Promise<{
    totalEarnings: number;
    recentEarnings: { date: string; amount: number }[];
  }>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private listings: Map<number, Listing>;
  private purchases: Map<number, Purchase>;
  private reviews: Map<number, Review>;
  private quotes: Map<number, Quote>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number = 1;
  private categoryIdCounter: number = 1;
  private listingIdCounter: number = 1;
  private purchaseIdCounter: number = 1;
  private reviewIdCounter: number = 1;
  private quoteIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.listings = new Map();
    this.purchases = new Map();
    this.reviews = new Map();
    this.quotes = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      rating: 0,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id, listingCount: 0 };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Listing methods
  async getListings(filters: ListingFilters): Promise<Listing[]> {
    let listings = Array.from(this.listings.values());
    
    if (filters.categoryId) {
      listings = listings.filter(listing => listing.categoryId === filters.categoryId);
    }
    
    if (filters.priceMin) {
      listings = listings.filter(listing => listing.price >= filters.priceMin!);
    }
    
    if (filters.priceMax) {
      listings = listings.filter(listing => listing.price <= filters.priceMax!);
    }
    
    if (filters.minRating) {
      listings = listings.filter(listing => (listing.rating || 0) >= filters.minRating!);
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      listings = listings.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) || 
        listing.description.toLowerCase().includes(searchLower) ||
        (listing.tags && listing.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    // Sort by creation date (newest first)
    listings.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Apply pagination
    const limit = filters.limit || 12;
    const offset = filters.offset || 0;
    
    return listings.slice(offset, offset + limit);
  }

  async getListingById(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getFeaturedListings(limit = 4): Promise<Listing[]> {
    // In a real implementation, we might feature listings based on popularity or other criteria
    const listings = Array.from(this.listings.values())
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
    
    return listings;
  }

  async getListingsBySellerId(sellerId: number): Promise<Listing[]> {
    return Array.from(this.listings.values())
      .filter(listing => listing.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const id = this.listingIdCounter++;
    const now = new Date();
    
    const newListing: Listing = {
      ...listing,
      id,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      createdAt: now,
      updatedAt: now
    };
    
    this.listings.set(id, newListing);
    
    // Update category listing count
    const category = this.categories.get(listing.categoryId);
    if (category) {
      category.listingCount = (category.listingCount || 0) + 1;
      this.categories.set(category.id, category);
    }
    
    return newListing;
  }

  async updateListing(id: number, updates: Partial<InsertListing>): Promise<Listing> {
    const listing = this.listings.get(id);
    if (!listing) throw new Error("Listing not found");
    
    const updatedListing: Listing = {
      ...listing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.listings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteListing(id: number): Promise<void> {
    const listing = this.listings.get(id);
    if (!listing) throw new Error("Listing not found");
    
    this.listings.delete(id);
    
    // Update category listing count
    const category = this.categories.get(listing.categoryId);
    if (category) {
      category.listingCount = Math.max(0, (category.listingCount || 0) - 1);
      this.categories.set(category.id, category);
    }
  }

  // Purchase methods
  async getPurchasesByBuyerId(buyerId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = this.purchaseIdCounter++;
    const now = new Date();
    
    const newPurchase: Purchase = {
      ...purchase,
      id,
      status: "completed",
      createdAt: now
    };
    
    this.purchases.set(id, newPurchase);
    return newPurchase;
  }

  // Review methods
  async getReviewsByListingId(listingId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.listingId === listingId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    
    const newReview: Review = {
      ...review,
      id,
      createdAt: now
    };
    
    this.reviews.set(id, newReview);
    
    // Update listing rating and review count
    const listing = this.listings.get(review.listingId);
    if (listing) {
      const listingReviews = await this.getReviewsByListingId(review.listingId);
      const totalRating = listingReviews.reduce((sum, r) => sum + r.rating, 0);
      listing.reviewCount = listingReviews.length;
      listing.rating = totalRating / listingReviews.length;
      this.listings.set(listing.id, listing);
    }
    
    return newReview;
  }

  // Quote methods
  async getQuotesByBuyerId(buyerId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values())
      .filter(quote => quote.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getQuotesBySellerId(sellerId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values())
      .filter(quote => quote.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const id = this.quoteIdCounter++;
    const now = new Date();
    
    const newQuote: Quote = {
      ...quote,
      id,
      status: "pending",
      createdAt: now
    };
    
    this.quotes.set(id, newQuote);
    return newQuote;
  }

  // Dashboard methods
  async getEarningsBySellerId(sellerId: number): Promise<{
    totalEarnings: number;
    recentEarnings: { date: string; amount: number }[];
  }> {
    const purchases = Array.from(this.purchases.values())
      .filter(purchase => purchase.sellerId === sellerId && purchase.status === "completed");
    
    const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    
    // Group purchases by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPurchases = purchases.filter(purchase => 
      new Date(purchase.createdAt) >= thirtyDaysAgo
    );
    
    const earningsByDate: { [date: string]: number } = {};
    
    recentPurchases.forEach(purchase => {
      const date = new Date(purchase.createdAt).toISOString().split('T')[0];
      earningsByDate[date] = (earningsByDate[date] || 0) + purchase.amount;
    });
    
    const recentEarnings = Object.entries(earningsByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      totalEarnings,
      recentEarnings
    };
  }

  // Helper method to initialize demo data
  private initializeDemoData() {
    // Create categories
    const categories: InsertCategory[] = [
      { name: "Dashboards", slug: "dashboards", description: "Analytics, admin panels, and data visualization", iconName: "LineChart", color: "#6366F1" },
      { name: "E-commerce", slug: "ecommerce", description: "Online stores, product pages, and checkout flows", iconName: "ShoppingBag", color: "#10B981" },
      { name: "Chat & Social", slug: "chat-social", description: "Messaging, forums, and social networks", iconName: "MessageCircle", color: "#F59E0B" },
      { name: "UI Components", slug: "ui-components", description: "Reusable elements, form controls, and layouts", iconName: "Sliders", color: "#EF4444" },
      { name: "Data Tables", slug: "data-tables", description: "Interactive tables with sorting and filtering", iconName: "Table", color: "#3B82F6" },
      { name: "Landing Pages", slug: "landing-pages", description: "Marketing sites and conversion-focused pages", iconName: "Layout", color: "#8B5CF6" },
      { name: "Email Templates", slug: "email-templates", description: "Responsive HTML emails for marketing and notifications", iconName: "Mail", color: "#EC4899" },
      { name: "Portfolio", slug: "portfolio", description: "Developer portfolios and personal websites", iconName: "User", color: "#6B7280" }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
  }
}

export const storage = new MemStorage();
