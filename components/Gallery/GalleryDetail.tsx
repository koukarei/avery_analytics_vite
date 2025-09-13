
import React, { useState, useRef, useContext, useEffect } from 'react';
import type { Leaderboard, LeaderboardAnalysis, Scene } from '../../types/leaderboard';
import type { GalleryView } from '../../types/ui';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { LeaderboardAnalysisContext } from "../../providers/LeaderboardProvider";
import { SceneContext } from "../../providers/SceneProvider";

import { ViewLeaderboard, EditLeaderboard } from './LeaderboardForm';
import { useLocalization } from '../../contexts/localizationUtils';

interface GalleryDetailProps {
  view: GalleryView;
  setView: (view: GalleryView) => void;
  leaderboards: Leaderboard[];
  images: Record<number, string>; // Mapping of leaderboard ID to image URL
  currentIndex: number; // Index of the first image in the triplet to display
  onScroll: (direction: 'up' | 'down') => void;
}

interface ImagePanelProps {
  leaderboard: Leaderboard | null;
  imageUrl: string | null;
  position: 'left' | 'center' | 'right';
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void; // Added for click navigation
}

interface LeaderboardDetailProps {
    leaderboard: Leaderboard | null;
}

export const LeaderboardDetail: React.FC<LeaderboardDetailProps> = ({ leaderboard }) => {
  const program_name = sessionStorage.getItem("program") || "";
  const authUserData = useContext(AuthUserContext);
  const { analysis, fetchAnalysis } = useContext(LeaderboardAnalysisContext);
  const { scenes } = useContext(SceneContext);
  const [ cloud_type, setCloudType ] = useState<string>("mistake");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const { t, language } = useLocalization();
  const [scene, setScene] = useState<Scene | null>(null);

  if (!leaderboard){
    console.error("LeaderboardDetail: No leaderboard provided");
    setErrorKey('error.no_leaderboard');
    return null;
  } else {
    useEffect(() => {
      setErrorKey(null);
      fetchAnalysis(leaderboard?.id, program_name, {cloud_type: cloud_type, lang: language}).then(analysis => {
        if (!analysis) {
          const scene_id = leaderboard?.scene.id;
          setScene(scenes.find(scene => scene.id === scene_id) || null);
        }
      }).catch(err => {
        console.error("Failed to fetch leaderboard analysis: ", err);
        setErrorKey('error.fetch_analysis');
      });


    }, []);
  }

  // Loading state
  if (!analysis || !scenes) {
    return <div>{t('loading')}...</div>;
  }

  if (authUserData?.currentUser?.user_type === "student") {
    return (
        <div className="w-full h-full p-4 overflow-y-auto">
        <ViewLeaderboard leaderboard={leaderboard} analysis={analysis} scenes={scenes} />
        </div>
    );
  } else {
    return (
      <div className="w-full h-full p-4 overflow-y-auto">
        <ViewLeaderboard leaderboard={leaderboard} analysis={analysis} scenes={scenes} />
      </div>
    );
  }

}
