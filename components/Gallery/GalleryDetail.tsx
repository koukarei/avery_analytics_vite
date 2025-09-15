
import React, { useState, useRef, useContext, useEffect } from 'react';
import Container from '@mui/material/Container';
import type { Leaderboard, LeaderboardAnalysis, Scene } from '../../types/leaderboard';
import type { GalleryView } from '../../types/ui';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { LeaderboardAnalysisContext } from "../../providers/LeaderboardProvider";
import { SceneContext } from "../../providers/SceneProvider";
import { StoryContext } from "../../providers/StoryProvider";

import { ViewLeaderboard, EditLeaderboard } from './LeaderboardForm';
import { useLocalization } from '../../contexts/localizationUtils';

interface LeaderboardDetailProps {
    leaderboard: Leaderboard | null;
}

export const LeaderboardDetail: React.FC<LeaderboardDetailProps> = ({ leaderboard }) => {
  const program_name = sessionStorage.getItem("program") || "";
  const authUserData = useContext(AuthUserContext);
  const { analysis, fetchAnalysis } = useContext(LeaderboardAnalysisContext);
  const { scenes } = useContext(SceneContext);
  const { stories } = useContext(StoryContext);
  const [ cloud_type, setCloudType ] = useState<string>("mistake");
  const [ errorKey, setErrorKey ] = useState<string | null>(null);
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
        <Container>
        <ViewLeaderboard leaderboard={leaderboard} analysis={analysis} scenes={scenes} stories={stories} />
        </Container>
    );
  } else {
    return (
      <Container>
        <ViewLeaderboard leaderboard={leaderboard} analysis={analysis} scenes={scenes} stories={stories} />
      </Container>
    );
  }

}
