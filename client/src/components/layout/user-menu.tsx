import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { LogOut, User, ShoppingBag, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as UserType } from "@shared/schema";

interface UserMenuProps {
  user: UserType;
}

export function UserMenu({ user }: UserMenuProps) {
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Get user initials for avatar fallback
  const initials = user.username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    // Simply call the logoutMutation as we've updated it to clear state first
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
        <DropdownMenuItem onClick={handleLogoutClick}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  );
}