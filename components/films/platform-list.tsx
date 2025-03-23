"use client"
import { platforms } from "../../constants";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";

interface PlatformListProps {
  onPlatformSelect: (platform: string | null) => void;
  selectedPlatform: string | null;
}

const PlatformList = ({ onPlatformSelect, selectedPlatform }: PlatformListProps) => {
  const handlePlatformClick = (platformName: string) => {
    if (selectedPlatform === platformName) {
      // Si la plateforme est déjà sélectionnée, on désélectionne
      onPlatformSelect(null);
    } else {
      // Sinon, on sélectionne la nouvelle plateforme
      onPlatformSelect(platformName);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center">
      {platforms.map((platform) => (
        <Button
          key={platform.name}
          onClick={() => handlePlatformClick(platform.name)}
          className={`px-4 py-2 rounded-full transition flex items-center gap-2 ${
            selectedPlatform === platform.name
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-[#1a2234] hover:bg-[#2a3244]"
          }`}
        >
          <Image
            src={platform.logo || "placeholder.svg"}
            alt={platform.name}
            height={70}
            width={70}
            className="object-contain"
          />
        </Button>
      ))}
    </div>
  );
};

export default PlatformList;
