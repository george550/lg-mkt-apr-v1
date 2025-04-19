import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { insertListingSchema } from "@shared/schema";
import { Helmet } from "react-helmet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Loader2, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Extend the listing schema with additional fields for the form
const createListingSchema = insertListingSchema.omit({ sellerId: true }).extend({
  price: z.coerce.number()
    .min(1, "Price must be at least $0.01")
    .max(100000, "Price cannot exceed $1,000"), // Limit price to $1,000
  tagInput: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
});

type CreateListingValues = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<CreateListingValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: undefined,
      demoUrl: "",
      tagInput: "",
      tags: [],
      screenshots: [],
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddScreenshotUrl = () => {
    if (screenshotUrls.length < 5) {
      setScreenshotUrls([...screenshotUrls, ""]);
    }
  };

  const handleScreenshotUrlChange = (index: number, url: string) => {
    const newUrls = [...screenshotUrls];
    newUrls[index] = url;
    setScreenshotUrls(newUrls);
  };

  const handleRemoveScreenshotUrl = (index: number) => {
    setScreenshotUrls(screenshotUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateListingValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Combine form data with tags and screenshots
    const listingData = {
      ...data,
      tags,
      screenshots: screenshotUrls.filter(url => url.trim() !== ""),
      price: Math.round(data.price * 100), // Convert to cents
      sellerId: user.id,
    };

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/listings", listingData);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/seller/listings"] });
      
      toast({
        title: "Listing created",
        description: "Your listing has been successfully created and is now live!",
      });
      
      // Redirect to seller dashboard
      navigate("/dashboard/seller");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create listing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white shadow sm:rounded-lg max-w-2xl mx-auto my-12 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>You need to be signed in to create a listing.</p>
            </div>
            <div className="mt-4">
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Listing - CodeCraft Market</title>
        <meta name="description" content="Create a new listing to sell your templates and code" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
            <p className="mt-2 text-gray-600">
              Share your templates and code with developers around the world
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>
                Provide details about the template or code you're selling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., React Dashboard Template" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, concise title that describes your template
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your template, its features, and benefits..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of your template, including features, technologies used, and any special selling points
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="29.99"
                                className="pl-7"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Set a fair price for your work (USD)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoriesLoading ? (
                                <div className="p-2 text-center">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                  <span className="text-sm text-gray-500">Loading...</span>
                                </div>
                              ) : (
                                categories?.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the most relevant category for your template
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="demoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demo URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://your-demo-url.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to a live demo of your template (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <Badge key={tag} className="bg-primary-100 text-primary-800">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-primary-600 hover:text-primary-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag (e.g., React, Dashboard, UI)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    <FormDescription>
                      Add technologies, features, or keywords to help buyers find your template
                    </FormDescription>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Screenshots</FormLabel>
                    <div className="space-y-3">
                      {screenshotUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Enter screenshot URL"
                            value={url}
                            onChange={(e) => handleScreenshotUrlChange(index, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleRemoveScreenshotUrl(index)}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {screenshotUrls.length < 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddScreenshotUrl}
                          className="w-full border-dashed"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add Screenshot URL
                        </Button>
                      )}
                    </div>
                    <FormDescription>
                      Add up to 5 screenshot URLs to showcase your template
                    </FormDescription>
                  </FormItem>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Listing"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Listing Creation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to create this listing? Once published, it will be visible to all users on the marketplace.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={form.handleSubmit(onSubmit)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Creating..." : "Confirm"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 bg-gray-50">
              <div className="text-sm text-gray-500">
                By creating a listing, you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/seller-guidelines" className="text-primary hover:underline">
                  Seller Guidelines
                </a>
                .
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
