// import { HLSBasedStream } from "./stream";

// interface MovieData {
//   title: string;
//   url: string;
//   image: string;
//   type: string;
//   streamingLinks: {
//     url: string;
//     provider: string;
//     quality: string;
//     type: string;
//   }[];
// }

// interface EmbedProvider {
//   name: string;
//   pattern: RegExp;
//   convertToHls: (url: string) => Promise<string>;
// }

// const providers: EmbedProvider[] = [
//   {
//     name: "uqload",
//     pattern: /uqload\.net/,
//     convertToHls: async (url: string) => {
//       // Extraire l'ID de la vidéo
//       const videoId = url.match(/embed-([a-zA-Z0-9]+)\.html/)?.[1];
//       if (!videoId) throw new Error("Invalid uqload URL");
      
//       // Faire une requête vers notre API de conversion
//       const response = await fetch(`/api/convert/uqload/${videoId}`);
//       const data = await response.json();
//       return data.hlsUrl;
//     }
//   },
//   {
//     name: "netu",
//     pattern: /multiup\.us/,
//     convertToHls: async (url: string) => {
//       // Logique spécifique pour netu/multiup
//       const response = await fetch(`/api/convert/netu?url=${encodeURIComponent(url)}`);
//       const data = await response.json();
//       return data.hlsUrl;
//     }
//   }
// ];

// export async function findMovieByTitle(title: string): Promise<MovieData | null> {
//   // Charger les données depuis le fichier JSON
//   const response = await fetch('/api/movies/search?title=' + encodeURIComponent(title));
//   const movie = await response.json();
//   return movie;
// }

// export async function convertEmbedToHls(embedUrl: string): Promise<HLSBasedStream> {
//   const provider = providers.find(p => p.pattern.test(embedUrl));
//   if (!provider) throw new Error("Fournisseur non supporté");

//   try {
//     const hlsUrl = await provider.convertToHls(embedUrl);
    
//     return {
//       type: "hls",
//       id: `${provider.name}-${Date.now()}`,
//       playlist: hlsUrl,
//       flags: [],
//       captions: [],
//       proxyDepth: 1
//     };
//   } catch (error) {
//     throw new Error(`Erreur lors de la conversion du lien ${provider.name}: ${error}`);
//   }
// }

// export async function getRandomStreamingLink(movie: MovieData) {
//   const availableLinks = movie.streamingLinks.filter(link => 
//     providers.some(provider => provider.pattern.test(link.url))
//   );

//   if (availableLinks.length === 0) {
//     throw new Error("Aucun lien de streaming compatible n'a été trouvé");
//   }

//   // Sélectionner un lien au hasard
//   const randomLink = availableLinks[Math.floor(Math.random() * availableLinks.length)];
//   return randomLink;
// }
