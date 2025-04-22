import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  return (
    <Link href="/auth">
      <Button>Sign In</Button>
    </Link>
  );
}