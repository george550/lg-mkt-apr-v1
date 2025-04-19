import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/browse" className="text-base text-gray-300 hover:text-white">
                  Browse
                </Link>
              </li>
              <li>
                <Link href="/browse?type=categories" className="text-base text-gray-300 hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/browse?type=featured" className="text-base text-gray-300 hover:text-white">
                  Featured
                </Link>
              </li>
              <li>
                <Link href="/browse?type=pricing" className="text-base text-gray-300 hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Sellers
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/create-listing" className="text-base text-gray-300 hover:text-white">
                  Sell Your Code
                </Link>
              </li>
              <li>
                <Link href="/seller-guidelines" className="text-base text-gray-300 hover:text-white">
                  Seller Guidelines
                </Link>
              </li>
              <li>
                <Link href="/payouts" className="text-base text-gray-300 hover:text-white">
                  Payouts
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-base text-gray-300 hover:text-white">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-300 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-base text-gray-300 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-base text-gray-300 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-base text-gray-300 hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-300 hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/license" className="text-base text-gray-300 hover:text-white">
                  License
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-base text-gray-300 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} CodeCraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
