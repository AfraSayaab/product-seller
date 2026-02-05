import React from "react";
import { HeaderLayout } from "@/components/Header/header";
import Footer from "@/components/Footer";
import ListingsGridPaginated from "@/components/card/listings-grid-paginated";

const listings: React.FC = () => (
  <div>
    <HeaderLayout />

    <main className="container mx-auto px-6 py-12 space-y-12 font-serif">
      <ListingsGridPaginated />
    </main>

    <Footer />
  </div>
);

export default listings;
