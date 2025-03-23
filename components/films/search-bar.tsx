"use client"

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.length > 2) {
      await onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
      <Input
        type="search"
        placeholder="Search movies, TV shows..."
        className="w-full sticky top-0 bottom-0 bg-[#1a2234] text-white pl-10 pr-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    </form>
  );
}