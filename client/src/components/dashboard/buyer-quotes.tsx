import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Loader2,
  ExternalLink,
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
import { Quote } from "@shared/schema";
import { useState } from "react";

interface ExtendedQuote extends Quote {
  listing?: {
    id: number;
    title: string;
    screenshots?: string[];
  };
  seller?: {
    id: number;
    username: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning hover:bg-warning/20",
  accepted: "bg-success/10 text-success hover:bg-success/20",
  rejected: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  completed: "bg-primary/10 text-primary hover:bg-primary/20",
};

export default function BuyerQuotes() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: quotes, isLoading, error } = useQuery<ExtendedQuote[]>({
    queryKey: ["/api/quotes/buyer"],
    enabled: !!user,
  });

  const filteredQuotes = quotes?.filter(quote => 
    quote.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.requirements.toLowerCase().includes(searchTerm.toLowerCase())
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
        <p className="text-destructive">Error loading quote requests. Please try again later.</p>
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Quote Requests</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          You haven't submitted any custom quote requests yet. Browse templates and request custom modifications for your specific needs.
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search quote requests..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredQuotes && filteredQuotes.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {quote.listing?.screenshots?.[0] ? (
                        <img
                          src={quote.listing.screenshots[0]}
                          alt={quote.listing?.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="truncate">
                        {quote.listing?.title || `Template #${quote.listingId}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {quote.seller?.username || `Seller #${quote.sellerId}`}
                  </TableCell>
                  <TableCell>
                    {quote.createdAt
                      ? formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })
                      : "Unknown"}
                  </TableCell>
                  <TableCell>
                    {quote.budget ? `$${(quote.budget / 100).toFixed(2)}` : "Not specified"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[quote.status] || statusColors.pending}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/listing/${quote.listingId}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No quote requests found matching your search.</p>
        </div>
      )}
    </div>
  );
}
