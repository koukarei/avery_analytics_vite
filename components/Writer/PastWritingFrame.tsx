/** @jsxImportSource @emotion/react */

import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { blueGrey } from '@mui/material/colors';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import React, { useState, useContext, useEffect } from 'react';
import { css, keyframes } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import {theme} from "../../src/Theme";
import { Button } from '@mui/material';

import { useLocalization } from '../../contexts/localizationUtils';
import { MarkdownEvalViewer } from '../../util/showMD';
import { compareWriting } from '../../util/CompareWriting';

import { LoadingSpinner } from '../Common/LoadingSpinner';

import { GenerationDetailContext, GenerationImageContext, GenerationEvaluationContext } from '../../providers/GenerationProvider';
import type { GenerationDetail } from '../../types/studentWork';

interface PastWritingsProps {
  generation_ids: number[];
  onClick: (generation_id: number) => void; // pass generation id into handler
  getBack: () => void;
  loadingGenerationIds: number[]; // New prop to indicate loading state for specific IDs
}

interface PastWritingModalProps {
  generation_id: number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PastWritingContentProps {
  generation_id: number | null;
}

const PastWritingContent: React.FC<PastWritingContentProps> = ({ 
  generation_id, 
}) => {
    const [showImage, setShowImage] = useState(false);
    const [showAWE, setShowAWE] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [aWEText, setAWEText] = useState<string | null>(null);
    const [detailData, setDetailData] = useState<GenerationDetail | null>(null);
    const { t } = useLocalization();

    const {fetchDetail} = useContext(GenerationDetailContext);
    const {fetchImage} = useContext(GenerationImageContext);
    
    const {fetchEvaluation} = useContext(GenerationEvaluationContext);

    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);
        const fetch = async (): Promise<void> => {
        try {
            const [detailData, imageData, evaluationData] = await Promise.all(
                [
                    generation_id ? fetchDetail(generation_id) : Promise.resolve(null),
                    showImage && generation_id ? fetchImage({generation_id}) : Promise.resolve(null),
                    showAWE && generation_id ? fetchEvaluation(generation_id) : Promise.resolve(null),
                ]
            )
            if (detailData) {
                setDetailData(detailData);
            }
            if (imageData && imageData) {
                setImageUrl(imageData);
            }
            if (evaluationData && evaluationData.content) {
                setAWEText(evaluationData.content);
            }
        } catch (e) {
            console.error("Failed to fetch generation detail: ", e);
            setErrorKey("error.FetchingGenerationDetail");
        } finally {
            setIsLoading(false);
        }
        };
        fetch();
    }, [generation_id, showImage, showAWE]);

    const handleClickShowImage = () => {
        setShowImage(!showImage);
    };
    const handleClickShowAWE = () => {
        setShowAWE(!showAWE);
    };
        
    return (
        <Card sx={style}>
            <CardHeader 
                title={t("writerView.pastWritingFrame.pastWritingDetails")}
            />
            <CardContent sx={modalCardContentStyle}>
                <Box mb={2}>
                    {detailData ? (
                        compareWriting(detailData.sentence, detailData.correct_sentence)
                    ) : "No writing detail available."}
                </Box>
                <Box>
                    {isLoading && <LoadingSpinner />}
                </Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    {t("writerView.pastWritingFrame.clickButtonsBelow")}
                </Box>
                <Button
                    css={buttonStyle(theme)}
                    disabled={!detailData || detailData.interpreted_image === undefined || detailData.interpreted_image?.id === undefined}
                    onClick={handleClickShowImage}
                >
                    {showImage ? t("writerView.pastWritingFrame.hideImage") : t("writerView.pastWritingFrame.showImage")}
                </Button>
                <Button
                    css={buttonStyle(theme)}
                    disabled={!detailData || detailData.evaluation_id === null}
                    onClick={handleClickShowAWE}
                >
                    {showAWE ? t("writerView.pastWritingFrame.hideAWE") : t("writerView.pastWritingFrame.showAWE")}
                </Button>
                <Box mt={2}>
                    {showAWE ? (
                        <MarkdownEvalViewer content={aWEText ? aWEText : ""} />
                    ) : null }
                </Box>
                <Box mt={2}>
                    {showImage && imageUrl ? (
                        <img src={imageUrl ? imageUrl : ""} alt="Generated" style={{ maxWidth: '100%' }} />
                    ) : null}
                </Box>
                <Box>
                    {errorKey && <p style={{ color: 'red' }}>{errorKey}</p>}
                </Box>
            </CardContent>
        </Card>
    );
};

const PastWritingModal: React.FC<PastWritingModalProps> = ({ 
  generation_id, 
  isOpen,
  onClose
}) => {

    const handleClose = () => {
        onClose();
        };
        
    return (
        <React.Fragment>
            <Modal
                css={backgroundStyle(theme)}
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="past-writing-modal"
                aria-describedby={`modal-modal-${generation_id}`}
            >
                <Box sx={modalContainerStyle}>
                    <PastWritingContent generation_id={generation_id} />
                </Box>
            </Modal>
        </React.Fragment>
    );
};

interface PastWritingIconProps {
    index: number;
    idx: number; //
    onClick: (generation_id: number) => void;
    loadingGenerationIds: number[];
}

const PastWritingIcon: React.FC<PastWritingIconProps> = ({ 
    index, idx, onClick, loadingGenerationIds
}) => {
    const paletteKeys = [50, 100, 300, 500, 700, 900];
    const color = blueGrey[paletteKeys[index % paletteKeys.length] as keyof typeof blueGrey];
    // derive states directly from props to avoid stale closure
    const isSpinning = loadingGenerationIds.includes(idx);
    const isDisabled = isSpinning;
    const handleClick = () => onClick(idx);
 
     return (
         <Avatar css={pastWritingIconStyle(isSpinning)} sx={{ bgcolor: color }}>
             <Button
                 disabled={isDisabled}
                 onClick={handleClick}
             >
                 {index + 1}
             </Button>
         </Avatar>
     )
}
const PastWritingsBar: React.FC<PastWritingsProps> = ({ generation_ids, onClick, getBack, loadingGenerationIds }) => {
 
     return (
         <Box className='flex flex-nowrap justify-start flex-row'>
             <Stack direction="row" spacing={1}>
                 <Button css={backButtonStyle(theme)} onClick={getBack}>
                     <ArrowBackIosIcon id="back-gallery-button-icon" fontSize="small" />
                 </Button>
                {generation_ids.map((generation_id, index) => (
                  <PastWritingIcon
                    key={`${generation_id}-${index}`}
                    index={index}
                    idx={generation_id}
                    onClick={onClick}
                    loadingGenerationIds={loadingGenerationIds}
                  />
                ))}
             </Stack>
         </Box>
     );
 }

const style = {
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const buttonStyle = (theme: Theme) => css`
    background-color: ${theme.palette.primary.dark};
    color: ${theme.palette.primary.contrastText};
    margin: 8px;
    border-radius: 4px;
    &:hover {
        background-color: ${theme.palette.primary.light};
    }
`;

const backButtonStyle = (theme: Theme) => css`
  color: white;
  font-weight: 700;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 0.8rem;
  padding-right: 0.5rem;
  border-radius: calc(infinity * 1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  background-color: ${theme.palette.primary.main};
  &:hover {
    background-color: ${theme.palette.primary.light};
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pastWritingIconStyle = (isSpinning: boolean) =>css`
  animation: ${isSpinning ? spin : ''} 1s linear infinite;
`;

export { PastWritingsBar, PastWritingModal };


const backgroundStyle = (theme: Theme) => css`
  position: fixed;
  inset: 0;
  color: ${theme.palette.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: opacity 0.3s ease-in-out;
`;

const modalContainerStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '800px',
  maxHeight: 'calc(100vh - 80px)', // leave some space for top/bottom
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 0,
  outline: 'none',
};

const modalCardContentStyle = {
  px: 2,
  pb: 2,
  pt: 1,
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 200px)', // safe scroll area inside the card
};