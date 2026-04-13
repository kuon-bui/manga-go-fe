/**
 * Shared mock data fixtures used across MSW handlers (follow/rating + notifications).
 * Shapes align with the updated types in src/types/index.ts.
 */

import type {
  User,
  AuthResponse,
  Manga,
  Author,
  Tag,
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
  name: 'Reader One',
  email: 'reader@example.com',
  avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=reader_one',
  bio: 'Just here to read manga.',
  role: 'member',
  createdAt: '2025-01-01T00:00:00Z',
}

export const MOCK_ADMIN_USER: User = {
  id: 'user-admin',
  name: 'Group Leader',
  email: 'admin@example.com',
  avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=group_leader',
  bio: 'Translation group admin.',
  role: 'group_admin',
  createdAt: '2024-06-01T00:00:00Z',
}

// Server sets tokens as HTTP-only cookies — response only carries user
export const MOCK_AUTH_RESPONSE: AuthResponse = {
  user: MOCK_USER,
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

function makeChapterSummaries(comicSlug: string, count: number): ChapterSummary[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${comicSlug}-ch-${i + 1}-id`,
    slug: `chapter-${i + 1}`,
    number: String(i + 1), // backend stores chapter number as string
    title: i === 0 ? 'Prologue' : null,
    uploadedAt: new Date(Date.now() - (count - i) * 86_400_000).toISOString(),
    group: MOCK_TRANSLATOR_GROUP,
  })).reverse() // latest first
}

// ─── Authors & Tags ───────────────────────────────────────────────────────────

const AUTHORS: Record<string, Author> = {
  tanaka: { id: 'author-1', name: 'Tanaka Hiroshi' },
  yamamoto: { id: 'author-2', name: 'Yamamoto Kenji' },
  seo: { id: 'author-3', name: 'Seo Ji-Young' },
  mika: { id: 'author-4', name: 'Mika Suzuki' },
  chen: { id: 'author-5', name: 'Chen Wei' },
  park: { id: 'author-6', name: 'Park Dongsu' },
  kim: { id: 'author-7', name: 'Kim Mirae' },
  aoyama: { id: 'author-8', name: 'Aoyama Yuki' },
}

const TAGS: Record<string, Tag> = {
  samurai: { id: 'tag-1', name: 'Samurai', slug: 'samurai' },
  revenge: { id: 'tag-2', name: 'Revenge', slug: 'revenge' },
  darkFantasy: { id: 'tag-3', name: 'Dark Fantasy', slug: 'dark-fantasy' },
  magicSchool: { id: 'tag-4', name: 'Magic School', slug: 'magic-school' },
  powers: { id: 'tag-5', name: 'Powers', slug: 'powers' },
  isekai: { id: 'tag-6', name: 'Isekai', slug: 'isekai' },
  wholesome: { id: 'tag-7', name: 'Wholesome', slug: 'wholesome' },
  dailyLife: { id: 'tag-8', name: 'Daily Life', slug: 'daily-life' },
  cultivation: { id: 'tag-9', name: 'Cultivation', slug: 'cultivation' },
  fighting: { id: 'tag-10', name: 'Fighting', slug: 'fighting' },
  supernatural: { id: 'tag-11', name: 'Supernatural', slug: 'supernatural' },
  spirits: { id: 'tag-12', name: 'Spirits', slug: 'spirits' },
}

// ─── Manga ────────────────────────────────────────────────────────────────────

export const MOCK_MANGA_LIST: Manga[] = [
  {
    id: 'manga-1',
    slug: 'steel-shadow',
    title: 'Steel & Shadow',
    alternativeTitles: ['Thép & Bóng Tối'],
    thumbnail: 'https://picsum.photos/seed/manga1/300/420',
    banner: null,
    type: 'manga',
    status: 'ongoing',
    ageRating: 'teen',
    isPublished: true,
    isHot: true,
    isFeatured: false,
    description: 'A hardened warrior roams a land torn by war, seeking redemption for sins he cannot forget.',
    authors: [AUTHORS.tanaka],
    artistId: AUTHORS.yamamoto.id,
    artist: AUTHORS.yamamoto,
    genres: [MOCK_GENRES[0], MOCK_GENRES[1], MOCK_GENRES[3]],
    tags: [TAGS.samurai, TAGS.revenge, TAGS.darkFantasy],
    publishedYear: 2022,
    lastChapterAt: new Date(Date.now() - 86_400_000).toISOString(),
    rating: 8.4,
    ratingCount: 3201,
    followCount: 15420,
    chapterCount: 58,
    createdAt: '2022-03-15T00:00:00Z',
    updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: 'manga-2',
    slug: 'starfall-academy',
    title: 'Starfall Academy',
    alternativeTitles: ['Học Viện Sao Băng'],
    thumbnail: 'https://picsum.photos/seed/manga2/300/420',
    banner: null,
    type: 'manga',
    status: 'ongoing',
    ageRating: 'everyone',
    isPublished: true,
    isHot: false,
    isFeatured: true,
    description: 'Students gifted with cosmic powers must master their abilities before a celestial disaster destroys everything.',
    authors: [AUTHORS.seo],
    artistId: null,
    artist: null,
    genres: [MOCK_GENRES[4], MOCK_GENRES[1], MOCK_GENRES[2]],
    tags: [TAGS.magicSchool, TAGS.powers, TAGS.isekai],
    publishedYear: 2023,
    lastChapterAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    rating: 7.9,
    ratingCount: 1874,
    followCount: 9870,
    chapterCount: 32,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
  {
    id: 'manga-3',
    slug: 'laughing-lotus',
    title: 'Laughing Lotus',
    alternativeTitles: [],
    thumbnail: 'https://picsum.photos/seed/manga3/300/420',
    banner: null,
    type: 'manga',
    status: 'completed',
    ageRating: 'everyone',
    isPublished: true,
    isHot: false,
    isFeatured: false,
    description: 'A heartwarming slice-of-life comedy set in a small flower shop.',
    authors: [AUTHORS.mika],
    artistId: AUTHORS.mika.id,
    artist: AUTHORS.mika,
    genres: [MOCK_GENRES[2], MOCK_GENRES[8]],
    tags: [TAGS.wholesome, TAGS.dailyLife],
    publishedYear: 2021,
    lastChapterAt: '2024-12-01T00:00:00Z',
    rating: 8.8,
    ratingCount: 5402,
    followCount: 22100,
    chapterCount: 120,
    createdAt: '2021-04-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'novel-1',
    slug: 'chronicles-of-the-void-walker',
    title: 'Chronicles of the Void Walker',
    alternativeTitles: ['Biên Niên Sử Kẻ Đi Qua Hư Không'],
    thumbnail: 'https://picsum.photos/seed/novel1/300/420',
    banner: null,
    type: 'novel',
    status: 'ongoing',
    ageRating: 'teen',
    isPublished: true,
    isHot: false,
    isFeatured: false,
    description: 'A wanderer who can traverse dimensional rifts must prevent the collapse of multiple realities.',
    authors: [AUTHORS.chen],
    artistId: null,
    artist: null,
    genres: [MOCK_GENRES[4], MOCK_GENRES[7]],
    tags: [TAGS.isekai, TAGS.cultivation],
    publishedYear: 2023,
    lastChapterAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    rating: 8.1,
    ratingCount: 987,
    followCount: 4320,
    chapterCount: 210,
    createdAt: '2023-05-20T00:00:00Z',
    updatedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  },
  {
    id: 'manga-4',
    slug: 'iron-cage',
    title: 'Iron Cage',
    alternativeTitles: [],
    thumbnail: 'https://picsum.photos/seed/manga4/300/420',
    banner: null,
    type: 'manga',
    status: 'hiatus',
    ageRating: 'teen',
    isPublished: true,
    isHot: false,
    isFeatured: false,
    description: 'A champion fighter trapped in an underground arena fights for his freedom.',
    authors: [AUTHORS.park],
    artistId: AUTHORS.kim.id,
    artist: AUTHORS.kim,
    genres: [MOCK_GENRES[0], MOCK_GENRES[9]],
    tags: [TAGS.fighting],
    publishedYear: 2022,
    lastChapterAt: '2025-06-15T00:00:00Z',
    rating: 7.6,
    ratingCount: 2100,
    followCount: 8900,
    chapterCount: 75,
    createdAt: '2022-07-01T00:00:00Z',
    updatedAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'manga-5',
    slug: 'phantom-blooms',
    title: 'Phantom Blooms',
    alternativeTitles: ['Hoa Ma'],
    thumbnail: 'https://picsum.photos/seed/manga5/300/420',
    banner: null,
    type: 'manga',
    status: 'ongoing',
    ageRating: 'teen',
    isPublished: true,
    isHot: true,
    isFeatured: false,
    description: 'A spirit medium girl navigates the world of the living and the dead.',
    authors: [AUTHORS.aoyama],
    artistId: null,
    artist: null,
    genres: [MOCK_GENRES[5], MOCK_GENRES[6]],
    tags: [TAGS.supernatural, TAGS.spirits],
    publishedYear: 2024,
    lastChapterAt: new Date(Date.now() - 86_400_000 * 0.5).toISOString(),
    rating: 8.3,
    ratingCount: 1200,
    followCount: 6700,
    chapterCount: 18,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: new Date(Date.now() - 86_400_000 * 0.5).toISOString(),
  },
]

// ─── Chapters ─────────────────────────────────────────────────────────────────

export const MOCK_CHAPTER_SUMMARIES: Record<string, ChapterSummary[]> = {
  'steel-shadow': makeChapterSummaries('steel-shadow', 58),
  'starfall-academy': makeChapterSummaries('starfall-academy', 32),
  'laughing-lotus': makeChapterSummaries('laughing-lotus', 120),
  'chronicles-of-the-void-walker': makeChapterSummaries('chronicles-of-the-void-walker', 210),
  'iron-cage': makeChapterSummaries('iron-cage', 75),
  'phantom-blooms': makeChapterSummaries('phantom-blooms', 18),
}

export const MOCK_CHAPTERS: Record<string, Chapter> = {
  'steel-shadow/chapter-1': {
    id: 'steel-shadow-ch-1-id',
    slug: 'chapter-1',
    comicSlug: 'steel-shadow',
    mangaId: 'manga-1',
    number: '1', // string — matches backend model
    title: 'Prologue',
    uploadedAt: '2022-03-15T00:00:00Z',
    group: MOCK_TRANSLATOR_GROUP,
    pages: Array.from({ length: 22 }, (_, i) =>
      `https://picsum.photos/seed/steelshadowch1p${i + 1}/800/1200`
    ),
    content: null,
    prevChapter: null,
    nextChapter: { slug: 'chapter-2', number: '2' },
  },
  'steel-shadow/chapter-58': {
    id: 'steel-shadow-ch-58-id',
    slug: 'chapter-58',
    comicSlug: 'steel-shadow',
    mangaId: 'manga-1',
    number: '58',
    title: 'The Final Stand',
    uploadedAt: new Date(Date.now() - 86_400_000).toISOString(),
    group: MOCK_TRANSLATOR_GROUP,
    pages: Array.from({ length: 30 }, (_, i) =>
      `https://picsum.photos/seed/steelshadowch58p${i + 1}/800/1200`
    ),
    content: null,
    prevChapter: { slug: 'chapter-57', number: '57' },
    nextChapter: null,
  },
  'chronicles-of-the-void-walker/chapter-1': {
    id: 'void-walker-ch-1-id',
    slug: 'chapter-1',
    comicSlug: 'chronicles-of-the-void-walker',
    mangaId: 'novel-1',
    number: '1',
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
    prevChapter: null,
    nextChapter: { slug: 'chapter-2', number: '2' },
  },
}

// ─── Library ──────────────────────────────────────────────────────────────────

export const MOCK_LIBRARY: LibraryEntry[] = [
  {
    mangaId: 'manga-1',
    manga: MOCK_MANGA_LIST[0],
    lastReadChapterId: 'steel-shadow-ch-30-id',
    lastReadAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    addedAt: '2025-01-10T00:00:00Z',
  },
  {
    mangaId: 'manga-3',
    manga: MOCK_MANGA_LIST[2],
    lastReadChapterId: 'laughing-lotus-ch-120-id',
    lastReadAt: '2024-12-05T00:00:00Z',
    addedAt: '2024-11-01T00:00:00Z',
  },
  {
    mangaId: 'novel-1',
    manga: MOCK_MANGA_LIST[3],
    lastReadChapterId: 'void-walker-ch-50-id',
    lastReadAt: new Date(Date.now() - 86_400_000).toISOString(),
    addedAt: '2025-02-20T00:00:00Z',
  },
]

// ─── Comments ─────────────────────────────────────────────────────────────────

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  'steel-shadow-ch-58-id': [
    {
      id: 'cmt-1',
      content: 'Chapter 58 was insane! The art during the final duel was stunning.',
      chapterId: 'steel-shadow-ch-58-id',
      pageIndex: null,
      author: {
        id: 'user-2',
        name: 'Manga Fan',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=manga_fan_99',
      },
      parentId: null,
      replies: [
        {
          id: 'cmt-2',
          content: "Agreed! The double-page spread on page 22 was chef's kiss.",
          chapterId: 'steel-shadow-ch-58-id',
          pageIndex: null,
          author: {
            id: 'user-1',
            name: 'Reader One',
            avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=reader_one',
          },
          parentId: 'cmt-1',
          replies: [],
          reactions: [{ type: 'like', count: 5, userReacted: false }],
          createdAt: new Date(Date.now() - 3_600_000).toISOString(),
          updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
        },
      ],
      reactions: [{ type: 'like', count: 24, userReacted: true }],
      createdAt: new Date(Date.now() - 7_200_000).toISOString(),
      updatedAt: new Date(Date.now() - 7_200_000).toISOString(),
    },
    {
      id: 'cmt-3',
      content: 'Been following this since chapter 1. What a journey.',
      chapterId: 'steel-shadow-ch-58-id',
      pageIndex: null,
      author: {
        id: 'user-3',
        name: 'Long Time Reader',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=long_time_reader',
      },
      parentId: null,
      replies: [],
      reactions: [{ type: 'like', count: 17, userReacted: false }],
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
    link: '/titles/steel-shadow/read/chapter-58',
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'comment_reply',
    title: 'Reader One replied to your comment',
    body: `"Agreed! The double-page spread on page 22 was chef's kiss."`,
    isRead: false,
    link: '/titles/steel-shadow',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'new_chapter',
    title: 'New Chapter: Starfall Academy',
    body: 'Chapter 32 is now available.',
    isRead: true,
    link: '/titles/starfall-academy/read/chapter-32',
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
    name: 'Group Leader',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=group_leader',
    role: 'admin',
    joinedAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'gm-2',
    userId: 'user-1',
    name: 'Reader One',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=reader_one',
    role: 'member',
    joinedAt: '2023-03-10T00:00:00Z',
  },
]

export const MOCK_DASHBOARD_TITLES: DashboardTitle[] = [
  {
    id: 'manga-1',
    slug: 'steel-shadow',
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
    slug: 'starfall-academy',
    title: 'Starfall Academy',
    coverUrl: 'https://picsum.photos/seed/manga2/300/420',
    type: 'manga',
    status: 'ongoing',
    chapterCount: 32,
    lastUploadedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    groups: [{ id: 'group-1', name: 'Scans United' }],
  },
]
