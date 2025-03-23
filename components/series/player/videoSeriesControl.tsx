import React, { useRef, useState } from 'react';
import { 
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  ListVideo
} from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullScreen: boolean;
  showControls: boolean;
  buffered: TimeRanges | null;
  formatTime: (seconds: number) => string;
  togglePlay: () => void;
  handleSeek: (value: number) => void;
  handleVolumeChange: (value: number) => void;
  toggleMute: () => void;
  toggleFullScreen: () => void;
  onEpisodesToggle: () => void;
  onBack?: () => void;
  title?: string;
}

const VideoSerieControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  progress,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  isFullScreen,
  showControls,
  formatTime,
  togglePlay,
  handleSeek,
  handleVolumeChange,
  toggleMute,
  toggleFullScreen,
  onEpisodesToggle,
}) => {
  const [previewTime, setPreviewTime] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const getBufferedWidth = () => {
    if (!buffered || buffered.length === 0) return 0;
    
    // Find the buffered amount for the current playback position
    for (let i = 0; i < buffered.length; i++) {
      if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
        return (buffered.end(i) / duration) * 100;
      }
    }
    return 0;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const seekTime = position * duration;
    handleSeek(seekTime);
  };

  const handleProgressBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    setPreviewPosition(position * 100);
    setPreviewTime(position * duration);
    setShowPreview(true);
  };

  const handleProgressBarLeave = () => {
    setShowPreview(false);
  };

  // Determine which volume icon to show
  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  return (
    <div className="glass-panel px-4 py-3 rounded-t-xl transition-all duration-300">
      {/* Buffering and Progress Bar */}
      <div 
        className="progress-bar group"
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        onMouseMove={handleProgressBarHover}
        onMouseLeave={handleProgressBarLeave}
      >
        {/* Buffered progress */}
        <div 
          className="absolute h-full bg-white/20"
          style={{ width: `${getBufferedWidth()}%` }}
        ></div>
        
        {/* Playback progress */}
        <div 
          className="progress-filled"
          style={{ width: `${progress}%` }}
        ></div>
        
        {/* Time preview */}
        {showPreview && (
          <div 
            className="time-preview"
            style={{ left: `${previewPosition}%`, transform: `translateX(-50%) translateY(-100%)` }}
          >
            {formatTime(previewTime)}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center space-x-3">
          {/* Play/Pause button with 3D effect */}
          <button 
            className="control-button control-3d glass-effect"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" strokeWidth={1.5} />
            )}
          </button>
          
          {/* Skip backward with 3D effect */}
          <button 
            className="control-button control-3d glass-effect hidden sm:flex"
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
            aria-label="Rewind 10 seconds"
          >
            <SkipBack className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          {/* Skip forward with 3D effect */}
          <button 
            className="control-button control-3d glass-effect hidden sm:flex"
            onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
            aria-label="Forward 10 seconds"
          >
            <SkipForward className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          {/* Volume control with 3D effect */}
          <div className="volume-control group">
            <button 
              className="control-button control-3d glass-effect"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="volume-slider group-hover:w-20 group-hover:opacity-100 opacity-0 transition-all duration-300 ml-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                aria-label="Volume"
              />
            </div>
          </div>
          
          {/* Time display */}
          <div className="text-white text-xs sm:text-sm hidden sm:flex items-center">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Episodes button with 3D effect */}
          <button 
            className="control-button control-3d glass-effect hidden sm:flex"
            onClick={onEpisodesToggle}
            aria-label="Episodes"
          >
            <ListVideo className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          {/* Fullscreen button with 3D effect */}
          <button 
            className="control-button control-3d glass-effect"
            onClick={toggleFullScreen}
            aria-label={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullScreen ? (
              <Minimize className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Maximize className="w-5 h-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoSerieControls;