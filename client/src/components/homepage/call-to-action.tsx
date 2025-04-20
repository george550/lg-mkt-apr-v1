import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CallToAction() {
  return (
    <section>
      <div className="container py-8">
        <Card>
          <CardContent className="text-center pt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                Ready to build faster?
              </h2>
              <p className="text-muted-foreground">
                Browse our curated collection of high-quality templates and micro-apps, or start selling your own code today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/browse">
                  <Button>
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/create-listing">
                  <Button variant="outline">
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
