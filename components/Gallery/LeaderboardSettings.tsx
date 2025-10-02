
import React, { useState, useRef, useContext, useEffect } from 'react';
import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { LeaderboardSchoolContext } from "../../providers/LeaderboardProvider";
import { LeaderboardAPI } from '../../api/Leaderboard';

import { SCHOOLS } from '../../types/ui';

import { useLocalization } from '../../contexts/localizationUtils';

interface LeaderboardSettingsProps {
    leaderboard_id: number
}

export const LeaderboardSettings: React.FC<LeaderboardSettingsProps> = ({ leaderboard_id }) => {
  const authUserData = useContext(AuthUserContext);
  const { schoolItems, fetchSchoolItems } = useContext(LeaderboardSchoolContext);
  const [ schoolSet, setSchoolSet ] = useState<Set<string>>(new Set());
  const [ errorKey, setErrorKey ] = useState<string | null>(null);
  const { t } = useLocalization();
  
  useEffect(() => {
    setErrorKey(null);
    fetchSchoolItems(leaderboard_id).then(data => {
      setSchoolSet(new Set(data));
    }).catch(err => {
      console.error("Failed to fetch leaderboard analysis: ", err);
      setErrorKey('error.fetch_analysis');
    });
  }, [fetchSchoolItems, setSchoolSet, leaderboard_id]);

  // Loading state
  if (!leaderboard_id || !schoolItems) {
    return <div>{t('loading')}...</div>;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      schoolSet.add(event.target.name);
      LeaderboardAPI.addLeaderboardSchools(
        leaderboard_id,
        { id: leaderboard_id, school: [ event.target.name ] }
      ).then(
        (data)=>{ setSchoolSet(new Set(data.map(s => s.school))); }
      ).catch(err => {
        console.error("Failed to add leaderboard schools: ", err);
        setErrorKey('error.add_school');
      });
    } else {
      schoolSet.delete(event.target.name);
      LeaderboardAPI.deleteLeaderboardSchool(
        leaderboard_id,
        event.target.name
      ).then(
        (data)=>{ setSchoolSet(new Set(data.map(s => s.school))); }
      ).catch(err => {
        console.error("Failed to delete leaderboard schools: ", err);
        setErrorKey('error.delete_school');
      });
    }

  };


  if (authUserData?.currentUser?.is_admin === false) {
    return (
        <div>
            {t('error.not_authorized')}
        </div>
    );
  } else {
    return (
      <Box sx={{ display: 'flex' }}>
        <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
          <FormLabel component="legend">Schools below could access to this writing task. </FormLabel>
          <FormGroup>
            {SCHOOLS.map((school) => (
              <FormControlLabel
                key={school}
                control={
                  <Checkbox checked={schoolSet.has(school)} onChange={handleChange} name={school} />
                }
                label={school}
              />
            ))}
          </FormGroup>
          <FormHelperText>{errorKey}</FormHelperText>
        </FormControl>
      </Box>
    );
  }

}
