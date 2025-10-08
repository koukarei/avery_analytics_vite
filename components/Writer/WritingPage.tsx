/** @jsxImportSource @emotion/react */
import React, {useContext, useEffect, useState, useRef } from "react";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { WritingFrame } from "./WritingFrame";
import { PastWritingsBar, PastWritingModal } from "./PastWritingFrame";
import type { GalleryView } from "../../types/ui";
import type { Leaderboard } from "../../types/leaderboard";
import { LoadingSpinner } from "../Common/LoadingSpinner";
import { ErrorDisplay } from "../Common/ErrorDisplay";
import Alert from '@mui/material/Alert';
import { LeaderboardPlayableContext } from "../../providers/LeaderboardProvider";

import { socketCls } from "./socketCls";

import { base64ToBlob } from "../../util/convertBase64";
import { useLocalization } from '../../contexts/localizationUtils';

import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import {theme} from "../../src/Theme";

interface WritingPageProps {
    setView: (view: GalleryView) => void;
    leaderboard: Leaderboard | null;
    imageUrl: string | null;
}


export const WritingPage: React.FC<WritingPageProps> = ({ setView, leaderboard, imageUrl }) => {
    const [writingText, setWritingText] = useState("");
    const [isPlayable, setPlayable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    
    const [roundId, _setRoundId] = useState<number>(0);
    const [generation_ids, _setGenerationIds] = useState<number[]>([]);
    const [writingGenerationId, _setWritingGenerationId] = useState<number | null>(null);
    const [selectedGenerationId, setSelectedGenerationId] = useState<number | null>(null);
    const [generationTime, _setGenerationTime] = useState<number>(0);
    const [leaderboardImage, setLeaderboardImage] = useState<string | null>(imageUrl);

    const [showWarning, setShowWarning] = useState(false);
    const [warningMsg, setWarningMsg] = useState<string>("");

    const [isPastWritingModalOpen, setIsPastWritingModalOpen] = useState(false);

    const [userAction, setUserAction] = useState<'none' | 'start' | 'resume' | 'hint' | 'submit' | 'evaluate' | 'end'>('resume');

    const { fetchLeaderboard } = useContext(LeaderboardPlayableContext);
    const wsClientRef = useRef<socketCls | null>(null);
    const { t } = useLocalization();
    

    const handleClickPastWritingIcon = (
        index: number
    ) => {
        setIsPastWritingModalOpen(true);
        setSelectedGenerationId(generation_ids[index]);
    }

    const handleSubmitWriting = () => {
        if (writingText.trim() === '') {
            setWarningMsg(t('writing.warning.empty'));
            setShowWarning(true);
            return;
        }

        if ( generationTime > 5 || isPlayable === false ) {
            setWarningMsg(t('writing.warning.time_exceeded'));
            setShowWarning(true);
            return;
        }
        setIsLoading(true);
        setUserAction('submit');
        return;
    };

    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);
            try {
                if (leaderboard) {
                    const program = sessionStorage.getItem('program') || 'none';
                    fetchLeaderboard(leaderboard.id, program).then((playableData) => {
                        if (playableData) {
                            setPlayable(playableData.is_playable);
                        }
                    }).catch(e => {
                        console.error('Failed to fetch leaderboard playable:', e)
                    });
                }
            } catch (e) {
                setErrorKey("error.FetchingLeaderboardPlayable");
                console.log(e);
            } finally {
                setIsLoading(false);
            }
    }, [leaderboard?.id]);
    
    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);

        try {
            if (leaderboard && isPlayable) {
                if (wsClientRef.current === null) {
                    wsClientRef.current = new socketCls(leaderboard.id);
                }
                let obj= null;
                wsClientRef.current.currentAction = userAction;
                switch (userAction) {
                    case 'start':
                        obj = {
                            leaderboard_id: leaderboard ? leaderboard.id : 0,
                            model: 'gpt-4o-mini',
                            program: sessionStorage.getItem('program') || 'none',
                            created_at: new Date(),
                        }
                        break
                    case 'resume':
                        obj = {
                            leaderboard_id: leaderboard ? leaderboard.id : 0,
                            model: 'gpt-4o-mini',
                            program: sessionStorage.getItem('program') || 'none',
                            created_at: new Date(),
                        }
                        break
                    case 'hint':
                        obj = {
                            content: 'ヒントをちょうだい',
                            created_at: new Date(),
                            is_hint: true,
                        }
                        break;
                    case 'submit':
                        obj = {
                            leaderboard_id: leaderboard ? leaderboard.id : 0,
                            round_id: roundId,
                            created_at: new Date(),
                            generated_time: generationTime,
                            sentence: writingText
                        }
                        break
                    case 'evaluate':
                        break
                    case 'end':
                        break
                    default:
                        obj = null
                        break
                    }

                wsClientRef.current.send_user_action(obj ? obj : undefined);

                wsClientRef.current.receive_response().then((data)=>{
                console.log("response received in writing page: ", data);
                switch (userAction) {
                    case 'start':{
                        if (data) {
                            const pastGenerationIds = data.past_generation_ids && data.writing_generation_id ? data.past_generation_ids.filter(gid => gid !== writingGenerationId) : [];
                            _setGenerationIds([...pastGenerationIds])
                            _setRoundId(data.round_id ? data.round_id : 0);
                            _setWritingGenerationId(data.writing_generation_id ? data.writing_generation_id : null)
                            _setGenerationTime(data.generation_time ? data.generation_time : 0)
                            const blob = base64ToBlob(data.leaderboard_image);
                            const blobUrl = URL.createObjectURL(blob);
                            setLeaderboardImage(blobUrl);

                        }
                        break;
                    }
                    case 'resume':{
                        if (data) {
                            const pastGenerationIds = data.past_generation_ids && data.writing_generation_id ? data.past_generation_ids.filter(gid => gid !== writingGenerationId) : [];
                            _setGenerationIds([...pastGenerationIds])
                            _setRoundId(data.round_id ? data.round_id : 0);
                            _setWritingGenerationId(data.writing_generation_id ? data.writing_generation_id : null)
                            _setGenerationTime(data.generation_time ? data.generation_time : 0)
                            
                            const blob = base64ToBlob(data.leaderboard_image);
                            const blobUrl = URL.createObjectURL(blob);
                            setLeaderboardImage(blobUrl);

                        }
                        break;
                    }
                    case 'submit': {
                        if (data) {
                            const messages = data.chat_messages;
                            if (messages.length > 0 ? messages[messages.length - 1].content.startsWith("ブー！") : false){
                                // remind user to type in English or language of choice
                                setWarningMsg(messages.length > 0 ? messages[messages.length - 1].content : "");
                                setShowWarning(true);
                                break;
                            } else {
                                _setGenerationIds(prev => writingGenerationId ? [writingGenerationId, ...prev] : prev);
                                setSelectedGenerationId(writingGenerationId);
                                setIsPastWritingModalOpen(true);
                                setUserAction('evaluate');
                                break;
                            }
                        }
                        break;
                    }
                    case 'evaluate': {
                        if (data.generation_time === 5) {
                            setUserAction('end');
                        }
                        break;
                    }
                    default:
                        break;
                }})
                .catch(e => {
                    console.error('Error receiving response:', e);
                    setErrorKey("error.ReceivingGenerationDetail");
                });

                }
            

            return () => {
                if (wsClientRef.current === null) return;
            }
        
        } catch (e) {
            setErrorKey("error.FetchingGenerationDetail");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    }, [isPlayable, userAction]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
    }
    
    return (
        <div>
            <div className="bg-neutral-900 flex-col md:flex-row items-center">
                <div className="h-1/8 w-full">
                    <button css={backButtonStyle(theme)} onClick={ () => setView('browsing') }>
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    { showWarning ? <Alert severity="warning">{warningMsg}</Alert> : null }
                    <PastWritingsBar 
                        generation_ids={generation_ids} 
                        onClick={handleClickPastWritingIcon}
                    />
                    <PastWritingModal
                        generation_id={selectedGenerationId}
                        isOpen={isPastWritingModalOpen}
                        onClose={() => setIsPastWritingModalOpen(false)}
                    />
                </div>
                <div className="h-7/8 w-full">
                <WritingFrame
                    title={leaderboard ? leaderboard.title : t('writerView.writingFrame.noLeaderboard')}
                    imageUrl={leaderboardImage ? leaderboardImage : ''}
                    writingText={writingText}
                    setWritingText={setWritingText}
                    submitWritingFn={handleSubmitWriting}
                />
                </div>
            </div>
        </div>
    );
};


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