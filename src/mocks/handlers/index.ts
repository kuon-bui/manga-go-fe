import { authHandlers } from './auth'
import { mangaHandlers } from './manga'
import { libraryHandlers } from './library'
import { commentHandlers } from './comments'
import { notificationHandlers } from './notifications'
import { dashboardHandlers } from './dashboard'

export const handlers = [
  ...authHandlers,
  ...mangaHandlers,
  ...libraryHandlers,
  ...commentHandlers,
  ...notificationHandlers,
  ...dashboardHandlers,
]
