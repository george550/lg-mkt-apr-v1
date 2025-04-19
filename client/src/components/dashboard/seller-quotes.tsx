import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Loader2,
  ExternalLink,
  Check,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Quote } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExtendedQuote extends Quote {
  listing?: {
    id: number;
    title: string;
    screenshots?: string[];
  };
  buyer?: {
    id: number;
    username: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  accepted: "bg-green-100 text-green-800 hover:bg-green-200",
  rejected: "bg-red-100 text-red-800 hover:bg-red-200",
  completed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
};

export default function SellerQuotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<ExtendedQuote | null>(null);

  const { data: quotes, isLoading, error } = useQuery<ExtendedQuote[]>({
    queryKey: ["/api/quotes/seller"],
    enabled: !!user,
  });

  const filteredQuotes = quotes?.filter(quote => 
    quote.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.requirements.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.buyer?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateQuoteStatus = async (quoteId: number, status: string) => {
    try {
      await apiRequest("PATCH", `/api/quotes/${quoteId}`, { status });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/seller"] });
      
      toast({
        title: `Quote ${status}`,
        description: `You have ${status} the quote request.`,
      });
      
      setSelectedQuote(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${status} quote`,
        variant: "destructive",
      });
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
        <p className="text-red-500">Error loading quote requests. Please try again later.</p>
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Quote Requests</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You haven't received any custom quote requests yet. Buyers will appear here when they request custom work.
        </p>
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
            placeholder="Search quote requests..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quote Request Details</DialogTitle>
            <DialogDescription>
              Review the details and respond to this request
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Listing</h4>
                <p className="mt-1">{selectedQuote.listing?.title || `Listing #${selectedQuote.listingId}`}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">From</h4>
                <p className="mt-1">{selectedQuote.buyer?.username || `Buyer #${selectedQuote.buyerId}`}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Requirements</h4>
                <p className="mt-1 whitespace-pre-line">{selectedQuote.requirements}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Budget</h4>
                <p className="mt-1">
                  {selectedQuote.budget ? `$${(selectedQuote.budget / 100).toFixed(2)}` : "Not specified"}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Received</h4>
                <p className="mt-1">
                  {selectedQuote.createdAt
                    ? formatDistanceToNow(new Date(selectedQuote.createdAt), { addSuffix: true })
                    : "Unknown"}
                </p>
              </div>
              
              {selectedQuote.status === "pending" && (
                <div className="pt-4 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
                    onClick={() => handleUpdateQuoteStatus(selectedQuote.id, "rejected")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleUpdateQuoteStatus(selectedQuote.id, "accepted")}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredQuotes && filteredQuotes.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Buyer</TableHead>
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
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div className="truncate">
                        {quote.listing?.title || `Template #${quote.listingId}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {quote.buyer?.username || `Buyer #${quote.buyerId}`}
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
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuote(quote)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/listing/${quote.listingId}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Listing
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No quote requests found matching your search.</p>
        </div>
      )}
    </div>
  );
}
