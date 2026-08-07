import { libraryHandlers } from './library';
import { notificationHandlers } from './notifications';
import { authorizationHandlers } from './authorization';

// Only mock handlers for features without a real backend API yet.
// Auth, comics, chapters, comments, genres, and translation-groups
// all bypass to the real backend via onUnhandledRequest: 'bypass'.
export const handlers = [...libraryHandlers, ...notificationHandlers, ...authorizationHandlers];
