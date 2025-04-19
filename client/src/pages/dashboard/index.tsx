import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Helmet } from "react-helmet";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  const handleTabChange = (value: string) => {
    navigate(`/dashboard/${value}`);
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
        <title>Dashboard - CodeCraft Market</title>
        <meta name="description" content="Manage your purchases, quotes, listings, and earnings" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your purchases, quotes, listings, and earnings
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
                defaultValue="buyer"
                onValueChange={handleTabChange}
                className="mb-8"
              >
                <TabsList>
                  <TabsTrigger value="buyer">Buyer Dashboard</TabsTrigger>
                  <TabsTrigger value="seller">Seller Dashboard</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Welcome to Your Dashboard</h2>
                <p className="text-gray-600 max-w-lg mx-auto mb-6">
                  Select an option from the sidebar to manage your purchases, quotes, listings, or earnings.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                  <button
                    onClick={() => navigate("/dashboard/buyer")}
                    className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg mb-2">Buyer Dashboard</h3>
                    <p className="text-sm text-gray-500">
                      View your purchased templates and quote requests
                    </p>
                  </button>
                  <button
                    onClick={() => navigate("/dashboard/seller")}
                    className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg mb-2">Seller Dashboard</h3>
                    <p className="text-sm text-gray-500">
                      Manage your listings, earnings, and incoming quote requests
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
