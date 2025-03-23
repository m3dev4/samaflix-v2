// utils/providers.ts
interface EmbedProvider {
  name: string;
  pattern: RegExp;
  convertToHls: (url: string) => Promise<string>;
}

const providers: EmbedProvider[] = [
  {
    name: 'uqload',
    pattern: /uqload\.(com|net|co)\/embed-([a-zA-Z0-9]+)/,
    convertToHls: async (url: string) => {
      const videoId = url.match(/embed-([a-zA-Z0-9]+)/)?.[1];
      if (!videoId) throw new Error('ID vidéo non trouvé');

      const response = await fetch(`/api/convert/uqload?id=${videoId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de conversion uqload');
      }
      
      const data = await response.json();
      return data.m3u8Url;
    }
  },
  {
    name: 'multiup',
    pattern: /multiup\.us\/player\/embed_player\.php/,
    convertToHls: async (url: string) => {
      const videoId = new URL(url).searchParams.get('vid');
      if (!videoId) throw new Error('ID vidéo non trouvé');

      const response = await fetch(`/api/convert/multiup?id=${videoId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de conversion multiup');
      }
      
      const data = await response.json();
      return data.m3u8Url;
    }
  },
  {
    name: 'flixeo',
    pattern: /fr\.flixeo\.xyz\/(viper|charko|jett)\/newplayer\.php/,
    convertToHls: async (url: string) => {
      const videoId = new URL(url).searchParams.get('id');
      if (!videoId) throw new Error('ID vidéo non trouvé');

      const response = await fetch(`/api/convert/flixeo?id=${videoId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de conversion flixeo');
      }
      
      const data = await response.json();
      return data.m3u8Url;
    }
  }
];

export function detectProvider(url: string): EmbedProvider | null {
  return providers.find(provider => provider.pattern.test(url)) || null;
}