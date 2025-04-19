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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
            <span className="font-medium">{user?.username?.[0].toUpperCase() || "U"}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.username || "User"}</p>
            <p className="text-xs text-gray-500">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {navItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.label}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      isActive(item.href)
                        ? "bg-gray-100 text-primary font-medium"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-2">
          <li>
            <a
              href="/create-listing"
              className="flex items-center px-3 py-2 text-sm rounded-md text-white bg-primary hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              <span className="ml-3">Create New Listing</span>
            </a>
          </li>
          <li>
            <button
              onClick={() => logoutMutation.mutate()}
              className="flex items-center px-3 py-2 text-sm rounded-md w-full text-left text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-3">Log Out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
