import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <section className="py-12 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Ready to build faster?</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-primary-100 opacity-90">
          Browse our curated collection of high-quality templates and micro-apps, or start selling your own code today.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/browse">
            <Button className="bg-white text-primary hover:bg-gray-100">
              Browse Templates
            </Button>
          </Link>
          <Link href="/create-listing">
            <Button variant="outline" className="text-white border-white hover:bg-primary-800">
              Become a Seller
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
