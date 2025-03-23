import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onQualityChange: (quality: string) => void;
  onSpeedChange: (speed: string) => void;
  currentQuality: string;
  currentSpeed: string;
}

export function SettingsMenu({
  isOpen,
  onClose,
  onQualityChange,
  onSpeedChange,
  currentQuality,
  currentSpeed,
}: SettingsMenuProps) {
  const qualities = ["1080p", "720p", "480p", "360p"];
  const speeds = ["0.25x", "0.5x", "0.75x", "Normal", "1.25x", "1.5x", "2x"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute bottom-24 right-8 z-50 w-64 bg-black/80 backdrop-blur-lg rounded-xl overflow-hidden 
                     border border-white/10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", duration: 0.4 }}
        >
          <div className="p-1">
            {/* Qualité */}
            <div className="mb-2">
              <div className="px-3 py-2 text-sm font-semibold text-white/90 border-b border-white/5">
                Qualité
              </div>
              <div className="py-1">
                {qualities.map((quality) => (
                  <motion.button
                    key={quality}
                    onClick={() => onQualityChange(quality)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg 
                              transition-colors text-sm font-medium"
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    style={{
                      color:
                        currentQuality === quality
                          ? "#3AACF7"
                          : "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    <span>{quality}</span>
                    {currentQuality === quality && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.3 }}
                      >
                        <Check size={16} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Vitesse de lecture */}
            <div>
              <div className="px-3 py-2 text-sm font-semibold text-white/90 border-b border-white/5">
                Vitesse de lecture
              </div>
              <div className="py-1">
                {speeds.map((speed) => (
                  <motion.button
                    key={speed}
                    onClick={() => onSpeedChange(speed)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg 
                             transition-colors text-sm font-medium"
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    style={{
                      color:
                        currentSpeed === speed
                          ? "#3AACF7"
                          : "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    <span>{speed}</span>
                    {currentSpeed === speed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.3 }}
                      >
                        <Check size={16} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
