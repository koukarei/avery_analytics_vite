import React, {useRef, useContext, useEffect, useState} from "react";
import { WritingFrame } from "./WritingFrame";
import { PastWritingsBar, PastWritingModal } from "./PastWritingFrame";
import { GalleryView } from "../../types/ui";
import { Leaderboard } from "../../types/leaderboard";
import { websocketRequest, websocketResponse } from "../../types/websocketAPI";
import { LoadingSpinner } from "../Common/LoadingSpinner";

import { WsContext } from "../../providers/WsProvider";
import { GenerationDetailProvider, GenerationEvaluationProvider, GenerationImageProvider } from "../../providers/GenerationProvider";
import PastWritingFrame from "./PastWritingFrame";


interface WritingPageProps {
    view: GalleryView;
    setView: (view: GalleryView) => void;
    leaderboard: Leaderboard | null;
    imageUrl: string | null;
}


export const WritingPage: React.FC<WritingPageProps> = ({ view, setView, leaderboard, imageUrl }) => {
    const [writingText, setWritingText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [generation_ids, setGenerationIds] = useState<number[]>([1,20,3,83,112]);
    const [writingGenerationId, setWritingGenerationId] = useState<number | null>(null);
    const [selectedGenerationId, setSelectedGenerationId] = useState<number | null>(null);
    const [isPastWritingModalOpen, setIsPastWritingModalOpen] = useState(false);
    const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
    const [closeWritingPage, setCloseWritingPage] = useState(false);

    const [websocketJsonMessage, setWebsocketJsonMessage] = useState<websocketRequest | null>({
        action: "start",
        program: sessionStorage.getItem("program") || "none",
        obj: {
            leaderboard_id: leaderboard ? leaderboard.id : 0,
            model: "gpt-4o-mini",
            program: sessionStorage.getItem("program") || "none",
            created_at: new Date(),
        }
    });
    const [websocketMessage, setWebsocketMessage] = useState<string | null>(null);
    const [websocketJsonResponse, setWebsocketJsonResponse] = useState<websocketResponse | null>(null);
    const [websocketResponseMsg, setWebsocketResponseMsg] = useState<string | null>(null);
    
    const {fetchWsToken} = useContext(WsContext);

    const socketRef = useRef<WebSocket>()

    const handleClickPastWritingIcon = (
        index: number
    ) => {
        setIsPastWritingModalOpen(true);
        setSelectedGenerationId(generation_ids[index]);
    }

    const handleSubmitWriting = () => {
        setSelectedGenerationId(writingGenerationId);
        setIsPastWritingModalOpen(true);
    }

    window.addEventListener('close', () => {
        if (socketRef.current) {
            setCloseWritingPage(true);
        }
    })
    
    useEffect(() => {
        setErrorKey(null);
        setIsLoading(true);
        try {
            if (leaderboard) {
                // #1.WebSocketオブジェクトを生成しサーバとの接続を開始
                fetchWsToken().then((wsTokenResponse) => {
                    console.log("Fetched WS Token: ", wsTokenResponse);
                    if (wsTokenResponse) {
                        const wsLink = import.meta.env.VITE_WS_URL + `/${leaderboard.id}/?token=${wsTokenResponse.ws_token}`;
                        console.log("Connecting to WebSocket URL: ", wsLink);
                        const websocket = new WebSocket(wsLink);
                        socketRef.current = websocket;
                        const onMessage = (event: MessageEvent<string>) => {
                        setMessage(event.data)
                        }
                        websocket.addEventListener('message', onMessage)
                        return () => {
                        websocket.close()
                        websocket.removeEventListener('message', onMessage)
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
    }, [leaderboard]);

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