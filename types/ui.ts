import React from "react";
import FeedbackIcon from '@mui/icons-material/Feedback';
import PanoramaIcon from '@mui/icons-material/Panorama';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

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

export type SettingTab = {
    tabName: 'program' | 'scene' | 'story',
    label: string,
    displayToStudents: boolean,
    icon: React.ElementType | null,
}

export const SETTING_TABS: SettingTab[] = [
    { tabName: 'program', label: 'header.menuDrawer.programManagement', displayToStudents: true, icon: FeedbackIcon },
    { tabName: 'scene', label: 'header.menuDrawer.sceneManagement', displayToStudents: true, icon: PanoramaIcon },
    { tabName: 'story', label: 'header.menuDrawer.storyManagement', displayToStudents: true, icon: AutoStoriesIcon },
];

export type SCHOOL = "saikyo"| "lms" | "tom" | "tomsec" | "newleaf" | "public";

export const SCHOOLS: SCHOOL[] = ["saikyo", "lms", "tom", "tomsec", "newleaf", "public"];