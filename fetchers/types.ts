// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as FormData from 'form-data';

// export type FetcherOptions = {
//   baseUrl?: string;
//   headers?: Record<string, string>;
//   query?: Record<string, string>;
//   method?: 'HEAD' | 'GET' | 'POST';
//   readHeaders?: string[];
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   body?: Record<string, any> | string | FormData | URLSearchParams;
//   credentials?: 'include' | 'same-origin' | 'omit';
// };

// // Version of the options that always has the defaults set
// // This is to make making fetchers yourself easier
// export type DefaultedFetcherOptions = {
//   baseUrl?: string;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   body?: Record<string, any> | string | FormData;
//   headers: Record<string, string>;
//   query: Record<string, string>;
//   readHeaders: string[];
//   method: 'HEAD' | 'GET' | 'POST';
//   credentials?: 'include' | 'same-origin' | 'omit';
// };

// export type FetcherResponse<T = any> = {
//   statusCode: number;
//   headers: Headers;
//   finalUrl: string;
//   body: T;
// };

// // This is the version that will be inputted by library users
// export type Fetcher = {
//   <T = any>(url: string, ops: DefaultedFetcherOptions): Promise<FetcherResponse<T>>;
// };

// // This is the version that scrapers will be interacting with
// export interface UseableFetcher {
//   <T = any>(url: string, options?: { baseUrl?: string; method?: string; headers?: Record<string, string>; body?: any; full?: boolean }): Promise<T>;
// }
