import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  Download,
  Loader2,
  FileCode,
  Search
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
import { Purchase } from "@shared/schema";
import { useState } from "react";

interface ExtendedPurchase extends Purchase {
  listing?: {
    id: number;
    title: string;
    price: number;
    screenshots?: string[];
  };
}

export default function BuyerPurchases() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: purchases, isLoading, error } = useQuery<ExtendedPurchase[]>({
    queryKey: ["/api/dashboard/buyer/purchases"],
    enabled: !!user,
  });

  const filteredPurchases = purchases?.filter(purchase => 
    purchase.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <p className="text-red-500">Error loading purchases. Please try again later.</p>
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <FileCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchases Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          You haven't purchased any templates yet. Browse our marketplace to find templates that suit your needs.
        </p>
        <Link href="/browse">
          <Button>Browse Templates</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search purchases..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredPurchases && filteredPurchases.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {purchase.listing?.screenshots?.[0] ? (
                        <img
                          src={purchase.listing.screenshots[0]}
                          alt={purchase.listing?.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                          <FileCode className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div className="truncate">
                        {purchase.listing?.title || `Template #${purchase.listingId}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {purchase.createdAt
                      ? formatDistanceToNow(new Date(purchase.createdAt), { addSuffix: true })
                      : "Unknown"}
                  </TableCell>
                  <TableCell>${(purchase.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      {purchase.status || "completed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      asChild
                    >
                      <Link href={`/listing/${purchase.listingId}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No purchases found matching your search.</p>
        </div>
      )}
    </div>
  );
}
