# API Proxy Design

## Goal

Route every browser-originated backend API request through the Next.js same-origin proxy. The browser must not depend on or receive the backend's internal URL.

## Decisions

- The frontend API base URL is the fixed relative path `/api`.
- `NEXT_PUBLIC_API_URL` is removed from frontend runtime configuration.
- The proxy requires the server-only `BACKEND_INTERNAL_URL` environment variable.
- Missing or blank `BACKEND_INTERNAL_URL` is a configuration error. There is no localhost fallback.
- `SafeImage` rewrites backend image paths to `/api`, while the dedicated `/api/files/content/[...path]` route continues to take precedence.

## Request Flow

Normal API calls, multipart uploads, and the notification SSE connection use paths under `/api`:

```text
Browser -> Next.js /api/<path> -> BACKEND_INTERNAL_URL/<path>
```

The existing catch-all proxy continues to forward the HTTP method, query string, request body, supported headers, response stream, status, and cookies. SSE uses the same streaming proxy route.

## Configuration and Errors

Local development configures:

```dotenv
BACKEND_INTERNAL_URL=http://localhost:8085
```

The checked-in example declares `BACKEND_INTERNAL_URL` instead of `NEXT_PUBLIC_API_URL`. When the required variable is absent or contains only whitespace, the API proxy raises an explicit error naming `BACKEND_INTERNAL_URL` rather than silently targeting a default server.

## Image Scope

This change does not modify `SafeImage`, `/api/files/content/[...path]`, or any existing image URL transformation. Image behavior and its configuration remain exactly as they are.

## Testing

Automated tests will verify:

- API client requests target `/api/<endpoint>`.
- Missing or blank `BACKEND_INTERNAL_URL` produces the expected configuration error.
- A configured backend URL is returned unchanged for proxy use.

The final verification runs the focused tests, the full test suite, linting, and the production build.

## Acceptance Criteria

- No normal API, upload, or notification SSE request uses `NEXT_PUBLIC_API_URL` or a direct backend origin.
- The general API proxy has no backend URL fallback.
- Missing backend configuration fails with a clear error.
- Image requests remain same-origin and resolve through the dedicated file-content route when applicable.
