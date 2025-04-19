import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ExternalLink,
  User,
  Star,
  Calendar,
  CheckCircle,
} from "lucide-react";
import type { Listing } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface ListingDetailProps {
  listing: Listing;
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: seller } = useQuery({
    queryKey: [`/api/users/${listing.sellerId}`],
    // If the endpoint doesn't exist, we'll just show a placeholder
    enabled: !!listing.sellerId,
  });

  const { data: category } = useQuery({
    queryKey: [`/api/categories/${listing.categoryId}`],
    enabled: !!listing.categoryId,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column - Images */}
      <div className="lg:col-span-2">
        <div className="mb-4">
          <Carousel
            onSelect={(index) => setCurrentImageIndex(index)}
            className="w-full max-w-3xl mx-auto"
          >
            <CarouselContent>
              {listing.screenshots && listing.screenshots.length > 0 ? (
                listing.screenshots.map((screenshot, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1 h-[300px] sm:h-[400px] relative rounded-lg overflow-hidden">
                      <img
                        src={screenshot}
                        alt={`${listing.title} screenshot ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="p-1 h-[300px] sm:h-[400px] flex items-center justify-center bg-muted rounded-lg">
                    <span className="text-muted-foreground">No screenshots available</span>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        {/* Thumbnail navigation */}
        {listing.screenshots && listing.screenshots.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {listing.screenshots.map((screenshot, index) => (
              <button
                key={index}
                className={`relative w-16 h-16 rounded-md overflow-hidden transition-all ${
                  index === currentImageIndex
                    ? "ring-2 ring-primary"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={screenshot}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Demo link */}
        {listing.demoUrl && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(listing.demoUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Live Demo</span>
            </Button>
          </div>
        )}
      </div>

      {/* Right column - Listing details */}
      <div>
        <div className="sticky top-24">
          <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
          
          <div className="flex items-center gap-4 mb-4">
            {category ? (
              <Badge
                style={{ backgroundColor: category.color ? `${category.color}20` : 'var(--primary)',
                        color: category.color || 'var(--primary)' }}
              >
                {category.name}
              </Badge>
            ) : (
              <Skeleton className="h-6 w-20" />
            )}
            
            {listing.isVerified && (
              <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary">
                <CheckCircle className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </div>

          <div className="flex items-center mb-6">
            {listing.rating !== null && listing.rating !== undefined ? (
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(listing.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">
                  {listing.rating.toFixed(1)} ({listing.reviewCount} reviews)
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No ratings yet</span>
            )}
          </div>

          <div className="text-3xl font-bold mb-6">
            ${(listing.price / 100).toFixed(2)}
          </div>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Seller info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">About the Seller</h3>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {seller ? seller.username : "Loading..."}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {listing.createdAt
                        ? `Listed ${formatDistanceToNow(new Date(listing.createdAt))} ago`
                        : "Recently listed"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's included */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">What's Included</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>Full source code</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>Documentation</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>6 months of updates</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>Support via email</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
