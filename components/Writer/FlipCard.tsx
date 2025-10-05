
import React, { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { useLocalization } from '../../contexts/localizationUtils';
import { GenerationImageContext, GenerationDetailContext, GenerationEvaluationContext } from '../../providers/GenerationProvider';
import type { SerializedStyles } from '@emotion/react';

interface FlashcardProps {
  generation_id: number;
  view: 'Select' | 'AWE' | 'IMG';
  css: SerializedStyles
}

interface FlashcardContentProps {
    children: React.ReactNode;
    isFlipped?: boolean;
}

const FlashcardContent: React.FC<FlashcardContentProps> = ({ children, isFlipped }) => {
  return (
    <div className="w-full max-w-md h-64 sm:h-80 [perspective:1000px]">
      <div 
        className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex items-center justify-center p-6 text-center border-4 border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">{children}</h2>
        </div>
      </div>
    </div>
  );
};

const Flashcard: React.FC<FlashcardProps> = ({ generation_id, view }) => {
    const { t } = useLocalization();
    const [ currentView, setCurrentView ] = useState<'Select' | 'AWE' | 'IMG'>(view);
    const [ imageUrl, setImageUrl ] = useState<string>("");
    const [ aweText, setAweText ] = useState<string>("");

    const { fetchImage } = useContext(GenerationImageContext);
    const { fetchEvaluation } = useContext(GenerationEvaluationContext);

    const handleClickAWE = () => {
        // Handle AWE button click
        setCurrentView('AWE');
    }

    const handleClickIMG = () => {
        // Handle Image button click
        setCurrentView('IMG');
    }

    const handleClickBack = () => {
        // Handle Back button click
        setCurrentView('Select');
    }

    useEffect(() => {
        switch(currentView) {
            case 'AWE':
                fetchEvaluation(generation_id).then(msg => setAweText(msg));
                break;
            case 'IMG':
                fetchImage({generation_id}).then(url => setImageUrl(url));
                break;
            default:
                break;
        }
    }, [currentView]);

    switch(currentView) {
        case 'Select':
            return (<FlashcardContent>
                <Button onClick={handleClickAWE}>
                    {t('writerView.awe')}
                </Button>
                <Button onClick={handleClickIMG}>
                    {t('writerView.image')}
                </Button>
            </FlashcardContent>);
        case 'AWE':
            return (
                <Button onClick={handleClickBack}>
                    <FlashcardContent isFlipped={true}>
                        {aweText}
                    </FlashcardContent>
                </Button>
                );
        case 'IMG':
            return (
                <Button onClick={handleClickBack}>
                    <FlashcardContent isFlipped={true}>
                        <img src={imageUrl} alt="Writing" className="w-full h-full object-cover rounded-2xl shadow-2xl" />;
                    </FlashcardContent>
                </Button>
                );
        default:
            return null;
    }
};

export default Flashcard;