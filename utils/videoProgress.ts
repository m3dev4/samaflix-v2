// Clé pour le stockage local
const VIDEO_PROGRESS_KEY = 'video-progress';

interface VideoProgress {
  movieId: string;
  currentTime: number;
  duration: number;
  timestamp: number;
}

// Sauvegarder la progression d'une vidéo
export const saveVideoProgress = (movieId: string, currentTime: number, duration: number) => {
  try {
    const progress: VideoProgress = {
      movieId,
      currentTime,
      duration,
      timestamp: Date.now()
    };
    
    // Récupérer les progressions existantes
    const existingProgress = localStorage.getItem(VIDEO_PROGRESS_KEY);
    const progressData = existingProgress ? JSON.parse(existingProgress) : {};
    
    // Mettre à jour la progression pour ce film
    progressData[movieId] = progress;
    
    // Sauvegarder dans le localStorage
    localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la progression:', error);
  }
};

// Récupérer la progression d'une vidéo
export const getVideoProgress = (movieId: string): VideoProgress | null => {
  try {
    const existingProgress = localStorage.getItem(VIDEO_PROGRESS_KEY);
    if (!existingProgress) return null;
    
    const progressData = JSON.parse(existingProgress);
    return progressData[movieId] || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    return null;
  }
};

// Formater le temps en minutes:secondes
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculer le pourcentage de progression
export const calculateProgress = (currentTime: number, duration: number): number => {
  if (!duration) return 0;
  return (currentTime / duration) * 100;
};
