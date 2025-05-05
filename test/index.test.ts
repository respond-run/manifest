/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getManifestEntry, clearManifestCache } from '../src';

describe('getManifestEntry', () => {
  const mockManifest = {
    'src/assets/logo.png': {
      file: 'assets/logo-5PDIjnPN.png',
      src: 'src/assets/logo.png'
    },
    'src/client.ts': {
      file: 'assets/client-CGwop9zM.js',
      name: 'client',
      src: 'src/client.ts',
      isEntry: true,
      css: ['assets/client-tn0RQdqM.css']
    },
    'src/styles.css': {
      file: 'assets/styles-CcJf8-W_.css',
      src: 'src/styles.css',
      isEntry: true
    }
  };

  const mockFetchAsset = vi.fn().mockImplementation((path: string) => {
    if (path === '/.vite/manifest.json') {
      return Promise.resolve(new Response(JSON.stringify(mockManifest)));
    }
    return Promise.resolve(new Response());
  });

  beforeEach(() => {
    clearManifestCache();
  });

  it('should return the correct manifest entry when match is found', async () => {
    const entry = await getManifestEntry('styles', mockFetchAsset);
    expect(entry).toEqual(mockManifest['src/styles.css']);
  });

  it('should return the first matching entry when multiple matches exist', async () => {
    const entry = await getManifestEntry('src', mockFetchAsset);
    expect(entry).toEqual(mockManifest['src/assets/logo.png']);
  });

  it('should return null when no match is found', async () => {
    const entry = await getManifestEntry('nonexistent', mockFetchAsset);
    expect(entry).toBeNull();
  });

  it('should return null when manifest cannot be loaded', async () => {
    const failingFetchAsset = vi.fn().mockImplementation(() => {
      throw new Error('Failed to fetch');
    });
    const entry = await getManifestEntry('styles', failingFetchAsset);
    expect(entry).toBeNull();
  });
});
