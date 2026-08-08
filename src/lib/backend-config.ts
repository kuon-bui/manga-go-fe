interface BackendEnvironment {
  [key: string]: string | undefined;
  BACKEND_INTERNAL_URL?: string;
}

const MISSING_BACKEND_URL_MESSAGE =
  'Missing required environment variable: BACKEND_INTERNAL_URL';

export function requireBackendInternalUrl(
  environment: BackendEnvironment = process.env
): string {
  const backendUrl = environment.BACKEND_INTERNAL_URL?.trim();

  if (!backendUrl) {
    throw new Error(MISSING_BACKEND_URL_MESSAGE);
  }

  return backendUrl;
}
