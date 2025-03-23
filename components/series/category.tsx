"use client";

import { seriesCategories } from "../../constants";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Category = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -200 : 200;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (category: string) => {
    // Find the section corresponding to the category
    const sectionId = category.toLowerCase().replace(/\s+/g, '-');
    const section = document.getElementById(sectionId);

    if (section) {
      // Scroll smoothly to the section
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex overflow-hidden gap-2 scrollbar-hide py-2"
      >
        {seriesCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="px-4 py-2 bg-[#1a2234] rounded-full whitespace-nowrap hover:bg-[#2a3244] transition"
          >
            {category}
          </button>
        ))}
      </div>
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#0f172a] to-transparent px-4 py-2"
      >
        <ChevronLeft className="bg-black rounded-full" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-[#0f172a] to-transparent px-4 py-2"
      >
        <ChevronRight className="bg-black rounded-full" />
      </button>
    </div>
  );
};

export default Category;
