let cachedManifest: Record<string, any> | null = null;

export interface ManifestEntry {
  file: string;
  src: string;
  name?: string;
  isEntry?: boolean;
  isDynamicEntry?: boolean;
  css?: string[];
  dynamicImports?: string[];
  assets?: string[];
}

/**
 * Clear the cached manifest. Useful for testing.
 */
export function clearManifestCache(): void {
  cachedManifest = null;
}

/**
 * Load and cache Vite manifest from a Cloudflare-compatible asset binding.
 */
export async function getManifest(fetchAsset: (path: string) => Promise<Response>): Promise<Record<string, ManifestEntry> | null> {
  if (cachedManifest) return cachedManifest;

  try {
    const res = await fetchAsset('/.vite/manifest.json');
    if (res.ok) {
      cachedManifest = await res.json();
      return cachedManifest;
    }
  } catch (error) {
    cachedManifest = null;
    return null;
  }

  cachedManifest = null;
  return null;
}

/**
 * Finds the first manifest entry whose key contains the given match string.
 * @param matchString The string to search for in manifest entry keys
 * @param fetchAsset Function to fetch assets
 * @returns The first matching manifest entry or null if no match is found
 */
export async function getManifestEntry(
  matchString: string,
  fetchAsset: (path: string) => Promise<Response>
): Promise<ManifestEntry | null> {
  const manifest = await getManifest(fetchAsset);
  if (!manifest) return null;

  const entry = Object.entries(manifest).find(([key]) => key.includes(matchString));
  return entry ? entry[1] : null;
}
