
import { useState } from "react";
import { Menu, X, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = { onOpenMenu: any };

export const Header = ({ onOpenMenu }: Props) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gray-300 shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4">
        {/* Left: Logo + Mobile Menu Button */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-full bg-black/20 hover:bg-black/30 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>

        {/* Logo */}
        <div className="select-none text-black text-xl sm:text-2xl font-semibold uppercase tracking-widest">
  <Link href="/">
    <span>DAZZLE</span>
    <span className="text-pink-500">&amp;</span>
    <span>BLOOM</span>
  </Link>
</div>
        
        </div>

        {/* Center: Nav Links (Desktop Only) */}
        <nav className="hidden lg:flex gap-8 font-medium text-gray-800 uppercase tracking-wide">
          <Link href="/marketplace" className="hover:text-pink-500 transition">
            MARKETPLACE
          </Link>
          <Link href="/spotlight" className="hover:text-pink-500 transition">
            SPOTLIGHT
          </Link>
          <Link href="/for-business" className="hover:text-pink-500 transition">
            FOR BUSINESS
          </Link>
        </nav>

        {/* Right: Buttons */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/ai-concierge")}
            className="hidden lg:inline-block bg-black text-white text-xs sm:text-sm font-semibold uppercase tracking-wide rounded-full px-4 py-2 hover:bg-pink-500 transition"
          >
            AI CONCIERGE
          </Button>

          <div className="flex items-center gap-2">
            {/* Login/Register */}
            <button className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-pink-500 transition">
              <User className="h-4 w-4" />
              <Link href="/login">Login</Link>
              <span className="opacity-60">/</span>
              <Link href="/register">Register</Link>
            </button>

            {/* Search icon on mobile */}
            <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition lg:hidden">
              <Search className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-125" : "max-h-0"
          }`}
      >
        <nav className="flex flex-col gap-4 px-6 py-6 bg-[#2a1e1a] border-t border-gray-300 rounded-b-xl">
          <Link
            href="/marketplace"
            className="text-white font-medium uppercase tracking-wide hover:text-pink-500 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            MARKETPLACE
          </Link>
          <Link
            href="/spotlight"
            className="text-white font-medium uppercase tracking-wide hover:text-pink-500 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            SPOTLIGHT
          </Link>
          <Link
            href="/for-business"
            className="text-white font-medium uppercase tracking-wide hover:text-pink-500 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            FOR BUSINESS
          </Link>

          {/* AI Concierge Button in Mobile */}
          <Button
            onClick={() => {
              router.push("/ai-concierge");
              setMobileMenuOpen(false);
            }}
            className="bg-pink-500 text-white font-semibold uppercase tracking-wide rounded-full px-4 py-2 mt-4 hover:bg-black transition"
          >
            AI CONCIERGE
          </Button>

          {/* Login/Register */}
          <div className="flex flex-col gap-2 mt-4">
            <Link
              href="/login"
              className="flex items-center gap-1 text-white font-medium hover:text-pink-500 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" /> Login / Register
            </Link>
          </div>
        </nav>
      </div>
    </header>

  );
};
