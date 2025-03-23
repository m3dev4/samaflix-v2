"use client";

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import VideoSerieControls from './videoSeriesControl';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerSeriesProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  title?: string;
  onBack?: () => void;
}

export function VideoPlayerSeries({ src, poster, autoPlay = false, title, onBack }: VideoPlayerSeriesProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bigPlayAnimation, setBigPlayAnimation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartTimeRef = useRef(0);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mouseMoving, setMouseMoving] = useState(true);

  const {
    videoRef,
    isPlaying,
    isFullscreen,
    isMuted,
    volume,
    currentTime,
    duration,
    loading,
    buffered,
    isControlsVisible,
    formatTime,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    handleVolumeChange,
    handleSeek
  } = useVideoPlayer(videoUrl || '');

  useEffect(() => {
    const loadVideo = async () => {
      try {
        if (src.includes('uqload')) {
          const id = src.match(/embed-([a-zA-Z0-9]+)/)?.[1];
          if (!id) throw new Error('Invalid uqload URL');
          
          const response = await fetch(`/api/serie/uqload?id=${id}`);
          const data = await response.json();
          
          if (!response.ok || !data.videoUrl) {
            throw new Error(data.error || 'Conversion failed');
          }
          
          setVideoUrl(data.videoUrl);
        } else {
          setVideoUrl(src);
        }
      } catch (err) {
        console.error('Error loading video:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video');
      }
    };

    loadVideo();
  }, [src]);

  // Handle click on video to toggle play/pause
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget || e.target === videoRef.current) {
      togglePlay();
      // Show the big play/pause animation
      setBigPlayAnimation(true);
      setTimeout(() => {
        setBigPlayAnimation(false);
      }, 800);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          setBigPlayAnimation(true);
          setTimeout(() => {
            setBigPlayAnimation(false);
          }, 800);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          e.preventDefault();
          handleSeek(currentTime + 10);
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSeek(currentTime - 10);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, handleSeek, currentTime]);

  // Handle touch events for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartTimeRef.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTimeRef.current;
      // Only count short touches as taps
      if (touchDuration < 300) {
        togglePlay();
        setBigPlayAnimation(true);
        setTimeout(() => {
          setBigPlayAnimation(false);
        }, 800);
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [togglePlay]);

  // Hide mouse cursor when not moving
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => {
      setMouseMoving(true);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      
      mouseTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setMouseMoving(false);
        }
      }, 3000);
    };

    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-netflix-dark text-white p-6">
        <div className="max-w-md text-center">
          <h3 className="text-2xl font-bold mb-2">Error</h3>
          <p className="text-netflix-gray">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-netflix-red hover:bg-red-700 transition-colors rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "video-player-container",
        isControlsVisible || !isPlaying || !mouseMoving ? "cursor-default" : "cursor-none"
      )}
      onClick={handleContainerClick}
    >
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
          autoPlay={autoPlay}
          poster={poster}
          preload="auto"
        />
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
          <div className="neo-loader"></div>
        </div>
      )}
      
      {/* Big play/pause animation */}
      {bigPlayAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className={cn(
            "w-24 h-24 flex items-center justify-center rounded-full glass-effect",
            "animate-scale-in"
          )}>
            {isPlaying ? (
              <Pause size={40} className="text-white" strokeWidth={1.5} />
            ) : (
              <Play size={40} className="text-white ml-2" strokeWidth={1.5} />
            )}
          </div>
        </div>
      )}
      
      {/* Overlay gradient for better control visibility */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 transition-opacity duration-300",
          isControlsVisible || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Video Title */}
      {title && (
        <div 
          className={cn(
            "absolute top-0 left-0 p-4 transition-opacity duration-300",
            isControlsVisible || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          <h2 className="text-white text-lg md:text-2xl font-medium drop-shadow-md">{title}</h2>
        </div>
      )}
      
      {/* Back button */}
      {onBack && (
        <button 
          onClick={onBack}
          className={cn(
            "absolute top-4 left-4 p-2 rounded-full glass-effect transition-opacity duration-300",
            isControlsVisible || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      
      <div 
        className={cn(
          "video-control-panel",
          isControlsVisible || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        <VideoSerieControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          isFullScreen={isFullscreen}
          volume={volume}
          currentTime={currentTime}
          buffered={buffered}
          duration={duration}
          progress={(currentTime / duration) * 100}
          showControls={isControlsVisible}
          formatTime={formatTime}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          toggleFullScreen={toggleFullscreen}
          handleVolumeChange={handleVolumeChange}
          handleSeek={handleSeek}
          onEpisodesToggle={() => {}}
          onBack={onBack}
          title={title}
        />
      </div>
    </div>
  );
}