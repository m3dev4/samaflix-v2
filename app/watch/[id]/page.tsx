'use client'

import { VideoPlayer } from '@/components/player/VideoPlayer';
import { useSearchParams } from 'next/navigation';

export default function WatchPage() {
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <VideoPlayer 
        embedUrl={embedUrl} 
        title={title} 
         
      />
    </div>
  );
}
