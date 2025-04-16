let cachedManifest: Record<string, any> | null = null;

export interface ManifestEntry {
  file: string;
  css?: string[];
  imports?: string[];
}

export interface ClientEntry {
  scriptPath: string;
  stylePath?: string;
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
  } catch {
    // Silent fail in dev mode
  }

  return null;
}

/**
 * Resolves the script/style paths for the main client entrypoint.
 */
export async function getClientEntry(fetchAsset: (path: string) => Promise<Response>): Promise<ClientEntry> {
  const fallback: ClientEntry = { scriptPath: '/src/client.ts' };
  const manifest = await getManifest(fetchAsset);
  const entry = manifest?.['src/client.ts'];

  if (!entry) return fallback;

  return {
    scriptPath: '/' + entry.file,
    stylePath: entry.css?.[0] ? '/' + entry.css[0] : undefined,
  };
}
