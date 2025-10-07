import React, {useContext, useEffect, useState} from "react";
import { WritingFrame } from "./WritingFrame";
import { PastWritingsBar, PastWritingModal } from "./PastWritingFrame";
import type { GalleryView } from "../../types/ui";
import type { Leaderboard } from "../../types/leaderboard";
import type { websocketRequest, websocketResponse } from "../../types/websocketAPI";
import { LoadingSpinner } from "../Common/LoadingSpinner";
import { ErrorDisplay } from "../Common/ErrorDisplay";
import Alert from '@mui/material/Alert';
import { LeaderboardPlayableContext } from "../../providers/LeaderboardProvider";

import { WsContext } from "../../providers/WsProvider";

import { WebSocketClient } from "../../util/websocketClient";
import { useLocalization } from '../../contexts/localizationUtils';


interface WritingPageProps {
    setView: (view: GalleryView) => void;
    leaderboard: Leaderboard | null;
    imageUrl: string | null;
}


export const WritingPage: React.FC<WritingPageProps> = ({ setView, leaderboard, imageUrl }) => {
    const [writingText, setWritingText] = useState("");
    const [isPlayable, setPlayable] = useState(true);
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

    const [userAction, setUserAction] = useState<'start' | 'resume' | 'hint' | 'submit' | 'evaluate' | 'end'>('start');

    const { fetchWsToken } = useContext(WsContext);
    const { fetchLeaderboard } = useContext(LeaderboardPlayableContext);
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
        if ( isLoading ) {
            setWarningMsg(t('writing.warning.loading'));
            setShowWarning(true);
            return;
        }

        if ( generationTime > 5) {
            setWarningMsg(t('writing.warning.time_exceeded'));
            setShowWarning(true);
            return;
        }
        
        else {
            setUserAction('submit');
        }
    };
    
    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);
        try {
            if (leaderboard) {
                const getPlayableData = async () => {
                    const playableData = await fetchLeaderboard(
                        leaderboard.id, sessionStorage.getItem('program') || 'none'
                    )
                    if (playableData) {
                        setPlayable(playableData.is_playable);
                    }
                }
                getPlayableData();
            }
        } catch (e) {
            setErrorKey("error.FetchingLeaderboardPlayable");
            console.log(e);
        }
        try {
            if (leaderboard && isPlayable) {
                // #fetch WebSocket token and connect to WebSocket server
                fetchWsToken().then((wsTokenResponse ) => {
                            if (wsTokenResponse) {
                                    // import.meta.env typing varies by build; access via cast
                                    const wsLink = (import.meta as unknown as { env: { VITE_WS_URL: string } }).env.VITE_WS_URL + `/${leaderboard.id}?token=${wsTokenResponse.ws_token}`;
                                    console.log("Connecting to WebSocket URL: ", wsLink);
                                    // create WebSocket client
                                    const client = new WebSocketClient({urls: [wsLink]});
                                    client.open();

                                    // prepare message for the start action
                                    let message: websocketRequest | null = null
                                    switch (userAction) {
                                        case 'start':
                                            message = {
                                                action: 'start',
                                                program: sessionStorage.getItem('program') || 'none',
                                                obj: {
                                                    leaderboard_id: leaderboard ? leaderboard.id : 0,
                                                    model: 'gpt-4o-mini',
                                                    program: sessionStorage.getItem('program') || 'none',
                                                    created_at: new Date(),
                                                }
                                            }
                                            break
                                        case 'submit':
                                            message = {
                                                action: 'submit',
                                                program: sessionStorage.getItem('program') || 'none',
                                                obj: {
                                                    leaderboard_id: leaderboard ? leaderboard.id : 0,
                                                    round_id: roundId,
                                                    created_at: new Date(),
                                                    generated_time: generationTime,
                                                    sentence: writingText
                                                }
                                            }
                                            break
                                        case 'evaluate':
                                            message = {
                                                action: 'evaluate'
                                            }
                                            break
                                        case 'end':
                                            message = {
                                                action: 'end'
                                            }
                                            break
                                        default:
                                            message = null
                                            break
                                    }

                                    // send message (if prepared). WebSocketClient will queue until ready.
                                    if (message) {
                                      client.send(wsLink, message)
                                    }

                                    // subscribe to messages for this url
                                    // subscriber receives unknown; cast to websocketResponse for our usage
                                    const onMessage = (data: unknown) => {
                                        const parsed = data as websocketResponse
                                        console.log('WebSocket response data: ', parsed)
                                        
                                        switch (userAction) {
                                            case 'start':{
                                                if (parsed.round && parsed.generation && parsed.leaderboard) {
                                                        const pastGenerationIds = parsed.round.generations && parsed.generation.id ? parsed.round.generations.filter(gid => gid !== parsed.generation?.id) : [];
                                                        _setRoundId(parsed.round.id)
                                                        _setGenerationIds(pastGenerationIds)
                                                        _setWritingGenerationId(parsed.generation ? parsed.generation.id : null)
                                                        _setGenerationTime(parsed.generation && parsed.generation.generated_time ? parsed.generation.generated_time : 0)
                                                        if (leaderboardImage === null && parsed.leaderboard) {
                                                            const blob = new Blob([parsed.leaderboard.image], { type: 'image/png' });
                                                            setLeaderboardImage(URL.createObjectURL(blob));
                                                        }
                                                    }
                                                break;
                                                }
                                            case 'submit': {
                                                if (parsed.generation && parsed.chat && parsed.chat.messages) {
                                                    if (parsed.chat.messages.length > 0 ? parsed.chat.messages[parsed.chat.messages.length - 1].content.startsWith("ブー！") : false){
                                                        // remind user to type in English or language of choice
                                                        setWarningMsg(parsed.chat.messages.length > 0 ? parsed.chat.messages[parsed.chat.messages.length - 1].content : "");
                                                        setShowWarning(true);
                                                        break;
                                                    } else {
                                                        setSelectedGenerationId(writingGenerationId);
                                                        _setGenerationIds(prev => writingGenerationId ? [writingGenerationId, ...prev] : prev);
                                                        setIsPastWritingModalOpen(true);
                                                        setUserAction('evaluate');
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                            case 'evaluate': {
                                                if (parsed.round && parsed.round.generated_time) {
                                                    if (parsed.round.generated_time > 5) {
                                                        setUserAction('end');
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                        
                                    
                                    client.subscribe(wsLink, onMessage)

                                    // Disconnect when user closes the tab or browser
                                    const handleBeforeUnload = () => client.close()
                                    window.addEventListener('beforeunload', handleBeforeUnload)

                                    return () => {
                                        client.unsubscribe(wsLink, onMessage)
                                        window.removeEventListener('beforeunload', handleBeforeUnload)
                                        client.close();
                                    }
                                }
                });
            }

        } catch (e) {
            setErrorKey("error.FetchingGenerationDetail");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    }, [isPlayable, leaderboardImage, userAction]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
    }
    
    return (
        <div className="bg-neutral-900 flex-col md:flex-row items-center">
            <div className="h-1/8 w-full">
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
            <div className="h-7/8">
            <WritingFrame
                imageUrl={leaderboardImage ? leaderboardImage : ''}
                writingText={writingText}
                setWritingText={setWritingText}
                submitWritingFn={handleSubmitWriting}
                setView={ () => setView('browsing') }
            />
            </div>
        </div>
    );
};