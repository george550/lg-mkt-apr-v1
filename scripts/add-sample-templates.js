import { storage } from '../server/storage.js';

const templates = [
  {
    title: "FullStack E-Commerce Dashboard with Analytics",
    description: "A comprehensive e-commerce management solution built with React, Node.js, and MongoDB. This template offers a complete dashboard for online store management with real-time analytics, inventory tracking, and order processing. The clean, modern UI features customizable widgets that give merchants a clear overview of sales performance, customer demographics, and product popularity. Advanced analytics tools provide actionable insights through beautiful visualizations and exportable reports. The integrated inventory management system includes automated alerts for low stock, batch product uploads, and variant management. Order processing capabilities cover the entire fulfillment workflow from payment confirmation to shipping integration. Built with scalability in mind, this template can handle stores of any size, from small boutiques to enterprise retailers with thousands of products.",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Chart.js", "Redux", "Material UI"],
    keyFeatures: [
      "Real-time sales analytics with customizable dashboards",
      "Comprehensive inventory management system",
      "Streamlined order processing workflow",
      "Customer relationship management tools"
    ],
    tags: ["e-commerce", "dashboard", "analytics", "inventory", "fullstack", "admin", "mongodb"],
    price: 7999,
    categoryId: 2,
    demoUrl: "https://demo.company.com/ecommerce-dashboard",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    sellerId: 1
  },
  {
    title: "Microservices API Gateway Boilerplate",
    description: "A production-ready API gateway template built for modern microservice architectures. This boilerplate provides a robust foundation for creating, deploying, and managing distributed systems with advanced request routing, load balancing, and service discovery capabilities. The gateway includes a flexible authentication system with support for OAuth2, JWT, and API keys, allowing for granular access control across different services. Comprehensive monitoring tools are integrated with Prometheus for metrics collection and visualization, enabling real-time system health checks and performance analytics exposed for operational visibility. The template features robust security measures including JWT authentication, request sanitization, and protection against common API vulnerabilities. Documentation is generated automatically from code using OpenAPI specifications, ensuring that API consumers always have up-to-date reference materials.",
    techStack: ["Node.js", "Express", "Redis", "Docker", "Kubernetes", "JWT", "Prometheus", "OpenAPI"],
    keyFeatures: [
      "Service discovery and automatic registration",
      "Advanced rate limiting and request throttling",
      "Centralized authentication and authorization",
      "Comprehensive logging and monitoring integration"
    ],
    tags: ["microservices", "api-gateway", "kubernetes", "devops", "scalability", "security", "docker"],
    price: 8999,
    categoryId: 3,
    demoUrl: "https://demo.company.com/api-gateway-boilerplate",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
    sellerId: 1
  },
  {
    title: "React Native Social Media Starter Kit",
    description: "Jump-start your social media app development with this feature-rich React Native template. This starter kit provides a solid foundation for building cross-platform social networking applications with all the essential features users expect. The template includes a polished UI with smooth animations and transitions that deliver a native-like experience on both iOS and Android platforms. Core social features like user profiles, friend/follow relationships, activity feeds, and real-time notifications are pre-implemented and ready to customize. The messaging system supports text, images, and other media types with real-time delivery powered by Firebase. Performance optimization is built into the architecture, with efficient list rendering for feeds and image caching to minimize network usage. The template supports offline functionality, allowing users to interact with cached content when connectivity is limited.",
    techStack: ["React Native", "Firebase", "Redux", "Node.js", "Express", "MongoDB", "Socket.io"],
    keyFeatures: [
      "Complete user authentication with social logins",
      "Real-time messaging and notifications",
      "Customizable activity feeds with engagement features",
      "Cross-platform compatibility with shared codebase"
    ],
    tags: ["mobile", "social-media", "react-native", "real-time", "messaging", "cross-platform"],
    price: 6999,
    categoryId: 4,
    demoUrl: "https://demo.company.com/social-media-starter",
    imageUrl: "https://images.unsplash.com/photo-1556155092-490a1ba16284",
    sellerId: 1
  }
];

async function addSampleTemplates() {
  console.log('Adding sample templates to database...');
  
  const createdTemplates = [];
  
  for (const template of templates) {
    try {
      const newListing = await storage.createListing(template);
      console.log(`Created template: ${template.title} with ID ${newListing.id}`);
      createdTemplates.push(newListing);
    } catch (err) {
      console.error(`Error creating template ${template.title}:`, err);
    }
  }
  
  console.log('Successfully added all templates to the database');
  return createdTemplates;
}

// Run the script
addSampleTemplates()
  .then((templates) => {
    console.log(`Added ${templates.length} templates`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in script execution:', error);
    process.exit(1);
  });