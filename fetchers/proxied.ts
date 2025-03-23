// import { UseableFetcher } from "./types";

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const proxiedFetcher: UseableFetcher = async <T = any>(url: string, options?: { baseUrl?: string; method?: string; headers?: Record<string, string>; body?: any; full?: boolean }): Promise<T> => {
//   const fullUrl = options?.baseUrl ? `${options.baseUrl}${url}` : url;

//   const response = await fetch("/api/proxy", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       url: fullUrl,
//       options: {
//         method: options?.method || "GET",
//         headers: options?.headers,
//         body: options?.body,
//         full: options?.full || false,
//       },
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// };
