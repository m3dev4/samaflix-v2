import React from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { HoverBorderGradientDemo } from "./hoverButton";

const HeroLayout = () => {
  return (
    <div className="flex items-start justify-center w-full  mt-auto py-8">
      <div className="flex flex-col items-center justify-center space-y-5 ">
        <h1 className="text-4xl font-bold">Welcome to Samaflix</h1>
        <p className="text-lg font-semibold text-muted-foreground">
          The best place to watch movies and series
        </p>
        <div className="flex items-center space-x-2 ">
          <Search className="relative left-11" />
          <Input
            className="w-[500px] p-3 rounded-full py-6 pl-10 outline-none border-2 hover:border-x-stone-700 hover:border-y-stone-700 focus:border-x-stone-700 focus:border-y-stone-700"
            placeholder="Que voulais vous voir ?"
          />
        </div>
        <HoverBorderGradientDemo />
      </div>
    </div>
  );
};

export default HeroLayout;
