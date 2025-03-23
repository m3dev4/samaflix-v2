import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Samaflix - Films",
    description: "The best place to watch movies and series",
    keywords: "movies, series, watch online, free, streaming, samaflix, ",
    viewport: "width=device-width, initial-scale=1.0",
    themeColor: "#000000",
    openGraph: {
        title: "Samaflix - Films",
        description: "The best place to watch movies and series",
        images: [
            {
                url: "/og-image.png",
                width: 800,
                height: 600,
                alt: "Samaflix - Films",
            },
        ],
    },
    
};

export default function FilmsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}