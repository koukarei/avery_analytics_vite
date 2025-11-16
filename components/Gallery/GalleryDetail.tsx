
import React, { useState, useContext, useEffect } from 'react';
import Container from '@mui/material/Container';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { LeaderboardItemContext } from "../../providers/LeaderboardProvider";
import { SceneContext } from "../../providers/SceneProvider";
import { StoryContext } from "../../providers/StoryProvider";

import { ViewLeaderboard, EditLeaderboard } from './LeaderboardForm';
import { useLocalization } from '../../contexts/localizationUtils';
import { ErrorDisplay } from '../Common/ErrorDisplay';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface LeaderboardDetailProps {
    leaderboard_id: number
}

export const LeaderboardDetail: React.FC<LeaderboardDetailProps> = ({ leaderboard_id }) => {
  const authUserData = useContext(AuthUserContext);
  const { leaderboard, loading, fetchLeaderboard } = useContext(LeaderboardItemContext);
  const { scenes, loading: scenesLoading, fetchScenes } = useContext(SceneContext);
  const { stories, loading: storiesLoading, fetchStories } = useContext(StoryContext);
  const [ errorKey, setErrorKey ] = useState<string | null>(null);
  const { t } = useLocalization();
  
  useEffect(() => {
    setErrorKey(null);
    fetchLeaderboard(leaderboard_id).catch(err => {
      console.error("Failed to fetch leaderboard analysis: ", err);
      setErrorKey('error.fetch_analysis');
    });
    fetchScenes().catch(err => {
      console.error("Failed to fetch scenes: ", err);
      setErrorKey('error.fetch_scenes');
    });
    fetchStories().catch(err => {
      console.error("Failed to fetch stories: ", err);
      setErrorKey('error.fetch_stories');
    });
  }, [ leaderboard_id]);
  
  // Loading state
  if ( loading || scenesLoading || storiesLoading || !leaderboard ) {
    return <LoadingSpinner />;
  }
  if (errorKey) {
    return <ErrorDisplay messageKey={errorKey} />;
  }

  if (authUserData?.currentUser?.user_type === "student" && authUserData?.currentUser?.id !== leaderboard.created_by.id) {
    return (
        <Container sx={formContentStyle}>
          <ViewLeaderboard leaderboard={leaderboard} scenes={scenes} stories={stories} />
        </Container>
    );
  } else {
    return (
      <Container sx={formContentStyle}>
        <EditLeaderboard leaderboard={leaderboard} scenes={scenes} stories={stories} />
      </Container>
    );
  }

}
const formContentStyle = {
  px: 2,
  pb: 2,
  pt: 1,
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 200px)', // safe scroll area inside the card
};