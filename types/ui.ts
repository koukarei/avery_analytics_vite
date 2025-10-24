export type Language = 'en' | 'ja';

export type ViewMode = 'gallery' | 'word_cloud' | 'writer' | 'analytics';

export type GalleryView = 'browsing' | 'detail';

export type GalleryDetailView = {
    viewName: 'detail' | 'leaderboard' | 'settings',
    displayToStudents: boolean,
};

export type WordCloudType = 'mistake' | 'writing' | 'user_chat' | 'assistant_chat';

export const GALLERY_VIEWS: GalleryView[] = ['browsing', 'detail'];

export const GALLERY_DETAIL_VIEWS: GalleryDetailView[] = [
    { viewName: 'leaderboard', displayToStudents: true },
    { viewName: 'detail', displayToStudents: true },
    { viewName: 'settings', displayToStudents: false },
];

export type SCHOOL = "saikyo"| "lms" | "tom" | "tomsec" | "newleaf" | "public";

export const SCHOOLS: SCHOOL[] = ["saikyo", "lms", "tom", "tomsec", "newleaf", "public"];