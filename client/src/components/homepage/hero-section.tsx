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
    <section className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl">
            <span className="block">Discover & Buy Developer</span>
            <span className="block text-primary">Templates & Micro-Apps</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-muted-foreground">
            A curated marketplace for hobbyist developers to buy and sell code.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search templates, apps, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {popularTags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                onClick={() => handleTagClick(tag.name)}
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
