"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeColorToggle } from "./themes/theme-color-toggle";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Menu, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? " backdrop-blur-md shadow-md"
          : " backdrop-blur-sm shadow-none",
      )}
    >
      <div className="container mx-auto">
        <nav className="flex items-center justify-between py-4 ">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold hover:text-white transition-colors"
            >
              Samaflix
            </Link>

            <ul className="hidden md:flex items-center space-x-6">
              <li className="flex items-center gap-6">
                <Link
                  href="/pages/films"
                  className="text-lg font-medium hover:text-white transition-colors"
                >
                  Films
                </Link>
                <Link
                  href="/pages/series"
                  className="text-lg font-medium hover:text-white transition-colors"
                >
                  Séries
                </Link>
                <Link
                  href="/pages/favorites"
                  className="text-lg font-medium hover:text-white transition-colors"
                >
                  Ma Liste
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div
              className={cn(
                "relative transition-all duration-300 overflow-hidden",
                isOpen ? "w-full md:w-64" : "w-0",
              )}
            >
              <Input
                placeholder="Rechercher un film ou une série"
                className="pr-8 bg-gray-900/50 border-gray-700 focus-visible:ring-rose-500"
              />{" "}
              {isOpen && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden text-gray-300 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background border-gray-800 text-white max-w-52"
            >
              <div className="flex flex-col gap-6 my-6">
                <div className="flex flex-col items-center gap-3 pb-6 border-b border-gray-800">
                  <Link
                    href="/pages/films"
                    className="text-lg font-medium py-2 hover:text-white transition-colors"
                  >
                    Films
                  </Link>
                  <Link
                    href="/pages/series"
                    className="text-lg font-medium py-2 hover:text-white transition-colors"
                  >
                    Séries
                  </Link>
                  <Link
                    href="/pages/favorites"
                    className="text-lg font-medium py-2 hover:text-white transition-colors"
                  >
                    Favorites
                  </Link>
                </div>
                <div className="flex items-center justify-center">
                  <div className="absolute bottom-2">
                    <h1 className="text-sm text-muted-foreground text-center">
                      © 2025 Samaflix
                    </h1>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
