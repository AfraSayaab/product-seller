// components/hero/TopNav.tsx
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
type Props = {
  onOpenMenu: () => void;
};

export const Header = ({ onOpenMenu }: Props) => {
  const router = useRouter();
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open main menu"
          onClick={onOpenMenu}
          className="rounded-full border border-white/40 bg-black/20 p-2 backdrop-blur-md transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/80"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="select-none text-xl font-semibold uppercase tracking-[0.3em]">
          <span>Dazzle</span>
          <span className="font-light">&amp;Bloom</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => {
            router.push("/plan")
          }}
          variant="outline"
          className="border-white bg-black/30 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white hover:text-black sm:text-sm"
        >
          Submit Listing
        </Button>

        <button
          type="button"
          className="flex items-center gap-2 text-xs font-medium tracking-wide sm:text-sm"
        >
          <User className="h-4 w-4" />
          <Link href="/login">Login</Link>
          <span className="opacity-60">/</span>
          <Link href="/register">Register</Link>
        </button>
      </div>
    </header>
  );
};
