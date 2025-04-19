import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import PaymentForm from "./payment-form";
import { Listing } from "@shared/schema";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
  onSuccess: () => void;
}

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function CheckoutDialog({
  open,
  onOpenChange,
  listing,
  onSuccess,
}: CheckoutDialogProps) {
  const handleSuccess = () => {
    // Close modal after successful payment
    onOpenChange(false);
    // Call the parent's onSuccess callback
    onSuccess();
  };

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Your Purchase</AlertDialogTitle>
          <AlertDialogDescription>
            You're purchasing <strong>{listing.title}</strong> for{" "}
            <strong>${(listing.price / 100).toFixed(2)}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Elements stripe={stripePromise}>
          <PaymentForm
            listingId={listing.id}
            onSuccess={handleSuccess}
            price={listing.price}
          />
        </Elements>
      </AlertDialogContent>
    </AlertDialog>
  );
}