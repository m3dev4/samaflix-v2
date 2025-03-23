import { Metadata } from "next";

const providerNames = {
  "8": "Netflix",
  "119": "Prime Video",
  "337": "Disney+",
  "384": "HBO Max",
  "531": "Paramount+",
  "2": "Apple TV+",
  "387": "HBO"
} as const;

type Props = {
  params: { providerId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${providerNames[params.providerId as keyof typeof providerNames] || "Séries"} - Samaflix`,
    description: `Découvrez toutes les séries disponibles sur ${providerNames[params.providerId as keyof typeof providerNames] || "notre plateforme"}`,
  };
}
