import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import SellerListings from "@/components/dashboard/seller-listings";
import SellerEarnings from "@/components/dashboard/seller-earnings";
import SellerQuotes from "@/components/dashboard/seller-quotes";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SellerDashboard() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("listings");

  // Parse tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const tab = searchParams.get("tab");
    if (tab === "earnings" || tab === "quotes") {
      setActiveTab(tab);
    } else {
      setActiveTab("listings");
    }
  }, [location]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newPath = value === "listings" 
      ? "/dashboard/seller" 
      : `/dashboard/seller?tab=${value}`;
    navigate(newPath);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Seller Dashboard - CodeCraft Market</title>
        <meta name="description" content="Manage your listings, earnings, and quote requests" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage your listings, earnings, and quote requests
              </p>
            </div>
            <Button className="mt-4 sm:mt-0" onClick={() => navigate('/create-listing')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Listing
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <DashboardSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="listings">My Listings</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="listings">
                  <SellerListings />
                </TabsContent>

                <TabsContent value="earnings">
                  <SellerEarnings />
                </TabsContent>

                <TabsContent value="quotes">
                  <SellerQuotes />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
