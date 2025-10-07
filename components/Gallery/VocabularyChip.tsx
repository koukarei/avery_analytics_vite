/** @jsxImportSource @emotion/react */

import React from 'react';
import { css } from '@emotion/react';
import Chip from '@mui/material/Chip';
//import { Close } from '@mui/icons-material';

interface Props {
  label: string;
  onDelete: () => void;
}

const VocabularyChip: React.FC<Props> = ({ label, handleDelete }) => {
  return (
    <div css={chipStyle}>
      {label}

      <Chip color="primary" onDelete={handleDelete} />
    </div>
  );
};

const chipStyle = css`
  display: inline-flex;
  align-items: center;
  background-color: #1976d2;
  color: white;
  padding: 0 8px;
  margin: 2px;
  border-radius: 16px;
  font-size: 0.875rem;
  .MuiIconButton-root {
    padding: 2px;
    color: white;
  }
`;

export default VocabularyChip;