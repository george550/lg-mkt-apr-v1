import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ListingGrid from "@/components/listings/listing-grid";
import ListingFilters from "@/components/listings/listing-filters";

export default function BrowsePage() {
  const [location] = useLocation();
  
  // Parse query parameters
  const params = new URLSearchParams(location.split("?")[1]);
  const initialCategory = params.get("category") ? parseInt(params.get("category")!) : undefined;
  const initialSearch = params.get("search") || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [tempSearchTerm, setTempSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState({
    categoryId: initialCategory,
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    minRating: undefined as number | undefined,
  });
  
  // Update search term from URL when it changes
  useEffect(() => {
    const newSearch = params.get("search") || "";
    setSearchTerm(newSearch);
    setTempSearchTerm(newSearch);
  }, [location]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(tempSearchTerm);
  };
  
  const handleFiltersChange = (newFilters: {
    categoryId?: number;
    priceMin?: number;
    priceMax?: number;
    minRating?: number;
  }) => {
    setFilters(newFilters);
  };
  
  return (
    <>
      <Helmet>
        <title>Browse Templates - CodeCraft Market</title>
        <meta name="description" content="Browse our collection of developer templates, components, and micro-apps." />
      </Helmet>
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Browse Templates</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of high-quality templates, components, and micro-apps built by developers for developers.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  className="pl-10 py-6 rounded-l-md w-full"
                  placeholder="Search templates, components, apps..."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" className="py-6 px-6 rounded-l-none">
                Search
              </Button>
            </form>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full md:w-auto flex-shrink-0">
              <div className="sticky top-4">
                <ListingFilters
                  initialCategoryId={filters.categoryId}
                  initialPriceMin={filters.priceMin}
                  initialPriceMax={filters.priceMax}
                  initialRating={filters.minRating}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
            </div>
            
            {/* Listings Grid */}
            <div className="flex-grow">
              {searchTerm && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    {searchTerm ? `Search results for "${searchTerm}"` : "All Templates"}
                  </h2>
                </div>
              )}
              
              <ListingGrid
                categoryId={filters.categoryId}
                priceMin={filters.priceMin}
                priceMax={filters.priceMax}
                minRating={filters.minRating}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
