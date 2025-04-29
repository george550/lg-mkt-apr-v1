import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertListingSchema, 
  insertReviewSchema,
  insertQuoteSchema,
} from "@shared/schema";
import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Payments will not work correctly.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});


 

import anthropicService from "./services/anthropic";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Debug OAuth routes
  app.get("/api/debug/oauth", (req: Request, res: Response) => {
    // Don't show actual secret values, just info needed for debugging
    res.json({
      callbackUrl: 'https://workspace.g028.repl.co/api/auth/github/callback',
      clientId: process.env.GITHUB_CLIENT_ID || null
    });
  });

  // Categories routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // Listings routes
  app.get("/api/listings", async (req: Request, res: Response) => {
    try {
      const { category, price_min, price_max, rating, search, limit, offset } = req.query;
      
      const listings = await storage.getListings({
        categoryId: category ? Number(category) : undefined,
        priceMin: price_min ? Number(price_min) : undefined,
        priceMax: price_max ? Number(price_max) : undefined,
        minRating: rating ? Number(rating) : undefined,
        searchTerm: search as string | undefined,
        limit: limit ? Number(limit) : 12,
        offset: offset ? Number(offset) : 0,
      });
      
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching listings" });
    }
  });

  app.get("/api/listings/featured", async (req: Request, res: Response) => {
    try {
      const featuredListings = await storage.getFeaturedListings();
      res.json(featuredListings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured listings" });
    }
  });

  app.get("/api/listings/:id", async (req: Request, res: Response) => {
    try {
      const listing = await storage.getListingById(parseInt(req.params.id));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Error fetching listing" });
    }
  });

  app.post("/api/listings", async (req: Request, res: Response) => {
    try {
      // If authenticated, use the user's ID, otherwise use sellerId from the request (for demo data)
      let sellerId = req.isAuthenticated() ? req.user.id : req.body.sellerId || 1;
      
      const validatedData = insertListingSchema.parse({
        ...req.body,
        sellerId,
      });
      
      const listing = await storage.createListing(validatedData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error creating listing" });
      }
    }
  });

  app.put("/api/listings/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListingById(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.sellerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedListing = await storage.updateListing(listingId, req.body);
      res.json(updatedListing);
    } catch (error) {
      res.status(500).json({ message: "Error updating listing" });
    }
  });

  app.delete("/api/listings/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListingById(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.sellerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteListing(listingId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting listing" });
    }
  });

  // Reviews routes
  app.post("/api/reviews", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error creating review" });
      }
    }
  });

  app.get("/api/listings/:id/reviews", async (req: Request, res: Response) => {
    try {
      const listingId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByListingId(listingId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });

  // Quote requests routes
  app.post("/api/quotes", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const listingId = req.body.listingId;
      const listing = await storage.getListingById(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      const validatedData = insertQuoteSchema.parse({
        ...req.body,
        buyerId: req.user.id,
        sellerId: listing.sellerId,
      });
      
      const quote = await storage.createQuote(validatedData);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error creating quote request" });
      }
    }
  });

  app.get("/api/quotes/buyer", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const quotes = await storage.getQuotesByBuyerId(req.user.id);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quote requests" });
    }
  });

  app.get("/api/quotes/seller", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const quotes = await storage.getQuotesBySellerId(req.user.id);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quote requests" });
    }
  });

  // User dashboard routes
  app.get("/api/dashboard/buyer/purchases", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const purchases = await storage.getPurchasesByBuyerId(req.user.id);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Error fetching purchases" });
    }
  });

  app.get("/api/dashboard/seller/listings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const listings = await storage.getListingsBySellerId(req.user.id);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching seller listings" });
    }
  });

  app.get("/api/dashboard/seller/earnings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const earnings = await storage.getEarningsBySellerId(req.user.id);
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });

  // Stripe checkout route
  app.post("/api/checkout", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { listingId } = req.body;
      if (!listingId) {
        return res.status(400).json({ message: "Missing listingId" });
      }

      // Lookup the listing to get price and title
      const listing = await storage.getListingById(Number(listingId));
      if (!listing || !listing.price || listing.price <= 0) {
        return res.status(400).json({ message: "Invalid listing or price" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: listing.title },
              // listing.price is in cents
              unit_amount: listing.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        // redirect back to your client on success/cancel
        success_url: `${process.env.CLIENT_URL}/listing-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/listing/${listing.id}`,
        metadata: {
          listingId: listing.id.toString(),
          buyerId: req.user.id.toString(),
          sellerId: listing.sellerId.toString(),
        },
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error("Checkout session error:", err);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { listingId, amount } = req.body;
      console.log("Payment intent request:", { listingId, amount, type: typeof amount });
      
      try {
        let paymentIntent;
        let amountInCents = 0;
        
        // Handle direct amount payment (for testing)
        if (amount !== undefined) {
          // Parse amount correctly - ensure we have a valid number
          if (typeof amount === 'string') {
            amountInCents = Math.round(parseFloat(amount) * 100);
          } else if (typeof amount === 'number') {
            amountInCents = Math.round(amount * 100);
          } else {
            return res.status(400).json({ message: "Invalid amount value" });
          }
          
          if (isNaN(amountInCents) || amountInCents <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
          }
          
          console.log("Amount in cents:", amountInCents);
          
          paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            metadata: {
              buyerId: req.user.id.toString(),
            },
          });
        }
        // Handle listing-based payment
        else if (listingId) {
          const listing = await storage.getListingById(parseInt(listingId));
          
          if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
          }
          
          if (!listing.price || isNaN(listing.price) || listing.price <= 0) {
            return res.status(400).json({ message: "Invalid listing price" });
          }
          
          // For listings, the price is stored in cents already
          amountInCents = listing.price;
          console.log("Listing price in cents:", amountInCents);
          
          paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            metadata: {
              listingId: listing.id.toString(),
              buyerId: req.user.id.toString(),
              sellerId: listing.sellerId.toString(),
            },
          });
        } else {
          return res.status(400).json({ message: "Either amount or listingId is required" });
        }
        
        console.log("Payment intent created:", paymentIntent.id);
        return res.json({ clientSecret: paymentIntent.client_secret });
      } catch (stripeErr) {
        console.error("Stripe API error:", stripeErr);
        return res.status(500).json({ message: `Stripe API error: ${(stripeErr as Error).message}` });
      }
    } catch (error) {
      console.error("Payment intent error:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: `Error creating payment intent: ${error.message}` });
      } else {
        res.status(500).json({ message: "Error creating payment intent" });
      }
    }
  });

  // Webhook for handling successful Stripe payments
  app.post("/api/webhook", async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = req.body;
      }
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
      return;
    }
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { listingId, buyerId, sellerId } = paymentIntent.metadata;
      
      // Create purchase record
      await storage.createPurchase({
        listingId: parseInt(listingId),
        buyerId: parseInt(buyerId),
        sellerId: parseInt(sellerId),
        amount: paymentIntent.amount,
        stripePaymentId: paymentIntent.id,
      });
    }
    
    res.json({ received: true });
  });

  // Claude AI API routes
  app.post("/api/ai/enhance-description", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { title, description, tags } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }
      
      const enhancedDescription = await anthropicService.enhanceListingDescription(
        title,
        description,
        tags || []
      );
      
      res.json({ enhancedDescription });
    } catch (error) {
      console.error("Error enhancing description:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: `Error enhancing description: ${error.message}` });
      } else {
        res.status(500).json({ message: "Error enhancing description" });
      }
    }
  });
  
  app.post("/api/ai/sentiment", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const sentimentAnalysis = await anthropicService.analyzeSentiment(text);
      res.json(sentimentAnalysis);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: `Error analyzing sentiment: ${error.message}` });
      } else {
        res.status(500).json({ message: "Error analyzing sentiment" });
      }
    }
  });
  
  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const summary = await anthropicService.summarizeText(text);
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing text:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: `Error summarizing text: ${error.message}` });
      } else {
        res.status(500).json({ message: "Error summarizing text" });
      }
    }
  });
  
  // Generate template listings with Claude
  app.post("/api/admin/generate-templates", async (req: Request, res: Response) => {
    try {
      console.log('Generating project templates with Claude...');
      
      const prompt = `Generate 3 detailed project templates for a developer marketplace. For each template, provide:
1. A title that clearly describes the template
2. A detailed description (200-300 words) explaining its features and benefits
3. The tech stack used (e.g., React, Node.js, MongoDB)
4. 3-4 bullet points of key features as an array called "keyFeatures"
5. 5-7 tags for categorization (e.g., authentication, dashboard, ecommerce)
6. A realistic price between $29-$99
7. A category ID from the following options: 1 (Web Apps), 2 (E-commerce), 3 (API Services), 4 (Mobile Apps), 5 (UI Components)
8. A URL for a demo (use https://demo.company.com/project-name format)
9. A realistic image URL that could be used for a screenshot (use https://images.unsplash.com/photo-ID format)

Format your response as parseable JSON with an array of 3 template objects.`;

      const message = await anthropicService.client.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        system: "You are an expert in generating quality content for developer template marketplaces. Your responses should be technically accurate, creative, and presented in clean, parseable JSON format. Provide realistic examples that developers would find valuable.",
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const jsonString = message.content[0].text;
      // Look for JSON array beginning with [
      const jsonMatch = jsonString.match(/\[\s*\{.*\}\s*\]/s);
      
      if (!jsonMatch) {
        throw new Error("Failed to extract valid JSON from Claude's response");
      }
      
      const templates = JSON.parse(jsonMatch[0]);
      
      console.log('Generated templates:', templates);
      
      // Insert the templates into storage
      const createdTemplates = [];
      for (const template of templates) {
        try {
          const newListing = await storage.createListing({
            title: template.title,
            description: template.description,
            sellerId: 1, // Assuming user 1 is the seller
            price: typeof template.price === 'string' 
              ? Math.round(parseFloat(template.price.replace('$', '')) * 100) 
              : Math.round(template.price * 100), // Convert dollars to cents
            categoryId: template.categoryId,
            tags: template.tags,
            demoUrl: template.demoUrl,
            screenshots: [template.imageUrl],
            techStack: Array.isArray(template.techStack) ? template.techStack : template.techStack.split(', '),
            featuredPoints: template.keyFeatures
          });
          
          console.log(`Created template: ${template.title} with ID ${newListing.id}`);
          createdTemplates.push(newListing);
        } catch (err) {
          console.error(`Error creating template ${template.title}:`, err);
        }
      }
      
      res.status(200).json({ 
        message: 'Successfully added templates to the database',
        templates: createdTemplates
      });
      
    } catch (error) {
      console.error("Error generating templates:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: `Error generating templates: ${error.message}` });
      } else {
        res.status(500).json({ message: "Error generating templates" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
