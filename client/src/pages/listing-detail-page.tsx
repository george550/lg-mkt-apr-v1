import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@shared/schema";
import ListingDetail from "@/components/listings/listing-detail";
import PaymentForm from "@/components/checkout/payment-form";
import QuoteForm from "@/components/quote/quote-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { Helmet } from "react-helmet";
import { Loader2, ChevronRight, Home } from "lucide-react";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const {
    data: listing,
    isLoading,
    error,
    isError
  } = useQuery<Listing>({
    queryKey: [`/api/listings/${numericId}`],
    enabled: !isNaN(numericId),
  });

  useEffect(() => {
    if (isNaN(numericId)) {
      navigate("/browse");
      toast({
        title: "Invalid listing ID",
        description: "The listing you're looking for doesn't exist.",
        variant: "destructive",
      });
    }
  }, [numericId, navigate, toast]);

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase this template.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsPaymentModalOpen(true);
  };

  const handleRequestQuote = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request a custom quote.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsQuoteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
        <p className="text-gray-600 mb-6">
          The template you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/browse")}>Browse Templates</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${listing.title} - CodeCraft Market`}</title>
        <meta name="description" content={listing.description.substring(0, 160)} />
      </Helmet>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-sm text-muted-foreground">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-foreground flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link 
                  href={`/browse?category=${listing.categoryId}`} 
                  className="hover:text-foreground"
                >
                  Category
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-foreground font-medium">{listing.title}</span>
              </li>
            </ol>
          </nav>
          
          {/* Listing Detail Component */}
          <ListingDetail listing={listing} />

          {/* Tabs Section */}
          <div className="mt-12 border-t border-gray-200 pt-12">
            <Tabs defaultValue="overview">
              <TabsList className="mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                <TabsTrigger value="reviews">Reviews & Q&A</TabsTrigger>
                <TabsTrigger value="related">Related Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Overview</h3>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
                
                {listing.tags && listing.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-2">Technologies Used</h4>
                    <ul className="list-disc list-inside">
                      {listing.tags.map((tag, index) => (
                        <li key={index}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tutorials">
                <div className="border-l-4 border-yellow-300 bg-yellow-50 p-4">
                  <p className="text-yellow-800">
                    This template doesn't have any tutorials yet. Check back soon!
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="space-y-6">
                  {listing.reviewCount && listing.reviewCount > 0 ? (
                    <p>Reviews will appear here</p>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        This template hasn't received any reviews yet. Be the first to review after purchasing!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="related">
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Related Templates</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Related templates will appear here based on this template's category and tags.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Purchase Actions */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <AlertDialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <AlertDialogTrigger asChild>
                  <Button className="w-full sm:w-auto" onClick={handleBuyNow}>
                    Buy Now (${(listing.price / 100).toFixed(2)})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Complete Your Purchase</AlertDialogTitle>
                    <AlertDialogDescription>
                      You're purchasing {listing.title} for ${(listing.price / 100).toFixed(2)}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <PaymentForm listingId={listing.id} onSuccess={() => setIsPaymentModalOpen(false)} price={listing.price} />
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={handleRequestQuote}>
                    Request Custom Quote
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Request a Custom Quote</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tell the creator what custom features or modifications you need.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <QuoteForm 
                    listingId={listing.id} 
                    sellerId={listing.sellerId} 
                    onSuccess={() => setIsQuoteModalOpen(false)} 
                  />
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
