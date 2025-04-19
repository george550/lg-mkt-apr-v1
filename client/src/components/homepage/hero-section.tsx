import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const popularTags = [
  { name: "React", color: "bg-indigo-100 text-indigo-800" },
  { name: "NextJS", color: "bg-emerald-100 text-emerald-800" },
  { name: "Svelte", color: "bg-yellow-100 text-yellow-800" },
  { name: "Dashboards", color: "bg-blue-100 text-blue-800" },
  { name: "E-commerce", color: "bg-pink-100 text-pink-800" }
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
    <section className="bg-gradient-to-b from-indigo-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            <span className="block">Discover & Buy Developer</span>
            <span className="block text-primary">Templates & Micro-Apps</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            A curated marketplace for hobbyist developers to buy and sell code.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex rounded-md shadow-sm bg-white ring-1 ring-gray-300 p-1">
              <div className="relative flex items-stretch flex-grow focus-within:z-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 py-3 border-0 outline-none text-gray-900"
                  placeholder="Search templates, apps, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="px-6 py-3 rounded-r-md">
                Search
              </Button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {popularTags.map((tag, index) => (
              <Badge
                key={index}
                className={`${tag.color} cursor-pointer hover:opacity-90 px-3 py-1`}
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
