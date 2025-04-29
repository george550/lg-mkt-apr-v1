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
  const numericId = parseInt(id, 10);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useQuery<Listing>({
    queryKey: ["listing", numericId],
    queryFn: () =>
      fetch(`/api/listings/${numericId}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listing");
        return res.json();
      }),
    enabled: !isNaN(numericId),
  });

  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please log in to purchase.",
        variant: "destructive",
      });
      return navigate("/auth");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing!.id }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast({
        title: "Checkout failed",
        description: "Unable to start payment. Try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  // Redirect invalid IDs
  useEffect(() => {
    if (isNaN(numericId)) {
      toast({
        title: "Invalid listing",
        description: "That template does not exist.",
        variant: "destructive",
      });
      navigate("/browse");
    }
  }, [numericId, navigate, toast]);

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Listing Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The template you’re looking for isn’t available.
        </p>
        <Button
          onClick={() => navigate("/browse")}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Browse Templates
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{listing.title} – CodeCraft Market</title>
        <meta name="description" content={listing.description.slice(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-sm text-gray-600 dark:text-gray-400">
            <ol className="flex items-center space-x-2">
              <li>
                <Link
                  href="/"
                  className="flex items-center hover:text-gray-900 dark:hover:text-white"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
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
                <span className="font-medium text-gray-900 dark:text-white">
                  {listing.title}
                </span>
              </li>
            </ol>
          </nav>
          {/* Detail */}
          // <ListingDetail listing={listing} />
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <p>{listing.description}</p>
          {/* Tabs */}
          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-12">
            <Tabs defaultValue="overview">
              <TabsList className="mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                <TabsTrigger value="reviews">Reviews & Q&A</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>

              <TabsContent
                value="overview"
                className="prose dark:prose-invert max-w-none"
              >
                <h3 className="text-xl font-semibold mb-4 dark:text-white">
                  Overview
                </h3>
                <p className="whitespace-pre-line">{listing.description}</p>
                {listing.tags?.length > 0 && (
                  <ul className="list-disc list-inside mt-4">
                    {listing.tags.map((tag, i) => (
                      <li key={i}>{tag}</li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="tutorials">
                <p>No tutorials yet. Check back soon!</p>
              </TabsContent>

              <TabsContent value="reviews">
                <p>No reviews yet.</p>
              </TabsContent>

              <TabsContent value="related">
                <p>Related templates will show here.</p>
              </TabsContent>
            </Tabs>
          </div>
          {/* Purchase Action */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-center">
            <Button
              onClick={handleBuy}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {loading
                ? "Redirecting…"
                : `Buy Now $${(listing.price / 100).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
