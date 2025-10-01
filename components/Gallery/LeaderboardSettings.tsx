
import React, { useState, useRef, useContext, useEffect } from 'react';
import Container from '@mui/material/Container';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { LeaderboardItemContext } from "../../providers/LeaderboardProvider";

import { useLocalization } from '../../contexts/localizationUtils';

interface LeaderboardSettingsProps {
    leaderboard_id: number
}

export const LeaderboardSettings: React.FC<LeaderboardSettingsProps> = ({ leaderboard_id }) => {
  const authUserData = useContext(AuthUserContext);
  const { leaderboard, loading, fetchLeaderboard } = useContext(LeaderboardItemContext);
  const [ errorKey, setErrorKey ] = useState<string | null>(null);
  const { t } = useLocalization();
  
  useEffect(() => {
    setErrorKey(null);
    fetchLeaderboard(leaderboard_id).catch(err => {
      console.error("Failed to fetch leaderboard analysis: ", err);
      setErrorKey('error.fetch_analysis');
    });
  }, [fetchLeaderboard, leaderboard_id]);
  
  // Loading state
  if (!leaderboard ) {
    return <div>{t('loading')}...</div>;
  }

  if (authUserData?.currentUser?.user_type === "student") {
    return (
        <div>
            {t('error.not_authorized')}
        </div>
    );
  } else {
    return (
      <div>
        School Settings
      </div>
    );
  }

}
