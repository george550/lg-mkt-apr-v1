import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-muted/40 border-t border-border">
      <div className="container py-8 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/browse" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Browse
                </Link>
              </li>
              <li>
                <Link href="/browse?type=categories" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/browse?type=featured" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Featured
                </Link>
              </li>
              <li>
                <Link href="/browse?type=pricing" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              Sellers
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/create-listing" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Sell Your Code
                </Link>
              </li>
              <li>
                <Link href="/seller-guidelines" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Seller Guidelines
                </Link>
              </li>
              <li>
                <Link href="/payouts" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Payouts
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/license" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  License
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} CodeCraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
