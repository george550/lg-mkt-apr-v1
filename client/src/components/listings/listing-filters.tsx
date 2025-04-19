import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, RefreshCw } from "lucide-react";
import type { Category } from "@shared/schema";

interface ListingFiltersProps {
  initialCategoryId?: number;
  initialPriceMin?: number;
  initialPriceMax?: number;
  initialRating?: number;
  onFiltersChange: (filters: {
    categoryId?: number;
    priceMin?: number;
    priceMax?: number;
    minRating?: number;
  }) => void;
}

export default function ListingFilters({
  initialCategoryId,
  initialPriceMin = 0,
  initialPriceMax = 10000,
  initialRating = 0,
  onFiltersChange,
}: ListingFiltersProps) {
  const [categoryId, setCategoryId] = useState<number | undefined>(initialCategoryId);
  const [priceRange, setPriceRange] = useState<number[]>([initialPriceMin, initialPriceMax]);
  const [minRating, setMinRating] = useState<number>(initialRating);
  
  const {
    data: categories,
    isLoading,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  useEffect(() => {
    // Trigger the parent component's onFiltersChange when local state changes
    onFiltersChange({
      categoryId,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      minRating,
    });
  }, [categoryId, priceRange, minRating, onFiltersChange]);
  
  const handleReset = () => {
    setCategoryId(undefined);
    setPriceRange([0, 10000]);
    setMinRating(0);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        
        {/* Category Filter */}
        <div className="mb-6">
          <Label className="block mb-2">Category</Label>
          <Select
            value={categoryId?.toString() || ""}
            onValueChange={(value) => setCategoryId(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {!isLoading && categories && categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Price Range Filter */}
        <div className="mb-6">
          <Label className="block mb-2">Price Range</Label>
          <Slider
            value={priceRange}
            min={0}
            max={10000}
            step={100}
            onValueChange={setPriceRange}
            className="my-6"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${(priceRange[0] / 100).toFixed(2)}</span>
            <span>${(priceRange[1] / 100).toFixed(2)}</span>
          </div>
        </div>
        
        {/* Rating Filter */}
        <div>
          <Label className="block mb-2">Minimum Rating</Label>
          <RadioGroup
            value={minRating.toString()}
            onValueChange={(value) => setMinRating(parseInt(value))}
            className="flex flex-col space-y-2"
          >
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="flex items-center">
                  {rating === 0 ? (
                    'Any rating'
                  ) : (
                    <div className="flex items-center">
                      {Array(rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      {Array(5 - rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-muted" />
                        ))}
                      <span className="ml-1 text-sm">& up</span>
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
