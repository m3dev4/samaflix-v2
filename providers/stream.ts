// import { Flags } from "@/utils/target";
// import { Caption } from "./captions";

// export type StreamFile = {
//   type: "mp4";
//   url: string;
// };

// export type Qualities = "unkwnown" | "4k" | "1080p" | "720p" | "480p" | "360p";

// type ThumbnailTrack = {
//   type: "vtt";
//   url: string;
// };

// type StreamCommon = {
//   id: string;
//   flags: Flags[];
//   captions: Caption[];
//   thumbnailTrack?: ThumbnailTrack;
//   headers?: Record<string, string>;
//   preferredHeaders?: Record<string, string>;
// };

// export type FileBassedStream = StreamCommon & {
//   type: "file";
//   qualities: Partial<Record<Qualities, StreamFile>>;
// };

// export type HLSBasedStream = StreamCommon & {
//   type: "hls";
//   playlist: string;
//   proxyDepth?: 0 | 1 | 2;
// };

// export type Stream = FileBassedStream | HLSBasedStream;
