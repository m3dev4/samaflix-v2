import React from 'react';
import { getVideoProgress, formatTime } from '@/utils/videoProgress';
import { Button } from '../ui/button';
import { Play } from 'lucide-react';

interface WatchedReplayProps {
  movieId: string;
  onResumeClick: (time: number) => void;
}

const WatchedReplay = ({ movieId, onResumeClick }: WatchedReplayProps) => {
  const savedProgress = getVideoProgress(movieId);

  if (!savedProgress) {
    return null;
  }

  const handleResumeClick = () => {
    onResumeClick(savedProgress.currentTime);
  };

  const progressPercent = Math.floor((savedProgress.currentTime / savedProgress.duration) * 100);

  return (
    <div className="flex flex-col gap-2 p-4 bg-black/80 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm">
          Reprendre à {formatTime(savedProgress.currentTime)}
        </span>
        <span className="text-gray-400 text-xs">
          {progressPercent}% terminé
        </span>
      </div>
      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-600 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <Button
        onClick={handleResumeClick}
        className="mt-2 w-full flex items-center justify-center gap-2"
        variant="secondary"
      >
        <Play className="w-4 h-4" />
        Reprendre la lecture
      </Button>
    </div>
  );
};

export default WatchedReplay;
