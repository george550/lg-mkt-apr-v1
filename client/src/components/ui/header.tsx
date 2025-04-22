import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { LoginButton } from "@/components/layout/login-button";
import { Menu, X, User, LogOut, Settings, ShoppingCart, Code, Sun, Moon, Laptop } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, isLoading, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    if (logoutMutation) {
      logoutMutation.mutate();
    }
  };

  const isActivePath = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="ml-2 text-xl font-bold">CodeCraft</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className="relative group inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium"
              >
                <span className={`${isActivePath('/') ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>Home</span>
                <span className={`absolute left-[10%] bottom-[-5px] h-[2px] w-[80%] ${isActivePath('/') ? 'bg-primary' : 'bg-transparent group-hover:bg-primary'} transition-all duration-200 ease-out`}></span>
              </Link>
              <Link 
                href="/browse" 
                className="relative group inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium"
              >
                <span className={`${isActivePath('/browse') ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>Browse</span>
                <span className={`absolute left-[10%] bottom-[-5px] h-[2px] w-[80%] ${isActivePath('/browse') ? 'bg-primary' : 'bg-transparent group-hover:bg-primary'} transition-all duration-200 ease-out`}></span>
              </Link>
              <Link 
                href="/browse?type=collections" 
                className="relative group inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium"
              >
                <span className={`${isActivePath('/browse?type=collections') ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>Collections</span>
                <span className={`absolute left-[10%] bottom-[-2px] h-[2px] w-[80%] ${isActivePath('/browse?type=collections') ? 'bg-primary' : 'bg-transparent group-hover:bg-primary'} transition-all duration-200 ease-out`}></span>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <>
                <Link href="/create-listing">
                  <Button>Sell Your Code</Button>
                </Link>
                <UserMenu user={user} />
              </>
            ) : (
              <LoginButton />
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-border">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className={`${isActivePath('/') ? 'bg-accent border-primary text-accent-foreground' : 'border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/browse" 
              className={`${isActivePath('/browse') ? 'bg-accent border-primary text-accent-foreground' : 'border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Browse
            </Link>
            <Link 
              href="/browse?type=collections" 
              className={`${isActivePath('/browse?type=collections') ? 'bg-accent border-primary text-accent-foreground' : 'border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Collections
            </Link>
          </div>
          
          <div className="border-t border-border py-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 pb-3 border-t border-border">
            {user ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="h-10 w-10 rounded-full" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{user.username}</div>
                    <div className="text-sm font-medium text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/dashboard/buyer" 
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Purchases
                  </Link>
                  <Link 
                    href="/dashboard/seller" 
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Listings
                  </Link>
                  <Link 
                    href="/create-listing" 
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sell Your Code
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-1">
                <Link 
                  href="/auth" 
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
