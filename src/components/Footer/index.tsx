import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 font-serif">

      {/* SCROLLING TEXT */}
      <div className="overflow-hidden border-y border-white/10 py-3">
        <div className="text-center whitespace-nowrap text-sm tracking-widest text-pink-500 animate-marquee">
          ✨ Buy • Sell • Re-Love Wedding Wear — Dazzle & Bloom ✨
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* 4 COLUMNS WITH PINK LINES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          
          {/* COLUMN 1 — ABOUT */}
          <div className="space-y-6 pr-6 lg:pr-10 border-r border-pink-500/30">
            <h3 className="text-xl font-bold text-pink-500 tracking-wide">
              About Dazzle & Bloom
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Unwanted Asian clothes taking up too much closet space? Update your
              wardrobe by selling your clothes and give them a new home! Buying
              and selling pre-loved outfits couldn’t get more easier with Dazzle
              & Bloom. Join us today and dazzle & bloom your wardrobe.
            </p>
          </div>

          {/* COLUMN 2 — INFO */}
          <div className="space-y-4 px-6 border-r border-pink-500/30">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-pink-500">
              Info
            </h4>
            <ul className="space-y-3 text-sm">
              {["Contact", "About Us", "Privacy Policy", "Blog", "FAQ"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="transition hover:text-pink-500">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* COLUMN 3 — LINKS */}
          <div className="space-y-4 px-6 border-r border-pink-500/30">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-pink-500">
              Links
            </h4>
            <ul className="space-y-3 text-sm">
              {["My Dashboard", "Submit Listing", "Login", "Register"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="transition hover:text-pink-500">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* COLUMN 4 — CATEGORIES + SOCIAL */}
          <div className="space-y-6 pl-6">
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-pink-500">
                Top Categories
              </h4>
              <ul className="space-y-3 text-sm">
                {["Men", "Women"].map((item) => (
                  <li key={item}>
                    <a href="#" className="transition hover:text-pink-500">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* EMAIL */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Mail className="h-4 w-4 text-pink-500" />
              <a
                href="mailto:info@dazzleandbloom.com"
                className="hover:text-pink-500 transition"
              >
                info@dazzleandbloom.com
              </a>
            </div>

            {/* SOCIAL ICONS */}
            <div className="flex gap-4 pt-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full
                  bg-white/5 border border-white/10
                  transition-all duration-300
                  hover:bg-pink-500 hover:scale-110"
                >
                  <Icon className="h-5 w-5 text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-16 border-t border-white/10 pt-6 text-center text-gray-500 tracking-wide text-xs">
          © 2026 DazzleandBloom. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
