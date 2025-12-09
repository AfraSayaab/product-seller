import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import { X, ChevronDown, ChevronUp, } from "lucide-react"; // Import icons for open/close
import { Loader } from "../ui/loader"; // Assuming you have a Loader component
import Link from "next/link"; // For Next.js routing

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const SideDrawer = ({ isOpen, onClose }: Props) => {
  // States for categories, subcategories, loading, and open/close states for subcategories
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]); // Categories data state
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set()); // To track open categories

  // Fetch categories and subcategories data using axios
  useEffect(() => {
    if (isOpen) {
      setLoading(true); // Start the loader
      axios
        .get("/api/admin/categories/tree") // Fetch categories data
        .then((response) => {
          setCategories(response.data.data); // Set categories data to state
          setLoading(false); // Stop the loader
        })
        .catch((error) => {
          console.error("Error fetching categories", error);
          setLoading(false); // Stop the loader if there is an error
        });
    }
  }, [isOpen]); // Re-fetch categories whenever the drawer opens

  // Handle category click to toggle open/close subcategories
  const handleCategoryClick = (categoryId: number) => {
    setOpenCategories((prev) => {
      const newOpenCategories = new Set(prev);
      if (newOpenCategories.has(categoryId)) {
        newOpenCategories.delete(categoryId); // Close the category if already open
      } else {
        newOpenCategories.add(categoryId); // Open the category if it's closed
      }
      return newOpenCategories;
    });
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col bg-white px-6 py-6 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
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
          className="rounded-full text-black border hover:border-black p-2 bg-white border-white hover:bg-black hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-6 text-base font-medium text-gray-800">
        {loading ? (
          // Loader component to show during API call
          <div className="flex justify-center items-center py-4">
            <Loader />
          </div>
        ) : (
          // Display categories and subcategories
          categories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-left transition hover:text-emerald-600 flex items-center"
                  onClick={() => handleCategoryClick(category.id)} // Handle category click
                >{category.children.length > 0 &&(<>

                  {openCategories.has(category.id) ? (
                    <ChevronUp className="mr-2" />
                  ) : (
                    <ChevronDown className="mr-2" />
                  )}
                </>)}
                  {/* Link to the category page */}
                  <Link href={`/categories/${category.id}`} className="mr-2">
                    {category.name}
                  </Link>
                </button>
              </div>

              {/* Render Subcategories */}
              {category.children && category.children.length > 0 && openCategories.has(category.id) && (
                <ul className="ml-4 mt-2 space-y-1">
                  {category.children.map((subCategory: any) => (
                    <li key={subCategory.id}>
                      <Link
                        href={`/categories/${category.id}/subcategories/${subCategory.id}`} // Link to subcategory page
                        className="w-full text-left pl-4 py-1 text-sm transition hover:text-emerald-600"
                      >
                        {subCategory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </nav>

      <div className="mt-auto border-t pt-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Dazzle &amp; Bloom
      </div>
    </aside>
  );
};
