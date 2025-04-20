import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../server/storage.js';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateProjectTemplates() {
  try {
    console.log('Generating project templates with Claude...');
    
    const prompt = `Generate 3 detailed project templates for a developer marketplace. For each template, provide:
1. A title that clearly describes the template
2. A detailed description (200-300 words) explaining its features and benefits
3. The tech stack used (e.g., React, Node.js, MongoDB)
4. 3-4 bullet points of key features
5. 5-7 tags for categorization (e.g., authentication, dashboard, ecommerce)
6. A realistic price between $29-$99
7. A category ID from the following options: 1 (Web Apps), 2 (E-commerce), 3 (API Services), 4 (Mobile Apps), 5 (UI Components)
8. A URL for a demo (use https://demo.company.com/project-name format)
9. A realistic image URL that could be used for a screenshot (use https://images.unsplash.com/photo-ID format)

Format your response as parseable JSON with an array of 3 template objects.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: "You are an expert in generating quality content for developer template marketplaces. Your responses should be technically accurate, creative, and presented in clean, parseable JSON format. Provide realistic examples that developers would find valuable.",
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const jsonString = message.content[0].text;
    const templates = JSON.parse(jsonString);
    
    console.log('Generated templates:', templates);
    
    // Insert the templates into storage
    for (const template of templates) {
      try {
        const newListing = await storage.createListing({
          title: template.title,
          description: template.description,
          sellerId: 1, // Assuming user 1 is the seller
          price: Math.round(parseFloat(template.price.replace('$', '')) * 100), // Convert dollars to cents
          categoryId: template.categoryId,
          tags: template.tags,
          demoUrl: template.demoUrl,
          screenshots: [template.imageUrl],
          techStack: template.techStack.split(', '),
          featuredPoints: template.keyFeatures
        });
        
        console.log(`Created template: ${template.title} with ID ${newListing.id}`);
      } catch (err) {
        console.error(`Error creating template ${template.title}:`, err);
      }
    }
    
    console.log('Successfully added all templates to the database');
    
  } catch (error) {
    console.error('Error generating templates:', error);
  }
}

// Run the script
generateProjectTemplates();