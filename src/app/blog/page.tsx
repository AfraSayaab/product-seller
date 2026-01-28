import { HeaderLayout } from "@/components/Header/header";
import BlogList from "./components/BlogList";
import Footer from "@/components/Footer";

export default function BlogPage() {
    
  return (
    <>
    <HeaderLayout />

    <main className="min-h-screen bg-background">
    <BlogList currentPage={1} />
    </main>

    <Footer />
  </>
  );
}
