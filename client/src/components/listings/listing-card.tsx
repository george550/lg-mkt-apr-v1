import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@shared/schema";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md cursor-pointer h-full flex flex-col">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 group-hover:opacity-90 h-48">
          {listing.screenshots && listing.screenshots.length > 0 ? (
            <img
              src={listing.screenshots[0]}
              alt={`${listing.title} preview`}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <span className="text-gray-400">No preview</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
            <Button variant="secondary" size="sm" className="text-gray-800">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <span className="text-white font-medium">${(listing.price / 100).toFixed(2)}</span>
          </div>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{listing.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{listing.description}</p>
          <div className="flex justify-between items-center mt-auto">
            <div className="flex flex-wrap gap-1">
              {listing.tags && listing.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="px-2 py-0.5 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            {listing.rating !== null && listing.rating !== undefined && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-gray-600 ml-1">{listing.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
