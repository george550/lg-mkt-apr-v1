import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ListingCard from "./listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Listing } from "@shared/schema";

interface ListingGridProps {
  categoryId?: number;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  searchTerm?: string;
}

export default function ListingGrid({
  categoryId,
  priceMin,
  priceMax,
  minRating,
  searchTerm,
}: ListingGridProps) {
  const [page, setPage] = useState(1);
  const limit = 12;
  const offset = (page - 1) * limit;

  // Build query string
  let queryString = `/api/listings?limit=${limit}&offset=${offset}`;
  if (categoryId) queryString += `&category=${categoryId}`;
  if (priceMin) queryString += `&price_min=${priceMin}`;
  if (priceMax) queryString += `&price_max=${priceMax}`;
  if (minRating) queryString += `&rating=${minRating}`;
  if (searchTerm) queryString += `&search=${encodeURIComponent(searchTerm)}`;

  const {
    data: listings,
    isLoading,
    error,
    refetch
  } = useQuery<Listing[]>({
    queryKey: [queryString],
  });

  // Refetch when filters change
  useEffect(() => {
    setPage(1);
    refetch();
  }, [categoryId, priceMin, priceMax, minRating, searchTerm, refetch]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-1" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Error loading listings</p>;
  }

  // Calculate if we can go to next/prev page
  const hasMore = listings && listings.length === limit;
  const hasPrevious = page > 1;

  return (
    <div>
      {listings && listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 px-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}
