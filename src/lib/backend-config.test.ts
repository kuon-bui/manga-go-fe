import { describe, expect, it } from 'vitest';

import { requireBackendInternalUrl } from '@/lib/backend-config';

describe('requireBackendInternalUrl', () => {
  it('returns the configured backend URL', () => {
    expect(
      requireBackendInternalUrl({ BACKEND_INTERNAL_URL: 'http://localhost:8085' })
    ).toBe('http://localhost:8085');
  });

  it('throws when BACKEND_INTERNAL_URL is missing', () => {
    expect(() => requireBackendInternalUrl({})).toThrowError(
      'Missing required environment variable: BACKEND_INTERNAL_URL'
    );
  });

  it('throws when BACKEND_INTERNAL_URL is blank', () => {
    expect(() =>
      requireBackendInternalUrl({ BACKEND_INTERNAL_URL: '   ' })
    ).toThrowError('Missing required environment variable: BACKEND_INTERNAL_URL');
  });
});
