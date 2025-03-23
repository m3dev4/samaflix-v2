import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Films en Streaming HD | Samaflix",
  description: "Regardez les meilleurs films en streaming HD sur Samaflix. Action, comédie, drame, horreur et plus encore. Films récents et classiques disponibles en VF et VOSTFR.",
  keywords: [
    "Films streaming", "Films en ligne", "Films HD", "Films gratuits",
    "Films action", "Films comédie", "Films drame", "Films horreur",
    "Films VF", "Films VOSTFR", "Nouveaux films", "Films populaires",
    "Films classiques", "Films récents", "Streaming films"
  ],
  openGraph: {
    title: "Films en Streaming HD | Samaflix",
    description: "Regardez les meilleurs films en streaming HD. Action, comédie, drame et plus encore.",
    type: "website",
    images: [
      {
        url: "/samaflix-films-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Samaflix Films"
      }
    ]
  }
}; 