import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star, Eye } from "lucide-react";
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
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Templates</h2>
            <Link href="/browse" className="text-primary hover:opacity-80 font-medium flex items-center">
              View all
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-5 w-10" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-5 w-16" />
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
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-destructive">Failed to load featured templates</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Templates</h2>
          <Link href="/browse" className="text-primary hover:opacity-80 font-medium flex items-center">
            View all
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredListings && featuredListings.length > 0 ? (
            featuredListings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`}>
                <Card className="h-full">
                  <div className="h-48 bg-muted relative">
                    {listing.screenshots && listing.screenshots.length > 0 ? (
                      <img
                        src={listing.screenshots[0]}
                        alt={`${listing.title} preview`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-muted-foreground">No preview</span>
                      </div>
                    )}
                  </div>
                  <CardContent>
                    <h3 className="text-lg font-medium">{listing.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-2">{listing.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex flex-wrap gap-1">
                        {listing.tags && listing.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {listing.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4" />
                          <span className="text-muted-foreground ml-1">{listing.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-right">
                      <span>${(listing.price / 100).toFixed(2)}</span>
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
