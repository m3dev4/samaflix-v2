import React from "react";
import { Button } from "./ui/button";
import { AlignJustify, Grid3X3 } from "lucide-react";

interface ViewToggleProps {
  currentView: "grid" | "row";
  onViewChange: (view: "grid" | "row") => void;
}

const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentView === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className="w-8 h-8 p-0 backdrop-blur-md"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === "row" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("row")}
        className="w-8 h-8 p-0 backdrop-blur-md"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewToggle;
