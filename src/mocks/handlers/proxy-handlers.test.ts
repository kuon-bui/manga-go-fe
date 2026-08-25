import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';

import { libraryHandlers } from '@/mocks/handlers/library';
import { notificationHandlers } from '@/mocks/handlers/notifications';

const server = setupServer(...libraryHandlers, ...notificationHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('proxy-aware mock handlers', () => {
  it('handles notification requests sent through the API proxy', async () => {
    const response = await fetch('http://frontend.test/api/notifications');

    expect(response.status).toBe(200);
  });

  it('handles library requests sent through the API proxy', async () => {
    const response = await fetch('http://frontend.test/api/ratings/comics/manga-1');

    expect(response.status).toBe(200);
  });
});
