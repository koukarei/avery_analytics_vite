import React, {useContext, useEffect, useState, useRef } from "react";
import { WritingFrame } from "./WritingFrame";
import { PastWritingsBar, PastWritingModal } from "./PastWritingFrame";
import type { GalleryView } from "../../types/ui";
import type { Leaderboard } from "../../types/leaderboard";
import { LoadingSpinner } from "../Common/LoadingSpinner";
import { ErrorDisplay } from "../Common/ErrorDisplay";
import Alert from '@mui/material/Alert';
import { LeaderboardStartNewContext } from "../../providers/LeaderboardProvider";

import { socketCls } from "./socketCls";

import { base64ToBlob } from "../../util/convertBase64";
import { useLocalization } from '../../contexts/localizationUtils';

interface WritingPageProps {
    setView: (view: GalleryView) => void;
    leaderboard: Leaderboard | null;
    imageUrl: string | null;
}

interface WritingProps {
    title: string;
    imageUrl: string;
    toStartNew: boolean;
    setToStartNew: (toStartNew: boolean) => void;
    leaderboard_id: number;
    generationIds: number[];
    setGenerationIds: (ids: number[]) => void;
    setFeedback: (feedback: string) => void;
    loadingGenerationIds: number[];
    setLoadingGenerationIds: (ids: number[]) => void;
    writingGenerationId: number | null;
    setWritingGenerationId: (id: number | null) => void;
    setIsEvaluationModalOpen: (isOpen: boolean) => void;
    setWarningMsg: (msg: string) => void;
    setReceivedResponse: (response: string) => void;
}

interface BrowseWritingProps {
    setView: (view: GalleryView) => void;
    feedback: string;
    generation_ids: number[];
    loadingGenerationIds: number[];
    writingGenerationId: number | null;
    isEvaluationModalOpen: boolean;
    setIsEvaluationModalOpen: (isOpen: boolean) => void;
    warningMsg: string;
    receivedResponse: string;
}

export const Writing: React.FC<WritingProps> = ({ 
    title,
    imageUrl,
    toStartNew,
    setToStartNew,
    leaderboard_id,
    generationIds,
    setGenerationIds,
    setFeedback,
    loadingGenerationIds,
    setLoadingGenerationIds,
    writingGenerationId,
    setWritingGenerationId,
    setIsEvaluationModalOpen,
    setWarningMsg,
    setReceivedResponse
}) => {
    const [writingText, setWritingText] = useState("");
    const [roundDisplayName, setRoundDisplayName] = useState<string | undefined>(undefined);
    const [showAsAnonymous, setShowAsAnonymous] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [generatingLoading, setGeneratingLoading] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    
    const [roundId, _setRoundId] = useState<number>(0);
    const [generationTime, _setGenerationTime] = useState<number>(0);
    const [leaderboardImage, setLeaderboardImage] = useState<string | null>(imageUrl);

    const [userAction, setUserAction] = useState<'none' | 'start' | 'resume' | 'hint' | 'change_display_name' | 'submit' | 'evaluate' | 'end'>('none');

    const wsClientRef = useRef<socketCls | null>(null);
    const { t } = useLocalization();
    
    const handleSubmitWriting = () => {
        setIsLoading(true);
        setGeneratingLoading(true);
        if ( generationTime > 5 || toStartNew === false ) {
            setWarningMsg(t('writerView.writing.warning.time_exceeded'));
            setIsLoading(false);
            setGeneratingLoading(false);
            return;
        }
        setUserAction('submit');
        setReceivedResponse(t('writerView.writing.response.generating'));
        return;
    };
    
    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);
        try{
           
            if (wsClientRef.current === null) {
                if (toStartNew) {
                    setUserAction('start');
                } else {
                    setUserAction('resume');
                }
                wsClientRef.current = new socketCls(leaderboard_id);
            }
            let obj= null;
            wsClientRef.current.currentAction = userAction;
            switch (userAction) {
                case 'start':
                    obj = {
                        leaderboard_id: leaderboard_id,
                        model: 'gpt-4o-mini',
                        program: sessionStorage.getItem('program') || 'none',
                        created_at: new Date(),
                    }
                    break
                case 'resume':
                    obj = {
                        leaderboard_id: leaderboard_id,
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
                case 'change_display_name':
                    obj = {
                        id: roundId,
                        display_name: showAsAnonymous ? undefined : roundDisplayName,
                    }
                    break;
                case 'submit':
                    obj = {
                        leaderboard_id: leaderboard_id,
                        round_id: roundId,
                        created_at: new Date(),
                        generated_time: generationTime,
                        sentence: writingText
                    }
                    break
                case 'evaluate':
                    setLoadingGenerationIds(writingGenerationId ? [...loadingGenerationIds, writingGenerationId]:loadingGenerationIds)
                    setGenerationIds(writingGenerationId ? [...generationIds, writingGenerationId] : generationIds);
                    break
                case 'end':
                    break
                default:
                    obj = null
                    break
                }

            wsClientRef.current.send_user_action(obj ? obj : undefined);

            wsClientRef.current.receive_response().then((data)=>{
            switch (userAction) {
                case 'start':{
                    if (data) {
                        const pastGenerationIds = data.past_generation_ids && data.writing_generation_id ? data.past_generation_ids.filter(gid => gid !== writingGenerationId) : [];
                        setGenerationIds([...pastGenerationIds])
                        _setRoundId(data.round_id ? data.round_id : 0);
                        setWritingGenerationId(data.writing_generation_id ? data.writing_generation_id : null)
                        _setGenerationTime(data.generation_time ? data.generation_time : 0)
                        const blob = base64ToBlob(data.leaderboard_image);
                        const blobUrl = URL.createObjectURL(blob);
                        setLeaderboardImage(blobUrl);
                        setFeedback(data.feedback ? data.feedback : "");

                    }
                    setUserAction('none');
                    break;
                }
                case 'resume':{
                    if (data) {
                        const pastGenerationIds = data.past_generation_ids && data.writing_generation_id ? data.past_generation_ids.filter(gid => gid !== writingGenerationId) : [];
                        setGenerationIds([...pastGenerationIds])
                        _setRoundId(data.round_id ? data.round_id : 0);
                        setWritingGenerationId(data.writing_generation_id ? data.writing_generation_id : null)
                        _setGenerationTime(data.generation_time ? data.generation_time : 0)
                        setShowAsAnonymous(data.display_name ? false : true);
                        setRoundDisplayName(data.display_name ? data.display_name : undefined);
                        const blob = base64ToBlob(data.leaderboard_image);
                        const blobUrl = URL.createObjectURL(blob);
                        setLeaderboardImage(blobUrl);
                        setFeedback(data.feedback ? data.feedback : "");
                    }
                    setUserAction('none');
                    break;
                }
                case 'change_display_name': {
                    setUserAction('evaluate');
                    break;
                }
                case 'submit': {
                    if (data) {
                        const messages = data.chat_messages;
                        setWritingGenerationId(data.writing_generation_id ? data.writing_generation_id : null);
                        if (messages.length > 0 ? messages[messages.length - 1].content.startsWith("ブー！") : false){
                            // remind user to type in English or language of choice
                            setWarningMsg(messages.length > 0 ? messages[messages.length - 1].content : "");
                            setUserAction('none');
                            setGeneratingLoading(false);
                            break;
                        } else {
                            _setGenerationTime(generationTime + 1);
                            if (data.display_name !== roundDisplayName) {
                                setUserAction('change_display_name');
                                break;
                            }
                            setUserAction('evaluate');
                            break;
                        }
                    }
                    break;
                }
                case 'evaluate': {
                    if (generationTime > 4) {
                        setUserAction('end');
                    }
                    setGeneratingLoading(false);
                    setLoadingGenerationIds(writingGenerationId ? loadingGenerationIds.filter(gid => gid !== writingGenerationId):loadingGenerationIds)
                    setIsEvaluationModalOpen(true);
                    break;
                }
                case 'end': {
                    setUserAction('none');
                    setToStartNew(false);
                    break;
                }
                default:
                    break;
            }
        })
            .catch(e => {
                console.error('Error receiving response:', e);
                setErrorKey("error.ReceivingGenerationDetail");
            });

                
            
        } catch (e) {
            setErrorKey("error.FetchingGenerationDetail");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [userAction]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
    }

    return (
        <div>
            <WritingFrame
                title={title ? title : t('writerView.writingFrame.noLeaderboard')}
                imageUrl={leaderboardImage ? leaderboardImage : ''}
                writingText={writingText}
                setWritingText={setWritingText}
                displayName={roundDisplayName}
                setDisplayName={setRoundDisplayName}
                showAsAnonymous={showAsAnonymous}
                setShowAsAnonymous={setShowAsAnonymous}
                submitWritingFn={handleSubmitWriting}
                disabledSubmit={generationTime > 5 || toStartNew === false}
                isLoading={isLoading || generatingLoading}
            />
        </div>
    );
};


export const BrowseWriting: React.FC<BrowseWritingProps> = ({
    setView,
    feedback,
    generation_ids,
    loadingGenerationIds,
    writingGenerationId,
    isEvaluationModalOpen,
    setIsEvaluationModalOpen,
    warningMsg,
    receivedResponse
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    
    const [selectedGenerationId, setSelectedGenerationId] = useState<number | null>(null);

    const [showWarning, setShowWarning] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const [isPastWritingModalOpen, setIsPastWritingModalOpen] = useState(false);

    const { t } = useLocalization();
    

    const handleClickPastWritingIcon = (
        generation_id: number,
    ) => {
        setIsPastWritingModalOpen(true);
        setSelectedGenerationId(generation_id);
    };
    
    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);

        try {
            if (warningMsg !== "") {
                setShowWarning(true);
                setTimeout(() => {
                    setShowWarning(false);
                }, 2000);
            }
        } catch (e) {
            setErrorKey(t("error.FetchingGenerationDetail"));
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [warningMsg]);

    useEffect(() => {
        if (receivedResponse !== "") {
            setShowNotification(true);
            setTimeout(() => {
                setShowNotification(false);
            }, 2000);
        }
    }, [receivedResponse]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
    }

    return (
        <div>
            { showWarning ? <Alert className="position absolute z-10 content-center left-1/3" severity="warning">{warningMsg}</Alert> : null }
            { showNotification ? <Alert className="position absolute z-10 content-center left-1/3" severity="success">{receivedResponse}</Alert> : null }
            <PastWritingsBar 
                generation_ids={generation_ids} 
                onClick={handleClickPastWritingIcon}
                getBack={ () => setView('browsing') }
                loadingGenerationIds={loadingGenerationIds}
            />
            <PastWritingModal
                generation_id={selectedGenerationId}
                feedback={feedback}
                isOpen={isPastWritingModalOpen}
                onClose={() => setIsPastWritingModalOpen(false)}
            />
            <PastWritingModal
                generation_id={writingGenerationId}
                feedback={feedback}
                isOpen={isEvaluationModalOpen}
                onClose={() => setIsEvaluationModalOpen(false)}
            />
        </div>
    );
};

export const WritingPage: React.FC<WritingPageProps> = ({ setView, leaderboard, imageUrl }) => {
    const [toStartNew, setToStartNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    
    const [generation_ids, setGenerationIds] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<string>("");
    const [loadingGenerationIds, setLoadingGenerationIds] = useState<number[]>([]);
    const [writingGenerationId, setWritingGenerationId] = useState<number | null>(null);
    const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

    const [warningMsg, setWarningMsg] = useState<string>("");
    const [receivedResponse, setReceivedResponse] = useState<string>("");

    const { fetchLeaderboard } = useContext(LeaderboardStartNewContext);
    const { t } = useLocalization();
    
    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);
            try {
                if (leaderboard) {
                    const program = sessionStorage.getItem('program') || 'none';
                    fetchLeaderboard(leaderboard.id, program).then((okToStartData) => {
                        if (okToStartData) {
                            setToStartNew(okToStartData.start_new);
                        }
                    }).catch(e => {
                        console.error('Failed to fetch leaderboard start new:', e)
                    });
                }
            } catch (e) {
                setErrorKey("error.FetchingLeaderboardStartNew");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
    }, [leaderboard?.id]);

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
                    <BrowseWriting
                        setView={setView}
                        feedback={feedback}
                        generation_ids={generation_ids}
                        loadingGenerationIds={loadingGenerationIds}
                        writingGenerationId={writingGenerationId}
                        isEvaluationModalOpen={isEvaluationModalOpen}
                        setIsEvaluationModalOpen={setIsEvaluationModalOpen}
                        warningMsg={warningMsg}
                        receivedResponse={receivedResponse}
                    />
                </div>
                <div className="h-7/8 w-full">
                    <Writing
                        title={leaderboard ? leaderboard.title : t('writerView.writingFrame.noLeaderboard')}
                        imageUrl={imageUrl ? imageUrl : ''}
                        toStartNew={toStartNew}
                        setToStartNew={setToStartNew}
                        leaderboard_id={leaderboard ? leaderboard.id : 0}
                        generationIds={generation_ids}
                        setGenerationIds={setGenerationIds}
                        setFeedback={setFeedback}
                        loadingGenerationIds={loadingGenerationIds}
                        setLoadingGenerationIds={setLoadingGenerationIds}
                        writingGenerationId={writingGenerationId}
                        setWritingGenerationId={setWritingGenerationId}
                        setIsEvaluationModalOpen={setIsEvaluationModalOpen}
                        setWarningMsg={setWarningMsg}
                        setReceivedResponse={setReceivedResponse}
                    />
                </div>
            </div>
        </div>
    );
};