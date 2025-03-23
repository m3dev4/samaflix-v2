"use client";
import React from "react";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import Link from "next/link";

export function HoverBorderGradientDemo() {
  return (
    <div className="m-40 flex justify-center text-center">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
      >
        <Link href="/pages/discover" className="px-4 py-1">
          <span className="font-bold">Discover</span>
        </Link>
      </HoverBorderGradient>
    </div>
  );
}
