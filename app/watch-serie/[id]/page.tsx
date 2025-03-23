'use client';

import { VideoPlayer } from '@/components/player/VideoPlayer';
import { VideoPlayerSeries } from '@/components/series/player/videoSeriesPlayer';
import { useSearchParams } from 'next/navigation';

export default function SeriesWatchPage() {
  const searchParams = useSearchParams();
  const embedUrl = searchParams.get('url');
  const title = searchParams.get('title');

  if (!embedUrl || !title) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500">URL de la vidéo ou titre manquant</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <VideoPlayer 
        embedUrl={embedUrl} 
        title={title} 
         
      />
    </div>
  );
}