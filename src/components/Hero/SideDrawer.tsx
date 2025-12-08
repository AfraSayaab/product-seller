// components/hero/SideDrawer.tsx
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const NAV_ITEMS = ["Men", "Women", "Accessories", "Kids", "About Us", "Contact"];

export const SideDrawer = ({ isOpen, onClose }: Props) => (
  <aside
    className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col bg-white px-6 py-6 shadow-2xl transition-transform duration-300 ease-out ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}
    aria-hidden={!isOpen}
  >
    <div className="mb-10 flex items-center justify-between">
      <div className="text-lg font-semibold uppercase tracking-[0.25em] text-gray-900">
        Dazzle<span className="font-light">&amp;Bloom</span>
      </div>
      <button
        type="button"
        aria-label="Close main menu"
        onClick={onClose}
        className="rounded-full border border-gray-200 p-2 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>

    <nav className="flex flex-1 flex-col gap-6 text-base font-medium text-gray-800">
      {NAV_ITEMS.map((item) => (
        <button
          key={item}
          type="button"
          className="text-left transition hover:text-emerald-600"
          // TODO: hook up to router when routes ready
        >
          {item}
        </button>
      ))}
    </nav>

    <div className="mt-auto border-t pt-6 text-sm text-gray-500">
      © {new Date().getFullYear()} Dazzle &amp; Bloom
    </div>
  </aside>
);
