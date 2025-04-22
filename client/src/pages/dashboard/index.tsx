import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - CodeCraft Market</title>
        <meta name="description" content="Manage your purchases, quotes, listings, and earnings" />
      </Helmet>

      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your purchases, quotes, listings, and earnings
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <DashboardSidebar />
            </div>

            {/* Main Content */}
            <Card className="flex-1">
              <CardContent className="p-6">
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
                  <h2 className="text-xl font-semibold text-foreground mb-3">Welcome to Your Dashboard</h2>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                    Select an option from the sidebar to manage your purchases, quotes, listings, or earnings.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="p-6">
                        <Button 
                          onClick={() => navigate("/dashboard/buyer")} 
                          variant="ghost"
                          className="w-full h-full p-0 hover:bg-transparent"
                        >
                          <div className="text-left w-full">
                            <h3 className="font-semibold text-lg mb-2 text-foreground">Buyer Dashboard</h3>
                            <p className="text-sm text-muted-foreground">
                              View your purchased templates and quote requests
                            </p>
                          </div>
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="p-6">
                        <Button 
                          onClick={() => navigate("/dashboard/seller")} 
                          variant="ghost"
                          className="w-full h-full p-0 hover:bg-transparent"
                        >
                          <div className="text-left w-full">
                            <h3 className="font-semibold text-lg mb-2 text-foreground">Seller Dashboard</h3>
                            <p className="text-sm text-muted-foreground">
                              Manage your listings, earnings, and incoming quote requests
                            </p>
                          </div>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
