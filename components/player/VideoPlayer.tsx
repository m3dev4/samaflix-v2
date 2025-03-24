"use client";

import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ChevronLeft, Loader2, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { VideoInfo } from "./VideoInfo";
import { SettingsMenu } from "../settingsVideo";
import { VideoControls } from "./videoControl";

interface VideoPlayerProps {
  embedUrl: string;
  title: string;
  description?: string;
}

interface WatchProgress {
  episodeId: number;
  currentTime: number;
  duration: number;
  seasonNumber: number;
  episodeNumber: number;
  lastWatched: string;
}

export function VideoPlayer({
  embedUrl,
  title,
  description,
}: VideoPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('480p');
  const [showControls, setShowControls] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState('Normal');
  const [retryCount, setRetryCount] = useState(0);
  const [bufferedPercentage, setBufferedPercentage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const maxRetries = 3;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMouseMoveRef = useRef<number>(0);
  const progressSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extraire l'ID de la série et les informations de l'épisode de l'URL
  const seriesId = searchParams.get('seriesId');
  const seasonNumber = parseInt(title.match(/S(\d+)/)?.[1] || '1');
  const episodeNumber = parseInt(title.match(/E(\d+)/)?.[1] || '1');
  const startTime = parseFloat(searchParams.get('startTime') || '0');

  const saveProgress = () => {
    if (!seriesId || !videoRef.current) return;

    const progress: WatchProgress = {
      episodeId: parseInt(seriesId),
      currentTime: videoRef.current.currentTime,
      duration: videoRef.current.duration,
      seasonNumber,
      episodeNumber,
      lastWatched: new Date().toISOString()
    };

    // Sauvegarder uniquement si on a regardé plus de 10 secondes
    if (videoRef.current.currentTime > 10) {
      // Sauvegarder pour l'épisode spécifique
      localStorage.setItem(`series-progress-${seriesId}-${seasonNumber}-${episodeNumber}`, JSON.stringify(progress));
      
      // Sauvegarder aussi comme dernier épisode regardé
      localStorage.setItem(`series-progress-${seriesId}`, JSON.stringify(progress));
    }
  };

  // Sauvegarder plus fréquemment (toutes les 2 secondes)
  useEffect(() => {
    if (isPlaying && !isDragging) {
      progressSaveTimeoutRef.current = setInterval(saveProgress, 2000);
    }

    return () => {
      if (progressSaveTimeoutRef.current) {
        clearInterval(progressSaveTimeoutRef.current);
      }
    };
  }, [isPlaying, isDragging]);

  // Sauvegarder la progression avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Reprendre la lecture au bon moment
  useEffect(() => {
    if (videoRef.current && startTime > 0) {
      const handleCanPlay = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = startTime;
          videoRef.current.removeEventListener('canplay', handleCanPlay);
        }
      };

      videoRef.current.addEventListener('canplay', handleCanPlay);
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('canplay', handleCanPlay);
        }
      };
    }
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const updateBufferProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0 && duration > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedPercentage((bufferedEnd / duration) * 100);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      updateBufferProgress();
      
      // Sauvegarder si on a regardé plus de 90% de la vidéo
      if (videoRef.current.currentTime / videoRef.current.duration > 0.9) {
        saveProgress();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        saveProgress(); // Sauvegarder lors de la pause
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Error playing video:", error);
          setIsPlaying(false);
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (newMutedState) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
      videoRef.current.muted = value === 0;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          (containerRef.current as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const videoId = embedUrl.match(/embed-([a-zA-Z0-9]+)/)?.[1];
      if (!videoId) {
        console.error("ID vidéo non trouvé dans l'URL:", embedUrl);
        throw new Error("ID vidéo invalide");
      }

      console.log("Tentative de chargement de la vidéo avec ID:", videoId);

      // Utiliser le proxy local
      const response = await fetch(`/api/convert/uqload?id=${videoId}`);
      const data = await response.json();

      if (!response.ok || !data.videoUrl) {
        throw new Error(data.error || "Erreur de chargement");
      }

      console.log("URL de la vidéo obtenue:", data.videoUrl);

      if (videoRef.current) {
        // Utiliser le proxy pour la vidéo
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(data.videoUrl)}`;

        const headResponse = await fetch(proxyUrl, { method: "HEAD" });
        if (!headResponse.ok) {
          throw new Error("La source vidéo n'est pas accessible");
        }

        if (data.type === "hls" && Hls.isSupported()) {
          console.log("Utilisation du mode HLS");
          hlsRef.current = new Hls({
            capLevelToPlayerSize: true,
            startLevel: 2,
            debug: true
          });
          
          hlsRef.current.loadSource(proxyUrl);
          hlsRef.current.attachMedia(videoRef.current);
          
          hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
            console.error("Erreur HLS:", event, data);
          });
          
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("Manifest HLS parsé avec succès");
            videoRef.current?.play().catch(err => {
              console.error("Erreur lors de la lecture HLS:", err);
            });
          });

          cleanupRef.current = () => {
            if (hlsRef.current) {
              hlsRef.current.destroy();
              hlsRef.current = null;
            }
          };
        } else {
          console.log("Utilisation du mode MP4 standard");
          videoRef.current.src = proxyUrl;
          videoRef.current.preload = "auto";
          await videoRef.current.load();
          videoRef.current.play().catch(err => {
            console.error("Erreur lors de la lecture MP4:", err);
            throw err;
          });
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur complète lors du chargement:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors de la lecture de la vidéo");
      setIsLoading(false);
    }
  };

  // Mouse movement detection to show/hide controls
  const handleMouseMove = () => {
    const now = Date.now();
    lastMouseMoveRef.current = now;
    
    if (!showControls) {
      setShowControls(true);
    }
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying && !isSettingsOpen && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        // Only hide if no movement in the last 3 seconds
        if (now === lastMouseMoveRef.current) {
          setShowControls(false);
        }
      }, 3000);
    }
  };

  const handleFullscreenChange = () => {
    const isFullscreenNow = document.fullscreenElement !== null ||
      (document as any).webkitFullscreenElement !== null ||
      (document as any).msFullscreenElement !== null;
    setIsFullscreen(isFullscreenNow);
    setShowControls(true);
    
    if (!isFullscreenNow && controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  useEffect(() => {
    setRetryCount(0);
    loadVideo();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [embedUrl]);

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Reset controls visibility when settings menu is opened/closed
  useEffect(() => {
    if (isSettingsOpen) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isSettingsOpen]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "ArrowRight":
          skip(10);
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "ArrowUp":
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case "ArrowDown":
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [volume, isPlaying]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Navigation Bar */}
      <AnimatePresence>
        {(showControls || !isPlaying) && (
          <motion.div 
            className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 via-black/50 to-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <motion.button
                onClick={() => router.back()}
                className="flex items-center text-white/90 hover:text-white transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-5 w-5 mr-2 group-hover:translate-x-[-2px] transition-transform" />
                <span className="font-medium">Retour</span>
              </motion.button>
              <motion.div 
                className="flex items-center px-4 py-2 bg-player-accent/20 backdrop-blur-md rounded-lg"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(58, 172, 247, 0.25)" }}
              >
                <span className="text-white text-sm font-extrabold tracking-wide">samaflix</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Container */}
      <div className="relative h-full bg-black">
        {(isLoading || isBuffering) && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 2
              }}
            >
              <Loader2 className="h-16 w-16 text-player-accent" />
            </motion.div>
          </motion.div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div 
              className="space-y-6 p-6 max-w-md bg-black/80 backdrop-blur-lg rounded-xl border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Alert variant="destructive" className="bg-destructive/20 border-destructive/30">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={() => {
                  setRetryCount(0);
                  loadVideo();
                }}
                className="w-full bg-white/5 border-white/20 hover:bg-white/10 transition-all group"
              >
                <RefreshCcw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                Réessayer
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            <motion.video
              ref={videoRef}
              className="w-full h-full object-contain z-10"
              playsInline
              controlsList="nodownload"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onProgress={updateBufferProgress}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onClick={togglePlay}
              onError={() => {
                setError("Une erreur est survenue lors de la lecture de la vidéo");
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Video Info Overlay */}
            <AnimatePresence>
              {!isPlaying && !isLoading && !error && (
                <VideoInfo
                  title={title}
                  description={description}
                  isVisible={true}
                />
              )}
            </AnimatePresence>

            {/* Center Play Button (for big play/pause button in center) */}
            <AnimatePresence>
              {showControls && !isSettingsOpen && (
                <motion.button
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20
                            bg-black/30 backdrop-blur-md rounded-full md:p-6 p-3 flex items-center justify-center
                            hover:bg-player-accent/30 transition-all duration-300"
                  onClick={togglePlay}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? (
                    <motion.svg 
                      width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                      className="md:w-9 md:h-9 w-6 h-6"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" fill="white" />
                      <rect x="14" y="4" width="4" height="16" rx="1" fill="white" />
                    </motion.svg>
                  ) : (
                    <motion.svg 
                      width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                      className="md:w-9 md:h-9 w-6 h-6"
                      initial={{ scale: 0.8, x: 1 }}
                      animate={{ scale: 1, x: 0 }}
                    >
                      <path d="M6 4.5L19 12L6 19.5V4.5Z" fill="white" />
                    </motion.svg>
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Video Controls */}
            <VideoControls
              isVisible={showControls || !isPlaying}
              currentTime={currentTime}
              duration={duration}
              bufferedPercentage={bufferedPercentage}
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              isSettingsOpen={isSettingsOpen}
              progressBarRef={progressBarRef as React.RefObject<HTMLDivElement>}
              onProgressBarClick={handleProgressBarClick}
              onPlayPause={togglePlay}
              onMuteToggle={toggleMute}
              onVolumeChange={handleVolumeChange}
              onSkipBackward={() => skip(-10)}
              onSkipForward={() => skip(10)}
              onFullscreenToggle={toggleFullscreen}
              onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
              formatTime={formatTime}
              setIsDragging={setIsDragging}
            />
          </>
        )}
      </div>
      
      {/* Settings Menu */}
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentQuality={currentQuality}
        currentSpeed={currentSpeed}
        onQualityChange={(quality) => {
          setCurrentQuality(quality);
          if (hlsRef.current && videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const qualityLevel = hlsRef.current.levels.findIndex(
              level => `${level.height}p` === quality
            );
            
            if (qualityLevel !== -1) {
              hlsRef.current.currentLevel = qualityLevel;
              videoRef.current.currentTime = currentTime;
            }
          }
        }}
        onSpeedChange={(speed) => {
          setCurrentSpeed(speed);
          if (videoRef.current) {
            const speedValue = speed === 'Normal' ? 1 : parseFloat(speed);
            videoRef.current.playbackRate = speedValue;
          }
        }}
      />
    </motion.div>
  );
}
