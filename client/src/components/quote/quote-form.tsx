import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

// Define the form schema
const quoteFormSchema = z.object({
  requirements: z.string()
    .min(10, "Please provide more details about your requirements")
    .max(1000, "Requirements should be less than 1000 characters"),
  budget: z.string()
    .regex(/^\d+$/, "Budget must be a number")
    .optional()
    .transform(val => val ? parseInt(val) * 100 : undefined), // Convert to cents
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  listingId: number;
  sellerId: number;
  onSuccess: () => void;
}

export default function QuoteForm({ listingId, sellerId, onSuccess }: QuoteFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      requirements: "",
      budget: "",
    },
  });

  const submitQuoteRequest = async (data: QuoteFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a quote request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/quotes", {
        listingId,
        sellerId,
        requirements: data.requirements,
        budget: data.budget,
      });
      
      // Invalidate quotes cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/buyer'] });
      
      toast({
        title: "Quote request submitted",
        description: "Your request has been sent to the seller. You'll be notified when they respond.",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "There was an error submitting your request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitQuoteRequest)} className="space-y-4">
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Requirements</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Describe the custom features or modifications you need..."
                  className="min-h-[120px]"
                />
              </FormControl>
              <FormDescription>
                Be as specific as possible about what you need.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0"
                    placeholder="100" 
                    className="pl-7"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Provide an estimated budget in USD (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}
