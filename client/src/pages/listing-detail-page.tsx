import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@shared/schema";
import ListingDetail from "@/components/listings/listing-detail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { Loader2, ChevronRight, Home } from "lucide-react";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
//  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
//  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const {
    data: listing,
    isLoading,
    error,
    isError
  } = useQuery<Listing>({
    queryKey: [`/api/listings/${numericId}`],
    enabled: !isNaN(numericId),
  });

  // After your `useQuery` block, add:
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
      toast({
        title: "Purchase failed",
        description: "There was a problem starting checkout. Please try again.",
        variant: "destructive",
      });
    }
  }
  

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

 /* const handleBuyNow = () => {
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

  */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-white dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-500" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Listing Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The template you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/browse")} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
          Browse Templates
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${listing.title} - CodeCraft Market`}</title>
        <meta name="description" content={listing.description.substring(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-sm text-gray-600 dark:text-gray-400">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-gray-900 dark:hover:text-white flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link 
                  href={`/browse?category=${listing.categoryId}`} 
                  className="hover:text-gray-900 dark:hover:text-white"
                >
                  Category
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-gray-900 dark:text-white font-medium">{listing.title}</span>
              </li>
            </ol>
          </nav>
          
          {/* Listing Detail Component */}
          <ListingDetail listing={listing} />

          {/* Tabs Section - Positioned completely below both columns */}
          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-12 col-span-full">
            <Tabs defaultValue="overview">
              <TabsList className="mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                <TabsTrigger value="reviews">Reviews & Q&A</TabsTrigger>
                <TabsTrigger value="related">Related Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Overview</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{listing.description}</p>
                
                {listing.tags && listing.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-2 dark:text-white">Technologies Used</h4>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                      {listing.tags.map((tag, index) => (
                        <li key={index}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tutorials">
                <div className="border-l-4 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 p-4">
                  <p className="text-yellow-800 dark:text-yellow-200">
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
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reviews Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        This template hasn't received any reviews yet. Be the first to review after purchasing!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="related">
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Related Templates</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Related templates will appear here based on this template's category and tags.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Purchase Actions */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-center">
            <Button
              onClick={handleBuy}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {loading ? "Redirecting…" : `Buy Now $${(listing.price/100).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
