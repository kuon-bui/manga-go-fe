# State Management with Zustand

This guide covers best practices for state management using Zustand in the Manga Go Frontend project.

## Table of Contents

- [Overview](#overview)
- [When to Use Zustand](#when-to-use-zustand)
- [Store Structure](#store-structure)
- [Middleware](#middleware)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)

## Overview

Zustand is a lightweight state management library that provides:
- Simple, hook-based API
- No boilerplate code
- Built-in middleware support (devtools, persist)
- Excellent TypeScript support
- No Provider wrapper needed

**Project Dependencies:**
```json
{
  "zustand": "^5.0.3"
}
```

## When to Use Zustand

### ✅ Use Zustand For:
- **Global application state** - User authentication, theme preferences
- **Shared state across components** - Shopping cart, notifications
- **Persistent state** - User preferences, cached data
- **Complex state logic** - Multiple related state updates
- **Cross-route state** - State that persists across page navigations

### ❌ Don't Use Zustand For:
- **Component-local state** - Use `useState` instead
- **Form state** - Use `useState` or form libraries
- **URL state** - Use Next.js `searchParams` instead
- **Server data** - Use Server Components or data fetching libraries
- **Temporary UI state** - Modal open/closed, hover states

## Store Structure

### Basic Store Template

```typescript
// src/stores/use-<feature>-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { RelatedType } from '@/types';

// 1. Define the state interface
interface FeatureState {
  // State properties
  data: string[];
  count: number;
  isLoading: boolean;
  error: string | null;

  // Action methods
  addData: (_item: string) => void;
  increment: () => void;
  reset: () => void;
  setLoading: (_isLoading: boolean) => void;
  setError: (_error: string | null) => void;
}

// 2. Define initial state
const initialState = {
  data: [],
  count: 0,
  isLoading: false,
  error: null,
};

// 3. Create the store with middleware
export const useFeatureStore = create<FeatureState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Actions
        addData: (item: string) =>
          set((state) => ({ data: [...state.data, item] }), false, 'addData'),

        increment: () =>
          set((state) => ({ count: state.count + 1 }), false, 'increment'),

        reset: () => set(initialState, false, 'reset'),

        setLoading: (isLoading: boolean) =>
          set({ isLoading }, false, 'setLoading'),

        setError: (error: string | null) =>
          set({ error }, false, 'setError'),
      }),
      {
        name: 'feature-store', // localStorage key
        partialize: (state) => ({
          // Only persist specific fields
          data: state.data,
          count: state.count,
          // Don't persist: isLoading, error
        }),
      }
    ),
    {
      name: 'FeatureStore', // DevTools name
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
```

### Store Anatomy

```typescript
create<StateInterface>()(
  devtools(                    // Redux DevTools integration
    persist(                   // LocalStorage persistence
      (set, get) => ({         // Store implementation
        // State
        count: 0,

        // Actions
        increment: () => set((state) => ({
          count: state.count + 1
        })),
      }),
      { name: 'store-key' }    // Persist config
    ),
    { name: 'StoreName' }      // DevTools config
  )
);
```

## Middleware

### 1. DevTools Middleware

Integrates with Redux DevTools for debugging:

```typescript
devtools(
  (set) => ({
    // Store implementation
  }),
  {
    name: 'StoreName',                              // Display name in DevTools
    enabled: process.env.NODE_ENV === 'development', // Only in development
  }
)
```

**Action Names:**
```typescript
// Third parameter is the action name shown in DevTools
set({ count: 1 }, false, 'increment');
set({ user: null }, false, 'logout');
set(initialState, false, 'reset');
```

### 2. Persist Middleware

Saves state to localStorage:

```typescript
persist(
  (set) => ({
    // Store implementation
  }),
  {
    name: 'storage-key',              // localStorage key

    // Only persist specific fields
    partialize: (state) => ({
      user: state.user,
      preferences: state.preferences,
      // Don't persist: isLoading, error, tempData
    }),

    // Optional: Version for migrations
    version: 1,

    // Optional: Custom storage
    storage: createJSONStorage(() => sessionStorage),
  }
)
```

**What to Persist:**
- ✅ User preferences (theme, language)
- ✅ Authentication tokens
- ✅ Cached data (with expiration)
- ❌ Loading states
- ❌ Error messages
- ❌ Temporary UI state

## Best Practices

### 1. Use Selectors to Prevent Re-renders

```typescript
// ❌ Bad: Re-renders on ANY store change
function Component() {
  const store = useExampleStore();
  return <div>{store.count}</div>;
}

// ✅ Good: Only re-renders when `count` changes
function Component() {
  const count = useExampleStore((state) => state.count);
  return <div>{count}</div>;
}

// ✅ Good: Select multiple values
function Component() {
  const { count, increment } = useExampleStore((state) => ({
    count: state.count,
    increment: state.increment,
  }));
  return <button onClick={increment}>{count}</button>;
}
```

### 2. Organize Actions by Domain

```typescript
interface UserStore {
  // User data
  user: User | null;
  isAuthenticated: boolean;

  // Auth actions
  login: (_credentials: Credentials) => Promise<void>;
  logout: () => void;

  // Profile actions
  updateProfile: (_data: ProfileData) => Promise<void>;
  uploadAvatar: (_file: File) => Promise<void>;
}
```

### 3. Keep State Normalized

```typescript
// ❌ Bad: Nested, denormalized data
interface BadStore {
  manga: {
    id: string;
    title: string;
    chapters: Chapter[];  // Nested array
  }[];
}

// ✅ Good: Normalized, flat structure
interface GoodStore {
  mangaById: Record<string, Manga>;
  chapterById: Record<string, Chapter>;
  mangaIds: string[];
}
```

### 4. Use Action Creators for Complex Logic

```typescript
export const useCartStore = create<CartState>()(
  devtools((set, get) => ({
    items: [],

    // Simple action
    clearCart: () => set({ items: [] }, false, 'clearCart'),

    // Complex action with logic
    addItem: (product: Product, quantity: number) => {
      const { items } = get();
      const existingItem = items.find((item) => item.productId === product.id);

      if (existingItem) {
        // Update quantity
        set({
          items: items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }, false, 'addItem/update');
      } else {
        // Add new item
        set({
          items: [...items, { productId: product.id, quantity }],
        }, false, 'addItem/create');
      }
    },
  }))
);
```

### 5. Handle Async Actions Properly

```typescript
interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  fetchUser: (_id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  devtools((set) => ({
    user: null,
    isLoading: false,
    error: null,

    fetchUser: async (id: string) => {
      set({ isLoading: true, error: null }, false, 'fetchUser/start');

      try {
        const user = await fetchUserById(id);
        set({ user, isLoading: false }, false, 'fetchUser/success');
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false,
        }, false, 'fetchUser/error');
      }
    },
  }))
);
```

### 6. Type Safety with TypeScript

```typescript
// Always define explicit interfaces
interface TypedStore {
  count: number;
  increment: () => void;
}

// Use the interface in create
export const useTypedStore = create<TypedStore>()(
  devtools((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }))
);

// TypeScript will catch errors
useTypedStore.getState().increment();  // ✅ OK
useTypedStore.getState().decrement(); // ❌ Error: Property 'decrement' does not exist
```

## Common Patterns

### 1. Authentication Store

```typescript
// src/stores/use-auth-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (_email: string, _password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (_user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        login: async (email: string, password: string) => {
          set({ isLoading: true }, false, 'login/start');
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              body: JSON.stringify({ email, password }),
            });
            const { user, token } = await response.json();
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            }, false, 'login/success');
          } catch (error) {
            set({ isLoading: false }, false, 'login/error');
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          }, false, 'logout');
        },

        refreshToken: async () => {
          const { token } = get();
          if (!token) return;

          try {
            const response = await fetch('/api/auth/refresh', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const { token: newToken } = await response.json();
            set({ token: newToken }, false, 'refreshToken');
          } catch (error) {
            set({ user: null, token: null, isAuthenticated: false }, false, 'refreshToken/error');
          }
        },

        updateUser: (userData: Partial<User>) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          }), false, 'updateUser');
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          // Don't persist: isLoading
        }),
      }
    ),
    { name: 'AuthStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

### 2. Theme/Settings Store

```typescript
// src/stores/use-settings-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'vi' | 'ja';

interface SettingsState {
  theme: Theme;
  language: Language;
  fontSize: number;
  autoPlay: boolean;

  setTheme: (_theme: Theme) => void;
  setLanguage: (_language: Language) => void;
  setFontSize: (_size: number) => void;
  toggleAutoPlay: () => void;
  reset: () => void;
}

const defaultSettings = {
  theme: 'system' as Theme,
  language: 'en' as Language,
  fontSize: 16,
  autoPlay: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme: Theme) => set({ theme }),
      setLanguage: (language: Language) => set({ language }),
      setFontSize: (fontSize: number) => set({ fontSize }),
      toggleAutoPlay: () => set((state) => ({ autoPlay: !state.autoPlay })),
      reset: () => set(defaultSettings),
    }),
    { name: 'settings-store' }
  )
);
```

### 3. Pagination Store Pattern

```typescript
interface PaginationStore {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;

  setPage: (_page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setTotal: (_total: number) => void;
}

export const usePaginationStore = create<PaginationStore>()(
  devtools((set, get) => ({
    page: 1,
    pageSize: 20,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,

    setPage: (page: number) => {
      const { pageSize, total } = get();
      set({
        page,
        hasNextPage: page * pageSize < total,
        hasPrevPage: page > 1,
      }, false, 'setPage');
    },

    nextPage: () => {
      const { page, hasNextPage } = get();
      if (hasNextPage) {
        get().setPage(page + 1);
      }
    },

    prevPage: () => {
      const { page, hasPrevPage } = get();
      if (hasPrevPage) {
        get().setPage(page - 1);
      }
    },

    setTotal: (total: number) => {
      const { page, pageSize } = get();
      set({
        total,
        hasNextPage: page * pageSize < total,
      }, false, 'setTotal');
    },
  }))
);
```

## Performance Optimization

### 1. Shallow Comparison

Use shallow comparison for object selectors:

```typescript
import { shallow } from 'zustand/shallow';

// Without shallow: re-renders even if values are the same
const { count, increment } = useStore((state) => ({
  count: state.count,
  increment: state.increment,
}));

// With shallow: only re-renders if values actually change
const { count, increment } = useStore(
  (state) => ({
    count: state.count,
    increment: state.increment,
  }),
  shallow
);
```

### 2. Split Large Stores

```typescript
// ❌ Bad: One large store
interface AppStore {
  // User-related (changes frequently)
  user: User;
  updateUser: () => void;

  // Settings (changes rarely)
  theme: string;
  language: string;

  // Cart (changes frequently)
  cart: CartItem[];
  addToCart: () => void;
}

// ✅ Good: Split into focused stores
const useUserStore = create<UserStore>(...);
const useSettingsStore = create<SettingsStore>(...);
const useCartStore = create<CartStore>(...);
```

### 3. Memoize Selectors

```typescript
import { useMemo } from 'react';

function Component() {
  const items = useStore((state) => state.items);

  // Memoize expensive computations
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return <div>{/* render sortedItems */}</div>;
}
```

## Testing

### Testing Stores

```typescript
// Example test (using Jest or Vitest)
import { renderHook, act } from '@testing-library/react';
import { useCounterStore } from './use-counter-store';

describe('useCounterStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCounterStore.setState({ count: 0 });
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounterStore());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### Accessing Store Outside React

```typescript
// Get current state
const currentCount = useCounterStore.getState().count;

// Subscribe to changes
const unsubscribe = useCounterStore.subscribe((state) => {
  console.log('Count changed:', state.count);
});

// Update state
useCounterStore.setState({ count: 5 });

// Clean up
unsubscribe();
```

## Debugging

### Redux DevTools

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Open DevTools (F12) and select "Redux" tab
3. View state changes, time-travel debug, and action history

### Logging

Add temporary logging for debugging:

```typescript
const useDebugStore = create<State>()(
  devtools((set) => ({
    count: 0,
    increment: () => {
      console.log('Before increment:', useDebugStore.getState().count);
      set((state) => ({ count: state.count + 1 }));
      console.log('After increment:', useDebugStore.getState().count);
    },
  }))
);
```

## Migration Guide

### From useState to Zustand

```typescript
// Before: Local state
function Component() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// After: Zustand store
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

function Component() {
  const { count, increment } = useCounterStore();
  return <button onClick={increment}>{count}</button>;
}
```

## Additional Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
