import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I was able to launch my side project in a weekend instead of spending months building from scratch. The dashboard template I bought was clean, well-documented, and easy to customize.",
    author: "Jamie Smith",
    role: "Frontend Developer",
    initials: "JS"
  },
  {
    quote: "As a seller, I've made over $2,000 from my React components. The marketplace makes it so easy to list and sell my work, and the community feedback has helped me improve my code quality.",
    author: "Maria Kim",
    role: "Full Stack Developer",
    initials: "MK"
  },
  {
    quote: "CodeCraft saved me weeks of development time for my startup. I bought a template, customized it to match our brand, and had our MVP ready for demos in just 3 days. Worth every penny!",
    author: "Alex Thompson",
    role: "Startup Founder",
    initials: "AT"
  }
];

export default function TestimonialSection() {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Trusted by Developers</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Join thousands of hobbyist developers who are saving time and making money with CodeCraft templates.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-foreground mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <Avatar>
                    <AvatarFallback>
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
