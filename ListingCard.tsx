import { Link } from "wouter";
import type { Listing } from "@shared/schema";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="block p-4 border rounded hover:shadow"
    >
      <h3 className="text-lg font-semibold">{listing.title}</h3>
      <p className="text-sm line-clamp-2">{listing.desc}</p>
      {listing.price ? (
        <span className="mt-2 block font-bold">${listing.price}</span>
      ) : (
        <span className="mt-2 block italic">Free</span>
      )}
    </Link>
  );
}
