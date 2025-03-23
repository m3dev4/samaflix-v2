import { Metadata } from "next";

declare module "next" {
  export interface GenerateMetadataProps {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
  }
}
