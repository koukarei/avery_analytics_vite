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
import ImageIcon from '@mui/icons-material/Image';
import HideImageIcon from '@mui/icons-material/HideImage';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';

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
  feedback: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PastWritingContentProps {
  generation_id: number | null;
  feedback: string | null;
}

interface GenerationFeedbackProps {
    needIMG: boolean;
    needAWE: boolean;
    feedbackLoading: boolean;
    showImage: boolean;
    imageUrl: string | null;
    showAWE: boolean;
    aWEText: string | null;
    imgFeedbackLoaded: boolean;
    aweFeedbackLoaded: boolean;
    handleClickShowImage: () => void;
    handleClickShowAWE: () => void;
}

const GenerationFeedback: React.FC<GenerationFeedbackProps> = ({ 
    needIMG,
    needAWE,
    feedbackLoading,
    showImage,
    imageUrl,
    showAWE,
    aWEText,
    imgFeedbackLoaded,
    aweFeedbackLoaded,
    handleClickShowImage,
    handleClickShowAWE
 }) => {
    const { t } = useLocalization();

    if (feedbackLoading) {
        return <LoadingSpinner />;
    }

    if (!needIMG && !needAWE) {
        return <Box>{t("writerView.pastWritingFrame.noFeedbackRequested")}</Box>;
    }

    if (needIMG && !needAWE) {
        return (
        <>
            <Box mt={2}>
                {showImage && imageUrl ? (
                    <img src={imageUrl ? imageUrl : ""} alt="Generated" style={{ maxWidth: '100%' }} />
                ) : null}
            </Box>
        </>
        );
    }

    if (!needIMG && needAWE) {
        return (
        <>
            <Box mt={2}>
                {showAWE ? (
                    <MarkdownEvalViewer content={aWEText ? aWEText : ""} />
                ) : null }
            </Box>
        </>
        );
    }

    return (
        <>
            <Button
                css={showImage && imageUrl ? hideButtonStyle(theme) : showButtonStyle(theme)}
                disabled={!imgFeedbackLoaded}
                onClick={handleClickShowImage}
            >
                {showImage ? <HideImageIcon /> : <ImageIcon />}
                {showImage ? t("writerView.pastWritingFrame.hideImage") : t("writerView.pastWritingFrame.showImage")}
            </Button>
            <Button
                css={showAWE ? hideButtonStyle(theme) : showButtonStyle(theme)}
                disabled={!aweFeedbackLoaded}
                onClick={handleClickShowAWE}
            >
                {showAWE ? <SpeakerNotesOffIcon /> : <SpeakerNotesIcon />}
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
        </>
    )
};

const PastWritingContent: React.FC<PastWritingContentProps> = ({ 
  generation_id, 
  feedback
}) => {
    const [showImage, setShowImage] = useState(false);
    const [showAWE, setShowAWE] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [aWEText, setAWEText] = useState<string | null>(null);
    const [detailData, setDetailData] = useState<GenerationDetail | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [imgFeedbackLoaded, setImgFeedbackLoaded] = useState(false);
    const [aweFeedbackLoaded, setAweFeedbackLoaded] = useState(false);

    const { t } = useLocalization();

    const {fetchDetail} = useContext(GenerationDetailContext);
    const {fetchImage} = useContext(GenerationImageContext);
    
    const {fetchEvaluation} = useContext(GenerationEvaluationContext);

    // retry / polling refs to limit attempts
    const imgAttemptsRef = React.useRef(0);
    const aweAttemptsRef = React.useRef(0);
    const imgCancelRef = React.useRef(false);
    const aweCancelRef = React.useRef(false);

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

    // Poll for interpreted image up to 5 times when feedback requests IMG
    useEffect(() => {
        imgAttemptsRef.current = 0;
        imgCancelRef.current = false;
        setImgFeedbackLoaded(false);

        if (!feedback || !feedback.includes("IMG") || !generation_id) return;

        const pollImg = async () => {
            // already satisfied from existing detailData
            if (detailData && (detailData.interpreted_image !== undefined && detailData.interpreted_image?.id !== undefined)) {
                setImgFeedbackLoaded(true);
                return;
            }

            if (imgAttemptsRef.current >= 5) {
                // give up after 5 tries
                return;
            }
            imgAttemptsRef.current++;

            try {
                const d = await fetchDetail(generation_id);
                if (imgCancelRef.current) return;
                if (d) setDetailData(d);
                if (d && (d.interpreted_image !== undefined && d.interpreted_image?.id !== undefined)) {
                    setImgFeedbackLoaded(true);
                    return;
                }
            } catch (e) {
                // ignore and retry until limit
                console.error('pollImg fetchDetail error', e);
            }

            if (!imgCancelRef.current) {
                window.setTimeout(pollImg, 1000);
            }
        };

        pollImg();

        return () => { imgCancelRef.current = true; };
    }, [feedback, generation_id, fetchDetail, detailData]);

    // Poll for evaluation up to 5 times when feedback requests AWE
    useEffect(() => {
        aweAttemptsRef.current = 0;
        aweCancelRef.current = false;
        setAweFeedbackLoaded(false);

        if (!feedback || !feedback.includes("AWE") || !generation_id) return;

        const pollAwe = async () => {
            if (detailData && detailData.evaluation_id !== null) {
                setAweFeedbackLoaded(true);
                return;
            }

            if (aweAttemptsRef.current >= 5) {
                return;
            }
            aweAttemptsRef.current++;

            try {
                const d = await fetchDetail(generation_id);
                if (aweCancelRef.current) return;
                if (d) setDetailData(d);
                if (d && d.evaluation_id !== null) {
                    setAweFeedbackLoaded(true);
                    return;
                }
            } catch (e) {
                console.error('pollAwe fetchDetail error', e);
            }

            if (!aweCancelRef.current) {
                window.setTimeout(pollAwe, 1000);
            }
        };

        pollAwe();

        return () => { aweCancelRef.current = true; };
    }, [feedback, generation_id, fetchDetail, detailData]);

    // derive feedbackLoading from requested feedback + loaded flags
    useEffect(() => {
        if (!feedback) {
            setFeedbackLoading(false);
            return;
        }
        const needsImg = feedback.includes("IMG");
        const needsAwe = feedback.includes("AWE");

        const imgReady = !needsImg || imgFeedbackLoaded;
        const aweReady = !needsAwe || aweFeedbackLoaded;

        

        setFeedbackLoading(!(imgReady && aweReady));
    }, [feedback, imgFeedbackLoaded, aweFeedbackLoaded]);


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
                        detailData.sentence
                        // compareWriting(detailData.sentence, detailData.correct_sentence)
                    ) : "No writing detail available."}
                </Box>
                <Box>
                    {(isLoading) && <LoadingSpinner />}
                </Box>
                <Box css={instructionStyle} sx={{ borderTop: 1, borderColor: 'divider' }}>
                    {t("writerView.pastWritingFrame.clickButtonsBelow")}
                </Box>
                <GenerationFeedback
                    needIMG={feedback ? feedback.includes("IMG") : false}
                    needAWE={feedback ? feedback.includes("AWE") : false}
                    feedbackLoading={feedbackLoading}
                    showImage={showImage}
                    imageUrl={imageUrl}
                    showAWE={showAWE}
                    aWEText={aWEText}
                    imgFeedbackLoaded={imgFeedbackLoaded}
                    aweFeedbackLoaded={aweFeedbackLoaded}
                    handleClickShowImage={handleClickShowImage}
                    handleClickShowAWE={handleClickShowAWE}
                />
                <Box>
                    {errorKey && <p style={{ color: 'red' }}>{errorKey}</p>}
                </Box>
            </CardContent>
        </Card>
    );
};

const PastWritingModal: React.FC<PastWritingModalProps> = ({ 
  generation_id, 
  feedback,
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
                    <PastWritingContent generation_id={generation_id} feedback={feedback} />
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
    const contrastColor = blueGrey[paletteKeys[(index + 3) % paletteKeys.length] as keyof typeof blueGrey];
    const [isHovered, setIsHovered] = useState(false);
    // derive states directly from props to avoid stale closure
    const isSpinning = loadingGenerationIds.includes(idx);
    const isDisabled = isSpinning;
    const handleClick = () => {
        if (!isDisabled) {
            onClick(idx);
        }
    };
    const handleHover = (isHovered: boolean) => {
        if (isHovered && !isDisabled) {
            return { bgcolor: contrastColor, color: color, border: `2px solid ${color}` };
        }
        return { bgcolor: color, color: contrastColor };
    };
 
    return (
        <Box
            mx={0.5}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <Avatar
                css={pastWritingIconStyle(isSpinning)}
                sx={handleHover(isHovered)}
            >
                <Button
                    disabled={isDisabled}
                    sx={{ color: isDisabled ? theme.palette.text.secondary : isHovered ? color : contrastColor }}
                >
                        {index + 1}
                </Button>
            </Avatar>
        </Box>

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

const showButtonStyle = (theme: Theme) => css`
    background-color: ${theme.palette.primary.dark};
    color: ${theme.palette.primary.contrastText};
    margin: 8px;
    border-radius: 4px;
    &:hover {
        background-color: ${theme.palette.background.paper};
        color: ${theme.palette.text.primary};
        border: 2px solid ${theme.palette.primary.dark};
    }
`;

const hideButtonStyle = (theme: Theme) => css`
    background-color: ${theme.palette.background.paper};
    color: ${theme.palette.text.primary};
    margin: 8px;
    border-radius: 4px;
    border: 2px solid ${theme.palette.primary.dark};
    &:hover {
        background-color: ${theme.palette.primary.dark};
        color: ${theme.palette.primary.contrastText};
    }
`;

const backButtonStyle = (theme: Theme) => css`
  color: ${theme.palette.primary.main};
  font-weight: 100;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 0rem;
  padding-right: 0rem;
  align-items: center;
  justify-content: center;
  border-radius: calc(infinity * 1px);
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  background-color: ${theme.palette.background.paper};
  &:hover {
    background-color: ${theme.palette.primary.light};
    color: ${theme.palette.background.paper};
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

const instructionStyle = css`
    font-size: 0.875rem;
    font-style: italic;
`;
