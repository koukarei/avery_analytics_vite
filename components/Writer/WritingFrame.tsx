/** @jsxImportSource @emotion/react */
import { TextField } from "@mui/material";
import React from "react";
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Button from '@mui/material/Button';
import { theme } from "../../src/Theme";
import ImageListItem from "@mui/material/ImageListItem";
import { useLocalization } from '../../contexts/localizationUtils';

interface WritingFrameProps {
    imageUrl: string;
    writingText: string;
    setWritingText: (text: string) => void;
}

export const WritingFrame: React.FC<WritingFrameProps> = ({ imageUrl, writingText, setWritingText }) => {
    const { t } = useLocalization();

    return (
        <Card css={WritingFrameStyle(theme)} variant="outlined">
            {imageUrl && (
                <ImageListItem style={{ minWidth: '200px', maxWidth: '60%', padding: 5, marginBottom: '8px' }}>
                    <img src={imageUrl} alt="Writing" />
                </ImageListItem>
            )}
            <div css={typingAreaStyle(theme)}>
                <TextField
                    css={typingFieldStyle(theme)}
                    value={writingText}
                    onChange={(e) => setWritingText(e.target.value)}
                    multiline
                    fullWidth
                    minRows={10}
                    variant="outlined"
                    placeholder={t("writerView.writingFrame.placeholder")}
                />
                <Button css={SubmitWritingButton(theme)} variant="contained">Submit Writing</Button>
            </div>
        </Card>
    )
};
const typingFieldStyle = (theme: Theme) => css`
    background-color: ${theme.palette.background.paper};
    margin: 8px;
    width: 90%;
`

const typingAreaStyle = (theme: Theme) => css`
    flex-direction: column;
    width: 100%;
`

const WritingFrameStyle = (theme: Theme) =>css`
    background-color: ${theme.palette.primary.contrastText};
    height: 100%;
    width: 100%;
    display: flex;
    
    flex-direction: row;
    
    align-items: start;
    justify-content: center;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
    
    @media (max-width: 600px) {
        flex-direction: column; /* 縦並びにする */
    }
`;

const SubmitWritingButton = (theme: Theme) => css`
    background-color: ${theme.palette.secondary.dark};
    margin: 16px;
    &:hover {
        background-color: ${theme.palette.secondary.light};
    }
`;