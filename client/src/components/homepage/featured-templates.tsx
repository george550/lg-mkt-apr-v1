import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Eye } from "lucide-react";
import { StarIcon } from "@/components/ui/star-icon";
import type { Listing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedTemplates() {
  const {
    data: featuredListings,
    isLoading,
    error
  } = useQuery<Listing[]>({
    queryKey: ["/api/listings/featured"],
  });

  if (isLoading) {
    return (
      <section>
        <div className="container py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Templates</h2>
            <Link href="/browse" className="flex items-center">
              View all
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 pb-2">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-3" />
                  <Skeleton className="h-3 w-4/5 mb-3" />
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex space-x-1">
                      <Skeleton className="h-4 w-14" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-14" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="container py-8">
          <div className="text-center">
            <p className="text-destructive">Failed to load featured templates</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Templates</h2>
          <Link href="/browse" className="flex items-center">
            View all
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>

        <div className="flex flex-wrap justify-start gap-4">
          {featuredListings && featuredListings.length > 0 ? (
            featuredListings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="w-full sm:w-1/3 max-w-[300px]">
                <Card className="h-full">
                  <div className="h-40 bg-muted relative">
                    {listing.screenshots && listing.screenshots.length > 0 ? (
                      <img
                        src={listing.screenshots[0]}
                        alt={`${listing.title} preview`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-muted-foreground text-xs">No preview</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 pb-2">
                    <h3 className="text-base font-medium truncate">{listing.title}</h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 mt-1 mb-3">{listing.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {listing.tags && listing.tags.slice(0, 1).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {listing.rating && (
                        <div className="flex items-center">
                          <StarIcon className="h-3 w-3 text-yellow-500" />
                          <span className="text-muted-foreground ml-1 text-xs">{listing.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-right">
                      <span className="font-medium text-sm">${(listing.price / 100).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No featured templates available</p>
          )}
        </div>
      </div>
    </section>
  );
}
