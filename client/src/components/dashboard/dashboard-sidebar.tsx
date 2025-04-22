import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  ShoppingCart,
  MessageSquare,
  Layers,
  DollarSign,
  User,
  Settings,
  Plus,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function DashboardSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    {
      label: "Buyer Dashboard",
      items: [
        {
          icon: <ShoppingCart className="h-4 w-4" />,
          text: "My Purchases",
          href: "/dashboard/buyer"
        },
        {
          icon: <MessageSquare className="h-4 w-4" />,
          text: "My Quote Requests",
          href: "/dashboard/buyer?tab=quotes"
        }
      ]
    },
    {
      label: "Seller Dashboard",
      items: [
        {
          icon: <Layers className="h-4 w-4" />,
          text: "My Listings",
          href: "/dashboard/seller"
        },
        {
          icon: <DollarSign className="h-4 w-4" />,
          text: "Earnings",
          href: "/dashboard/seller?tab=earnings"
        },
        {
          icon: <MessageSquare className="h-4 w-4" />,
          text: "Quote Requests",
          href: "/dashboard/seller?tab=quotes"
        }
      ]
    },
    {
      label: "Account",
      items: [
        {
          icon: <User className="h-4 w-4" />,
          text: "Profile",
          href: "/dashboard/profile"
        },
        {
          icon: <Settings className="h-4 w-4" />,
          text: "Settings",
          href: "/dashboard/settings"
        }
      ]
    }
  ];

  return (
    <Card className="overflow-hidden">
      {/* User info */}
      <CardHeader className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
            <AvatarFallback>
              {user?.username?.[0].toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{user?.username || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
          </div>
        </div>
      </CardHeader>

      {/* Navigation */}
      <CardContent className="p-4">
        {navItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section.label}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md",
                      isActive(item.href)
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 border-t flex flex-col items-stretch">
        <Button 
          asChild
          className="mb-2 flex items-center justify-start"
        >
          <a href="/create-listing">
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </a>
        </Button>
        <Button
          variant="outline"
          onClick={() => logoutMutation.mutate()}
          className="flex items-center justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </CardFooter>
    </Card>
  );
}
