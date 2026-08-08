import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/lib/api-client';

describe('apiClient routing', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends API requests through the same-origin proxy', async () => {
    await apiClient.getAllGenres();

    expect(fetch).toHaveBeenCalledWith(
      '/api/proxy/genres/all',
      expect.objectContaining({ credentials: 'include' })
    );
  });
});
