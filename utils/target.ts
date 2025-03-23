// export const flags = {
//   // Les CORS sont definis pour autoriser n'importe quel origin
//   CORS_ALLOWED: "cors-allowed",

//   // L'ip est bloquee par le serveur de streaming ou par le proxy
//   IP_LOCKED: "ip-locked",

//   // Le site est bloque par Cloudflare
//   CF_BLOCKED: "cf-blocked",

//   // Le site est bloque par un proxy
//   PROXY_BLOCKED: "proxy-blocked",
// } as const;

// export type Flags = (typeof flags)[keyof typeof flags];

// export const targets = {
//   //
//   BROWSER: "browser",

//   //
//   NATIVE: "native",

//   //
//   ANY: "any",
// } as const;

// export type Targets = (typeof targets)[keyof typeof targets];

// export type FeatureMap = {
//   requieres: Flags[];
//   disallowed: Flags[];
// };

// export const targetToFeatureMap: Record<Targets, FeatureMap> = {
//   browser: {
//     requieres: [flags.CORS_ALLOWED],
//     disallowed: [],
//   },
//   native: {
//     requieres: [],
//     disallowed: [],
//   },
//   any: {
//     requieres: [],
//     disallowed: [],
//   },
// };

// export function getTargetFeatures(
//   target: Targets,
//   consistentIpForRequest: boolean,
//   proxyStream?: boolean,
// ): FeatureMap {
//   const features = targetToFeatureMap[target];

//   if (!consistentIpForRequest) features.disallowed.push(flags.IP_LOCKED);
//   if (proxyStream) features.disallowed.push(flags.PROXY_BLOCKED);

//   return features;
// }

// export function flagsAllowedInFeatures(
//   features: FeatureMap,
//   inputFlags: Flags[],
// ): boolean {
//   const hasAllFlags = features.requieres.every((v) => inputFlags.includes(v));

//   if (!hasAllFlags) return false;
//   const hasDisallowedFlags = features.disallowed.some((v) =>
//     inputFlags.includes(v),
//   );

//   if (hasDisallowedFlags) return false;

//   return true;
// }

// // Explication du Code

// // La fonction `getTargetFeatures` prend trois paramètres :
// // - `target` : Le type de cible (par exemple, "browser", "native" ou "any").
// // - `consistentIpForRequest` : Un booleen qui indique si l'IP du client est toujours consistante lors d'une requête.
// // - `proxyStream` : Un booleen qui indique si le proxy de streaming est utilisé ou non.

// // La fonction `flagsAllowedInFeatures` prend deux paramètres :
// // - `features` : Un objet qui contient les propriétés "requieres" et "disallowed".
// // - `inputFlags` : Un tableau de flags qui seront utilisés pour comparer les propriétés "requieres" et "disallowed".

// // La fonction `flagsAllowedInFeatures` retourne un boolean qui indique si toutes les flags sont autorisées ou non.
// // Si toutes les flags sont autorisées, la fonction retourne `true`. Sinon, la fonction retourne `false`.

// // La fonction `getTargetFeatures` retourne un objet qui contient les propriétés "requieres" et "disallowed".
// // Ces propriétés sont utilisées pour comparer les flags utilisés par la fonction `flagsAllowedInFeatures`.
