import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CallToAction() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to build faster?
            </h2>
            <p className="mt-4 text-lg leading-6 text-muted-foreground">
              Browse our curated collection of high-quality templates and micro-apps, or start selling your own code today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/browse">
                <Button variant="default">
                  Browse Templates
                </Button>
              </Link>
              <Link href="/create-listing">
                <Button variant="outline">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
