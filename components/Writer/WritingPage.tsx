import React, {useContext, useEffect, useState} from "react";
import { WritingFrame } from "./WritingFrame";
import { PastWritingsBar, PastWritingModal } from "./PastWritingFrame";
import { GalleryView } from "../../types/ui";
import { Leaderboard } from "../../types/leaderboard";
import { websocketRequest, websocketResponse } from "../../types/websocketAPI";
import { LoadingSpinner } from "../Common/LoadingSpinner";

import { WsContext } from "../../providers/WsProvider";

import { WebSocketClient } from "../../util/websocketClient";
// ...existing code...


interface WritingPageProps {
    view: GalleryView;
    setView: (view: GalleryView) => void;
    leaderboard: Leaderboard | null;
    imageUrl: string | null;
}


export const WritingPage: React.FC<WritingPageProps> = ({ view: _view, setView: _setView, leaderboard, imageUrl }) => {
    const [writingText, setWritingText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [_errorKey, setErrorKey] = useState<string | null>(null);
    const [generation_ids, _setGenerationIds] = useState<number[]>([1,20,3,83,112]);
    const [writingGenerationId, _setWritingGenerationId] = useState<number | null>(null);
    const [selectedGenerationId, setSelectedGenerationId] = useState<number | null>(null);
    const [isPastWritingModalOpen, setIsPastWritingModalOpen] = useState(false);
    const [_isChatbotModalOpen, _setIsChatbotModalOpen] = useState(false);
    const [userAction, _setUserAction] = useState<'start' | 'resume' | 'hint' | 'submit' | 'evaluate' | 'end'>('start');

    const [_websocketJsonMessage, setWebsocketJsonMessage] = useState<websocketRequest | null>(null);
    const [_websocketJsonResponse, setWebsocketJsonResponse] = useState<websocketResponse | null>(null);
    
    const {fetchWsToken} = useContext(WsContext);
    

    const handleClickPastWritingIcon = (
        index: number
    ) => {
        setIsPastWritingModalOpen(true);
        setSelectedGenerationId(generation_ids[index]);
    }

    const handleSubmitWriting = () => {
        setSelectedGenerationId(writingGenerationId);
        setIsPastWritingModalOpen(true);
    };
    
    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);
        try {
            if (leaderboard) {
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
                                        default:
                                            break
                                    }

                                    // send message (if prepared). WebSocketClient will queue until ready.
                                    if (message) {
                                      client.send(wsLink, message)
                                      setWebsocketJsonMessage(message)
                                    }

                                    // subscribe to messages for this url
                                                            // subscriber receives unknown; cast to websocketResponse for our usage
                                                            const onMessage = (data: unknown) => {
                                                                const parsed = data as websocketResponse
                                                                setWebsocketJsonResponse(parsed)
                                                                console.log('WebSocket response data: ', parsed)
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
    }, [leaderboard, fetchWsToken, userAction]);

    if (isLoading) {
        return <LoadingSpinner />;
    }



    return (
        <div className="bg-neutral-900 flex-col md:flex-row items-center">
            <div className="h-1/8 w-full">
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
                imageUrl={imageUrl ? imageUrl : ""}
                writingText={writingText}
                setWritingText={setWritingText}
                submitWritingFn={handleSubmitWriting}
            />
            </div>
        </div>
    );
};