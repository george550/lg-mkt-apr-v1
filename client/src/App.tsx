import { Switch, Route } from "wouter";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BrowsePage from "@/pages/browse-page";
import ListingDetailPage from "@/pages/listing-detail-page";
import DashboardPage from "@/pages/dashboard";
import BuyerDashboard from "@/pages/dashboard/buyer";
import SellerDashboard from "@/pages/dashboard/seller";
import CreateListing from "@/pages/create-listing";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/browse" component={BrowsePage} />
          <Route path="/listing/:id" component={ListingDetailPage} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          <ProtectedRoute path="/dashboard/buyer" component={BuyerDashboard} />
          <ProtectedRoute path="/dashboard/seller" component={SellerDashboard} />
          <ProtectedRoute path="/create-listing" component={CreateListing} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
