import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Maximize, Volume2, VolumeX } from "lucide-react";

interface VideoControlsProps {
  isVisible: boolean;
  currentTime: number;
  duration: number;
  bufferedPercentage: number;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isSettingsOpen: boolean;
  progressBarRef: React.RefObject<HTMLDivElement>;
  onProgressBarClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onFullscreenToggle: () => void;
  onSettingsToggle: () => void;
  formatTime: (seconds: number) => string;
  setIsDragging: (isDragging: boolean) => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isVisible,
  currentTime,
  duration,
  bufferedPercentage,
  isPlaying,
  isMuted,
  volume,
  isSettingsOpen,
  progressBarRef,
  onProgressBarClick,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onSkipBackward,
  onSkipForward,
  onFullscreenToggle,
  onSettingsToggle,
  formatTime,
  setIsDragging,
}) => {
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [progressTooltip, setProgressTooltip] = useState({
    visible: false,
    time: 0,
    position: 0,
  });

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const time = pos * duration;

      setProgressTooltip({
        visible: true,
        time: time,
        position: e.clientX - rect.left,
      });
    }
  };

  const handleProgressMouseLeave = () => {
    setProgressTooltip({ visible: false, time: 0, position: 0 });
  };

  const handleProgressMouseDown = () => {
    setIsDragging(true);
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const pos = (touch.clientX - rect.left) / rect.width;
      const newTime = Math.max(0, Math.min(pos * duration, duration));
      onProgressBarClick({ clientX: touch.clientX } as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Barre de contrôle mobile */}
          <div className="flex items-center justify-between px-4 py-2 md:hidden">
            <button
              onClick={onPlayPause}
              className="p-2 text-white hover:text-player-accent transition-colors"
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 4.5L19 12L6 19.5V4.5Z" fill="currentColor" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={onMuteToggle}
                className="p-2 text-white hover:text-player-accent transition-colors"
              >
                {isMuted ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>

              <button
                onClick={onFullscreenToggle}
                className="p-2 text-white hover:text-player-accent transition-colors"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div 
            className="w-full h-4 bg-transparent relative cursor-pointer touch-none"
            onClick={onProgressBarClick}
            onMouseMove={handleProgressMouseMove}
            onMouseLeave={handleProgressMouseLeave}
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
            onTouchStart={handleProgressMouseDown}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleProgressMouseUp}
            ref={progressBarRef}
          >
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1">
              <div className="absolute inset-0 bg-white/20" />
              <div
                className="absolute left-0 top-0 bottom-0 bg-white/30"
                style={{ width: `${bufferedPercentage}%` }}
              />
              <div
                className="absolute left-0 top-0 bottom-0 bg-player-accent"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-player-accent rounded-full" />
              </div>
            </div>
          </div>

          {/* Contrôles desktop existants */}
          <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pb-6 pt-2 px-6 hidden md:block">
            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center space-x-4">
                {/* Play/Pause button */}
                <motion.button
                  className="video-control-icon"
                  onClick={onPlayPause}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? (
                    <motion.svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      <rect
                        x="6"
                        y="4"
                        width="4"
                        height="16"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="14"
                        y="4"
                        width="4"
                        height="16"
                        rx="1"
                        fill="currentColor"
                      />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      initial={{ scale: 0.8, x: 1 }}
                      animate={{ scale: 1, x: 0 }}
                    >
                      <path d="M6 4.5L19 12L6 19.5V4.5Z" fill="currentColor" />
                    </motion.svg>
                  )}
                </motion.button>

                {/* Skip backward button */}
                <motion.button
                  className="video-control-icon"
                  onClick={onSkipBackward}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.5 8.5L7 12L12.5 15.5V8.5Z"
                      fill="currentColor"
                    />
                    <path
                      d="M18.5 8.5L13 12L18.5 15.5V8.5Z"
                      fill="currentColor"
                    />
                    <rect
                      x="4.5"
                      y="7"
                      width="1.5"
                      height="10"
                      rx="0.75"
                      fill="currentColor"
                    />
                    <text
                      x="11"
                      y="18"
                      fill="currentColor"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      10
                    </text>
                  </motion.svg>
                </motion.button>

                {/* Skip forward button */}
                <motion.button
                  className="video-control-icon"
                  onClick={onSkipForward}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.5 8.5L17 12L11.5 15.5V8.5Z"
                      fill="currentColor"
                    />
                    <path
                      d="M5.5 8.5L11 12L5.5 15.5V8.5Z"
                      fill="currentColor"
                    />
                    <rect
                      x="18"
                      y="7"
                      width="1.5"
                      height="10"
                      rx="0.75"
                      fill="currentColor"
                    />
                    <text
                      x="13"
                      y="18"
                      fill="currentColor"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      10
                    </text>
                  </motion.svg>
                </motion.button>

                {/* Volume control */}
                <div
                  className="relative flex items-center"
                  onMouseEnter={() => setIsVolumeHovered(true)}
                  onMouseLeave={() => setIsVolumeHovered(false)}
                >
                  <motion.button
                    className="video-control-icon"
                    onClick={onMuteToggle}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isVolumeHovered && (
                      <motion.div
                        className="ml-2"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={volume}
                          onChange={(e) =>
                            onVolumeChange(Number(e.target.value))
                          }
                          className="volume-slider"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Time display */}
                <div className="text-sm text-white font-medium">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1 text-white/50">/</span>
                  <span className="text-white/70">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center space-x-4">
                {/* Settings button */}
                <motion.button
                  className={`video-control-icon ${isSettingsOpen ? "text-player-accent" : "text-white"}`}
                  onClick={onSettingsToggle}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={isSettingsOpen ? { rotate: 90 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Settings size={20} />
                </motion.button>

                {/* Fullscreen button */}
                <motion.button
                  className="video-control-icon"
                  onClick={onFullscreenToggle}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Maximize size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
