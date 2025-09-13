export type Language = 'en' | 'ja';

export type ViewMode = 'gallery' | 'mistakes' | 'analytics';

export type GalleryView = 'browsing' | 'detail';

export type GalleryDetailView = 'detail' | 'word_cloud' | 'leaderboard' | 'writer';

export const GALLERY_VIEWS: GalleryView[] = ['browsing', 'detail'];

export const GALLERY_DETAIL_VIEWS: GalleryDetailView[] = ['detail', 'word_cloud', 'leaderboard', 'writer'];