import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());

class ResizeObserverStub implements ResizeObserver {
  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: ResizeObserverStub,
});

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (): void => {},
    removeListener: (): void => {},
    addEventListener: (): void => {},
    removeEventListener: (): void => {},
    dispatchEvent: (): boolean => false,
  }),
});

function createStorageStub(): Storage {
  const values = new Map<string, string>();
  return {
    get length(): number {
      return values.size;
    },
    clear(): void {
      values.clear();
    },
    getItem(key: string): string | null {
      return values.get(key) ?? null;
    },
    key(index: number): string | null {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key: string): void {
      values.delete(key);
    },
    setItem(key: string, value: string): void {
      values.set(key, value);
    },
  };
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: createStorageStub(),
});

Object.defineProperty(window, 'sessionStorage', {
  configurable: true,
  value: createStorageStub(),
});
