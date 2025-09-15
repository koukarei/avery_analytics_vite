
import React, { useState, useRef, useContext, useEffect } from 'react';
import Container from '@mui/material/Container';
import type { Leaderboard, LeaderboardAnalysis, Scene } from '../../types/leaderboard';
import type { WordCloudType } from '../../types/ui';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { LeaderboardItemContext } from "../../providers/LeaderboardProvider";
import { SceneContext } from "../../providers/SceneProvider";
import { StoryContext } from "../../providers/StoryProvider";

import { ViewLeaderboard, EditLeaderboard } from './LeaderboardForm';
import { useLocalization } from '../../contexts/localizationUtils';

interface LeaderboardDetailProps {
    leaderboard_id: number
}

export const LeaderboardDetail: React.FC<LeaderboardDetailProps> = ({ leaderboard_id }) => {
  const authUserData = useContext(AuthUserContext);
  const { leaderboard, loading, fetchLeaderboard } = useContext(LeaderboardItemContext);
  const { scenes } = useContext(SceneContext);
  const { stories } = useContext(StoryContext);
  const [ errorKey, setErrorKey ] = useState<string | null>(null);
  const { t } = useLocalization();
  
  useEffect(() => {
    setErrorKey(null);
    fetchLeaderboard(leaderboard_id)
      .catch(err => {
        console.error("Failed to fetch leaderboard analysis: ", err);
        setErrorKey('error.fetch_analysis');
      });
  }, [leaderboard, fetchLeaderboard, leaderboard_id]);

  // Loading state
  if (!leaderboard || !scenes) {
    return <div>{t('loading')}...</div>;
  }

  if (authUserData?.currentUser?.user_type === "student") {
    return (
        <Container>
        <ViewLeaderboard leaderboard={leaderboard} scenes={scenes} stories={stories} />
        </Container>
    );
  } else {
    return (
      <Container>
        <ViewLeaderboard leaderboard={leaderboard} scenes={scenes} stories={stories} />
      </Container>
    );
  }

}
