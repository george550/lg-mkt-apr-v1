import { useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { 
  Lock,
  Loader2
} from "lucide-react";

interface PaymentFormProps {
  listingId: number;
  onSuccess: () => void;
  price: number;
}

export default function PaymentForm({ listingId, onSuccess, price }: PaymentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Create a payment intent as soon as the component loads
    const fetchPaymentIntent = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          listingId 
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initialize payment",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [listingId, user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard/buyer", // Redirect after payment
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } else {
        // The payment succeeded
        toast({
          title: "Payment successful!",
          description: "Your purchase has been completed. You can now download the template.",
        });
        
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !clientSecret) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
        <p className="text-sm text-gray-600 flex items-center">
          <Lock className="w-4 h-4 mr-2 text-gray-500" />
          Your payment information is encrypted and secure
        </p>
      </div>

      {clientSecret && (
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      )}

      <AlertDialogFooter className="pt-4">
        <AlertDialogCancel disabled={isLoading || !stripe}>Cancel</AlertDialogCancel>
        <Button 
          type="submit" 
          disabled={isLoading || !stripe || !elements || !clientSecret}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(price / 100).toFixed(2)}`
          )}
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
