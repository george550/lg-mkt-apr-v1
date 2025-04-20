import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const popularTags = [
  { name: "React" },
  { name: "NextJS" },
  { name: "Svelte" },
  { name: "Dashboards" },
  { name: "E-commerce" }
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/browse?search=${encodeURIComponent(tag)}`);
  };

  return (
    <section>
      <div className="container py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            <span className="block">Discover & Buy Developer</span>
            <span className="block text-primary">Templates & Micro-Apps</span>
          </h1>
          <p className="text-muted-foreground">
            A curated marketplace for hobbyist developers to buy and sell code.
          </p>
        </div>

        <div className="max-w-lg mx-auto mt-8">
          <form onSubmit={handleSearch}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search templates, apps, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-24"
              />
              <Button 
                type="submit" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
              >
                Search
              </Button>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {popularTags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                onClick={() => handleTagClick(tag.name)}
                className="rounded-md hover:border-gray-400 cursor-pointer transition-colors"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
