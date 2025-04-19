import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import {
  Layers,
  Loader2,
  Edit,
  Trash2,
  Star,
  Search,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Listing } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SellerListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [listingToDelete, setListingToDelete] = useState<number | null>(null);

  const { data: listings, isLoading, error } = useQuery<Listing[]>({
    queryKey: ["/api/dashboard/seller/listings"],
    enabled: !!user,
  });

  const filteredListings = listings?.filter(listing => 
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/listings/${listingToDelete}`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/seller/listings"] });
      
      toast({
        title: "Listing deleted",
        description: "Your listing has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete listing",
        variant: "destructive",
      });
    } finally {
      setListingToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading listings. Please try again later.</p>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          You haven't created any listings yet. Create your first listing to start selling your templates.
        </p>
        <Button onClick={() => navigate("/create-listing")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Listing
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search listings..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => navigate("/create-listing")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Listing
        </Button>
      </div>

      <AlertDialog 
        open={!!listingToDelete} 
        onOpenChange={(open) => !open && setListingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this listing and remove it from the marketplace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteListing}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {filteredListings && filteredListings.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {listing.screenshots && listing.screenshots[0] ? (
                        <img
                          src={listing.screenshots[0]}
                          alt={listing.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                          <Layers className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="truncate font-medium">{listing.title}</div>
                        <div className="flex items-center text-xs text-gray-500">
                          {listing.rating !== null && listing.rating !== undefined ? (
                            <>
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                              <span>{listing.rating.toFixed(1)} ({listing.reviewCount} reviews)</span>
                            </>
                          ) : (
                            <span>No ratings yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {listing.createdAt
                      ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })
                      : "Unknown"}
                  </TableCell>
                  <TableCell>${(listing.price / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        listing.isVerified
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      }
                    >
                      {listing.isVerified ? "Verified" : "Pending Review"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/listing/${listing.id}`}>
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/edit-listing/${listing.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setListingToDelete(listing.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No listings found matching your search.</p>
        </div>
      )}
    </div>
  );
}
