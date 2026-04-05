/**
 * Shared mock data fixtures used across all MSW handlers.
 * Update shapes here when BE confirms the final API contract.
 */

import type {
  User,
  AuthResponse,
  Manga,
  Genre,
  Chapter,
  ChapterSummary,
  LibraryEntry,
  Comment,
  Notification,
  Group,
  GroupMember,
  DashboardTitle,
  TranslatorGroup,
} from '@/types'

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: 'user-1',
  username: 'reader_one',
  email: 'reader@example.com',
  displayName: 'Reader One',
  avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=reader_one',
  bio: 'Just here to read manga.',
  role: 'member',
  createdAt: '2025-01-01T00:00:00Z',
}

export const MOCK_ADMIN_USER: User = {
  id: 'user-admin',
  username: 'group_leader',
  email: 'admin@example.com',
  displayName: 'Group Leader',
  avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=group_leader',
  bio: 'Translation group admin.',
  role: 'group_admin',
  createdAt: '2024-06-01T00:00:00Z',
}

export const MOCK_AUTH_RESPONSE: AuthResponse = {
  user: MOCK_USER,
  accessToken: 'mock-access-token-abc123',
  refreshToken: 'mock-refresh-token-xyz789',
}

// ─── Genres ───────────────────────────────────────────────────────────────────

export const MOCK_GENRES: Genre[] = [
  { id: 'g-1', name: 'Action', slug: 'action' },
  { id: 'g-2', name: 'Adventure', slug: 'adventure' },
  { id: 'g-3', name: 'Comedy', slug: 'comedy' },
  { id: 'g-4', name: 'Drama', slug: 'drama' },
  { id: 'g-5', name: 'Fantasy', slug: 'fantasy' },
  { id: 'g-6', name: 'Horror', slug: 'horror' },
  { id: 'g-7', name: 'Romance', slug: 'romance' },
  { id: 'g-8', name: 'Sci-Fi', slug: 'sci-fi' },
  { id: 'g-9', name: 'Slice of Life', slug: 'slice-of-life' },
  { id: 'g-10', name: 'Sports', slug: 'sports' },
]

// ─── Translator Groups ────────────────────────────────────────────────────────

const MOCK_TRANSLATOR_GROUP: TranslatorGroup = {
  id: 'tg-1',
  name: 'Scans United',
  logoUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=SU',
}

// ─── Chapter Summaries ────────────────────────────────────────────────────────

function makeChapterSummaries(mangaId: string, count: number): ChapterSummary[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${mangaId}-ch-${i + 1}`,
    number: i + 1,
    title: i === 0 ? 'Prologue' : null,
    uploadedAt: new Date(Date.now() - (count - i) * 86_400_000).toISOString(),
    group: MOCK_TRANSLATOR_GROUP,
  })).reverse() // latest first
}

// ─── Manga ────────────────────────────────────────────────────────────────────

export const MOCK_MANGA_LIST: Manga[] = [
  {
    id: 'manga-1',
    title: 'Steel & Shadow',
    alternativeTitles: ['Thép & Bóng Tối'],
    coverUrl: 'https://picsum.photos/seed/manga1/300/420',
    type: 'manga',
    status: 'ongoing',
    description:
      'A hardened warrior roams a land torn by war, seeking redemption for sins he cannot forget.',
    author: 'Tanaka Hiroshi',
    artist: 'Yamamoto Kenji',
    genres: [MOCK_GENRES[0], MOCK_GENRES[1], MOCK_GENRES[3]],
    tags: ['samurai', 'revenge', 'dark fantasy'],
    year: 2022,
    rating: 8.4,
    ratingCount: 3201,
    followCount: 15420,
    chapterCount: 58,
    latestChapter: {
      id: 'manga-1-ch-58',
      number: 58,
      title: 'The Final Stand',
      uploadedAt: new Date(Date.now() - 86_400_000).toISOString(),
      group: MOCK_TRANSLATOR_GROUP,
    },
    createdAt: '2022-03-15T00:00:00Z',
    updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: 'manga-2',
    title: 'Starfall Academy',
    alternativeTitles: ['Học Viện Sao Băng'],
    coverUrl: 'https://picsum.photos/seed/manga2/300/420',
    type: 'manga',
    status: 'ongoing',
    description:
      'Students gifted with cosmic powers must master their abilities before a celestial disaster destroys everything.',
    author: 'Seo Ji-Young',
    artist: null,
    genres: [MOCK_GENRES[4], MOCK_GENRES[1], MOCK_GENRES[2]],
    tags: ['magic school', 'powers', 'isekai'],
    year: 2023,
    rating: 7.9,
    ratingCount: 1874,
    followCount: 9870,
    chapterCount: 32,
    latestChapter: {
      id: 'manga-2-ch-32',
      number: 32,
      title: null,
      uploadedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      group: MOCK_TRANSLATOR_GROUP,
    },
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
  {
    id: 'manga-3',
    title: 'Laughing Lotus',
    alternativeTitles: [],
    coverUrl: 'https://picsum.photos/seed/manga3/300/420',
    type: 'manga',
    status: 'completed',
    description: 'A heartwarming slice-of-life comedy set in a small flower shop.',
    author: 'Mika Suzuki',
    artist: 'Mika Suzuki',
    genres: [MOCK_GENRES[2], MOCK_GENRES[8]],
    tags: ['wholesome', 'daily life', 'flowers'],
    year: 2021,
    rating: 8.8,
    ratingCount: 5402,
    followCount: 22100,
    chapterCount: 120,
    latestChapter: {
      id: 'manga-3-ch-120',
      number: 120,
      title: 'Epilogue',
      uploadedAt: '2024-12-01T00:00:00Z',
      group: MOCK_TRANSLATOR_GROUP,
    },
    createdAt: '2021-04-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'novel-1',
    title: 'Chronicles of the Void Walker',
    alternativeTitles: ['Biên Niên Sử Kẻ Đi Qua Hư Không'],
    coverUrl: 'https://picsum.photos/seed/novel1/300/420',
    type: 'novel',
    status: 'ongoing',
    description:
      'A wanderer who can traverse dimensional rifts must prevent the collapse of multiple realities.',
    author: 'Chen Wei',
    artist: null,
    genres: [MOCK_GENRES[4], MOCK_GENRES[7]],
    tags: ['dimension travel', 'cultivation', 'system'],
    year: 2023,
    rating: 8.1,
    ratingCount: 987,
    followCount: 4320,
    chapterCount: 210,
    latestChapter: {
      id: 'novel-1-ch-210',
      number: 210,
      title: null,
      uploadedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      group: MOCK_TRANSLATOR_GROUP,
    },
    createdAt: '2023-05-20T00:00:00Z',
    updatedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  },
  {
    id: 'manga-4',
    title: 'Iron Cage',
    alternativeTitles: [],
    coverUrl: 'https://picsum.photos/seed/manga4/300/420',
    type: 'manga',
    status: 'hiatus',
    description: 'A champion fighter trapped in an underground arena fights for his freedom.',
    author: 'Park Dongsu',
    artist: 'Kim Mirae',
    genres: [MOCK_GENRES[0], MOCK_GENRES[9]],
    tags: ['fighting', 'underground', 'tournament'],
    year: 2022,
    rating: 7.6,
    ratingCount: 2100,
    followCount: 8900,
    chapterCount: 75,
    latestChapter: {
      id: 'manga-4-ch-75',
      number: 75,
      title: null,
      uploadedAt: '2025-06-15T00:00:00Z',
      group: MOCK_TRANSLATOR_GROUP,
    },
    createdAt: '2022-07-01T00:00:00Z',
    updatedAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'manga-5',
    title: 'Phantom Blooms',
    alternativeTitles: ['Hoa Ma'],
    coverUrl: 'https://picsum.photos/seed/manga5/300/420',
    type: 'manga',
    status: 'ongoing',
    description: 'A spirit medium girl navigates the world of the living and the dead.',
    author: 'Aoyama Yuki',
    artist: null,
    genres: [MOCK_GENRES[5], MOCK_GENRES[6]],
    tags: ['supernatural', 'spirits', 'mystery'],
    year: 2024,
    rating: 8.3,
    ratingCount: 1200,
    followCount: 6700,
    chapterCount: 18,
    latestChapter: {
      id: 'manga-5-ch-18',
      number: 18,
      title: null,
      uploadedAt: new Date(Date.now() - 86_400_000 * 0.5).toISOString(),
      group: MOCK_TRANSLATOR_GROUP,
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: new Date(Date.now() - 86_400_000 * 0.5).toISOString(),
  },
]

// ─── Chapters ─────────────────────────────────────────────────────────────────

export const MOCK_CHAPTER_SUMMARIES: Record<string, ChapterSummary[]> = {
  'manga-1': makeChapterSummaries('manga-1', 58),
  'manga-2': makeChapterSummaries('manga-2', 32),
  'manga-3': makeChapterSummaries('manga-3', 120),
  'novel-1': makeChapterSummaries('novel-1', 210),
  'manga-4': makeChapterSummaries('manga-4', 75),
  'manga-5': makeChapterSummaries('manga-5', 18),
}

export const MOCK_CHAPTERS: Record<string, Chapter> = {
  'manga-1-ch-1': {
    id: 'manga-1-ch-1',
    mangaId: 'manga-1',
    number: 1,
    title: 'Prologue',
    uploadedAt: '2022-03-15T00:00:00Z',
    group: MOCK_TRANSLATOR_GROUP,
    pages: Array.from({ length: 22 }, (_, i) =>
      `https://picsum.photos/seed/manga1ch1p${i + 1}/800/1200`
    ),
    content: null,
    prevChapterId: null,
    nextChapterId: 'manga-1-ch-2',
  },
  'manga-1-ch-58': {
    id: 'manga-1-ch-58',
    mangaId: 'manga-1',
    number: 58,
    title: 'The Final Stand',
    uploadedAt: new Date(Date.now() - 86_400_000).toISOString(),
    group: MOCK_TRANSLATOR_GROUP,
    pages: Array.from({ length: 30 }, (_, i) =>
      `https://picsum.photos/seed/manga1ch58p${i + 1}/800/1200`
    ),
    content: null,
    prevChapterId: 'manga-1-ch-57',
    nextChapterId: null,
  },
  'novel-1-ch-1': {
    id: 'novel-1-ch-1',
    mangaId: 'novel-1',
    number: 1,
    title: 'Awakening',
    uploadedAt: '2023-05-20T00:00:00Z',
    group: MOCK_TRANSLATOR_GROUP,
    pages: [],
    content: `<h2>Chapter 1 — Awakening</h2>
<p>The void was not empty. It hummed with the energy of a thousand collapsed worlds, each one a ghost of what had been. Kai stood at the boundary, his consciousness fragmented across seventeen simultaneous realities.</p>
<p>"You shouldn't be here," said the voice that had no origin.</p>
<p>Kai turned — or rather, all seventeen versions of him turned at once — and faced the entity that existed between moments. It looked like a man, if a man were made entirely of the space between stars.</p>
<p>"I go where I'm needed," Kai replied.</p>
<p>The entity laughed, and the sound rippled backward through time.</p>
<p>"Then you are needed nowhere and everywhere. The Void Walker stirs once more."</p>
<p>A crack split the fabric of the boundary, and through it poured light — not the warm light of a sun, but the cold, ancient light of something that had been burning since before matter existed.</p>
<p>Kai stepped through.</p>`,
    prevChapterId: null,
    nextChapterId: 'novel-1-ch-2',
  },
}

// ─── Library ──────────────────────────────────────────────────────────────────

export const MOCK_LIBRARY: LibraryEntry[] = [
  {
    mangaId: 'manga-1',
    manga: MOCK_MANGA_LIST[0],
    lastReadChapterId: 'manga-1-ch-30',
    lastReadAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    addedAt: '2025-01-10T00:00:00Z',
  },
  {
    mangaId: 'manga-3',
    manga: MOCK_MANGA_LIST[2],
    lastReadChapterId: 'manga-3-ch-120',
    lastReadAt: '2024-12-05T00:00:00Z',
    addedAt: '2024-11-01T00:00:00Z',
  },
  {
    mangaId: 'novel-1',
    manga: MOCK_MANGA_LIST[3],
    lastReadChapterId: 'novel-1-ch-50',
    lastReadAt: new Date(Date.now() - 86_400_000).toISOString(),
    addedAt: '2025-02-20T00:00:00Z',
  },
]

// ─── Comments ─────────────────────────────────────────────────────────────────

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  'manga-1': [
    {
      id: 'cmt-1',
      body: 'Chapter 58 was insane! The art during the final duel was stunning.',
      author: {
        id: 'user-2',
        username: 'manga_fan_99',
        displayName: 'Manga Fan',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=manga_fan_99',
      },
      parentId: null,
      replies: [
        {
          id: 'cmt-2',
          body: "Agreed! The double-page spread on page 22 was chef's kiss.",
          author: {
            id: 'user-1',
            username: 'reader_one',
            displayName: 'Reader One',
            avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=reader_one',
          },
          parentId: 'cmt-1',
          replies: [],
          likeCount: 5,
          isLiked: false,
          createdAt: new Date(Date.now() - 3_600_000).toISOString(),
          updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
        },
      ],
      likeCount: 24,
      isLiked: true,
      createdAt: new Date(Date.now() - 7_200_000).toISOString(),
      updatedAt: new Date(Date.now() - 7_200_000).toISOString(),
    },
    {
      id: 'cmt-3',
      body: 'Been following this since chapter 1. What a journey.',
      author: {
        id: 'user-3',
        username: 'long_time_reader',
        displayName: 'Long Time Reader',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=long_time_reader',
      },
      parentId: null,
      replies: [],
      likeCount: 17,
      isLiked: false,
      createdAt: new Date(Date.now() - 14_400_000).toISOString(),
      updatedAt: new Date(Date.now() - 14_400_000).toISOString(),
    },
  ],
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'new_chapter',
    title: 'New Chapter: Steel & Shadow',
    body: 'Chapter 58 "The Final Stand" is now available.',
    isRead: false,
    link: '/titles/manga-1/read/manga-1-ch-58',
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'comment_reply',
    title: 'Reader One replied to your comment',
    body: `"Agreed! The double-page spread on page 22 was chef's kiss."`,
    isRead: false,
    link: '/titles/manga-1',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'new_chapter',
    title: 'New Chapter: Starfall Academy',
    body: 'Chapter 32 is now available.',
    isRead: true,
    link: '/titles/manga-2/read/manga-2-ch-32',
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
]

// ─── Groups ───────────────────────────────────────────────────────────────────

export const MOCK_GROUPS: Group[] = [
  {
    id: 'group-1',
    name: 'Scans United',
    slug: 'scans-united',
    logoUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=SU',
    description: 'Dedicated scanlation group focused on action and fantasy titles.',
    memberCount: 8,
    titleCount: 3,
    createdAt: '2023-01-15T00:00:00Z',
  },
]

export const MOCK_GROUP_MEMBERS: GroupMember[] = [
  {
    id: 'gm-1',
    userId: 'user-admin',
    username: 'group_leader',
    displayName: 'Group Leader',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=group_leader',
    role: 'admin',
    joinedAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'gm-2',
    userId: 'user-1',
    username: 'reader_one',
    displayName: 'Reader One',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=reader_one',
    role: 'member',
    joinedAt: '2023-03-10T00:00:00Z',
  },
]

export const MOCK_DASHBOARD_TITLES: DashboardTitle[] = [
  {
    id: 'manga-1',
    title: 'Steel & Shadow',
    coverUrl: 'https://picsum.photos/seed/manga1/300/420',
    type: 'manga',
    status: 'ongoing',
    chapterCount: 58,
    lastUploadedAt: new Date(Date.now() - 86_400_000).toISOString(),
    groups: [{ id: 'group-1', name: 'Scans United' }],
  },
  {
    id: 'manga-2',
    title: 'Starfall Academy',
    coverUrl: 'https://picsum.photos/seed/manga2/300/420',
    type: 'manga',
    status: 'ongoing',
    chapterCount: 32,
    lastUploadedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    groups: [{ id: 'group-1', name: 'Scans United' }],
  },
]
