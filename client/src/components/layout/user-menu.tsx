import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { LogOut, User, ShoppingBag, Package } from "lucide-react";

export function UserMenu() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  // Get user initials for avatar fallback
  const initials = user.username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar || undefined} alt={user.username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard/buyer">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Buyer Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/seller">
            <Package className="mr-2 h-4 w-4" />
            Seller Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}