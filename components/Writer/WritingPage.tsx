import React, {useContext, useState} from "react";
import { WritingFrame } from "./WritingFrame";
import { PastWritingsBar, PastWritingModal } from "./PastWritingFrame";
import { GalleryView } from "../../types/ui";
import { Leaderboard } from "../../types/leaderboard";

import { GenerationDetailProvider, GenerationEvaluationProvider, GenerationImageProvider } from "../../providers/GenerationProvider";
import PastWritingFrame from "./PastWritingFrame";


interface WritingPageProps {
    view: GalleryView;
    setView: (view: GalleryView) => void;
    leaderboard: Leaderboard | null;
    imageUrl: string;
}

export const WritingPage: React.FC<WritingPageProps> = ({ view, setView, leaderboard, imageUrl }) => {
    const [writingText, setWritingText] = useState("");
    const [generation_ids, setGenerationIds] = useState<number[]>([1,20,3,83,112]);
    const [writingGenerationId, setWritingGenerationId] = useState<number | null>(null);
    const [selectedGenerationId, setSelectedGenerationId] = useState<number | null>(null);
    const [isPastWritingModalOpen, setIsPastWritingModalOpen] = useState(false);
    const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
    
    const handleClickPastWritingIcon = (
        index: number
    ) => {
        console.log("Clicked past writing icon for generation id: ", generation_ids[index]);
        setIsPastWritingModalOpen(true);
        setSelectedGenerationId(generation_ids[index]);
    }

    const handleSubmitWriting = () => {
        setSelectedGenerationId(writingGenerationId);
        setIsPastWritingModalOpen(true);
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
                imageUrl={imageUrl}
                writingText={writingText}
                setWritingText={setWritingText}
                submitWritingFn={handleSubmitWriting}
            />
            </div>
        </div>
    );
};