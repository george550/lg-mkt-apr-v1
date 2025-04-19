import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import BuyerPurchases from "@/components/dashboard/buyer-purchases";
import BuyerQuotes from "@/components/dashboard/buyer-quotes";
import { Helmet } from "react-helmet";

export default function BuyerDashboard() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("purchases");

  // Parse tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const tab = searchParams.get("tab");
    if (tab === "quotes") {
      setActiveTab("quotes");
    } else {
      setActiveTab("purchases");
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
    const newPath = value === "purchases" 
      ? "/dashboard/buyer" 
      : `/dashboard/buyer?tab=${value}`;
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
        <title>Buyer Dashboard - CodeCraft Market</title>
        <meta name="description" content="Manage your purchases and quote requests" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your purchases and custom quote requests
            </p>
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
                  <TabsTrigger value="purchases">My Purchases</TabsTrigger>
                  <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="purchases">
                  <BuyerPurchases />
                </TabsContent>

                <TabsContent value="quotes">
                  <BuyerQuotes />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
