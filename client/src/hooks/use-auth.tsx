import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        
        return await res.json();
      } catch (err) {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // STEP 1: Trigger login event to immediately update UI
      window.dispatchEvent(new Event('user-login'));
      
      // STEP 2: Get user data from server
      const res = await apiRequest("POST", "/api/login", credentials);
      const userData = await res.json();
      
      // STEP 3: Immediately set user data in the query cache
      queryClient.setQueryData(["/api/user"], userData);
      
      return userData;
    },
    onSuccess: (user: User) => {
      // This runs after the user data is already in the cache
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      // STEP 1: Trigger login event to immediately update UI
      window.dispatchEvent(new Event('user-login'));
      
      // STEP 2: Create user on server
      const res = await apiRequest("POST", "/api/register", credentials);
      const userData = await res.json();
      
      // STEP 3: Immediately set user data in the query cache
      queryClient.setQueryData(["/api/user"], userData);
      
      return userData;
    },
    onSuccess: (user: User) => {
      // This runs after the user data is already in the cache
      toast({
        title: "Registration successful",
        description: `Welcome to CodeCraft, ${user.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Trigger a global event for immediate UI update before any API call
      window.dispatchEvent(new Event('user-logout'));
      
      // FIRST: Immediately clear user data from React state
      queryClient.setQueryData(["/api/user"], null);
      
      // SECOND: Then perform the actual logout request
      const response = await apiRequest("POST", "/api/logout");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Navigate to home page after logout completes
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
