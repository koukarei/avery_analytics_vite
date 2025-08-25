import React, { useState, useCallback, useEffect, useContext } from 'react';
import { ImageGallery } from '../ImageGallery';
import { GrammarVisualization } from '../GrammarVisualization';
import { DescriptiveWriting } from '../DescriptiveWriting';
import type { GenerationItem, GenerationItemParams } from '../../types/leaderboard';
import { GenerationListContext, GenerationImageContext } from '../../providers/GenerationProvider';
import { BottomContentType } from '../../types/gallery';
import { GenerationItemAPI } from '../../api/Generation';
import { useLocalization } from '../../contexts/localizationUtils';

const LoadingSpinner: React.FC = () => {
  const { t } = useLocalization();
  return (
    <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-slate-600">{t('loading.text')}</p>
    </div>
  );
};

const ErrorDisplay: React.FC<{ messageKey: string }> = ({ messageKey }) => {
  const { t } = useLocalization();
  return (
    <div className="text-center p-10 bg-red-50 border border-red-200 rounded-md" role="alert">
      <p className="text-red-600 font-semibold">{t('error.title')}</p>
      <p className="text-red-500">{t(messageKey)}</p>
    </div>
  );
};

export default function GalleryView() {
  const { t } = useLocalization();
  const { generations, loading, fetchGenerations } = useContext(GenerationListContext);
  const { image, loading: imageLoading, fetchImage } = useContext(GenerationImageContext);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [galleryCurrentIndex, setGalleryCurrentIndex] = useState<number>(0);
  //const [bottomContent, setBottomContent] = useState<BottomContentType>(BottomContentType.GRAMMAR_VISUALIZATION);

  const handleGalleryScroll = useCallback((direction: 'up' | 'down') => {
    setGalleryCurrentIndex(prevIndex => {
      let newIndex = prevIndex;
      if (direction === 'down') { // Scroll down -> move images left (next)
        newIndex = prevIndex + 1;
      } else { // Scroll up -> move images right (previous)
        newIndex = prevIndex - 1;
      }
      return newIndex > 0 ? newIndex % generations.length : generations.length + newIndex; // Wrap around
    });
  }, []);

  // const handleSwitchToDescriptiveWriting = useCallback(() => {
  //   setBottomContent(BottomContentType.DESCRIPTIVE_WRITING);
  // }, []);
  
  // const handleReturnToGrammarView = useCallback(() => {
  //   setBottomContent(BottomContentType.GRAMMAR_VISUALIZATION);
  // }, []);

  useEffect(() => {
    const program = sessionStorage.getItem("program") ?? "";
    fetchGenerations({ program: program }).then(generationItems => {
      if (generationItems.length > 0){
        // Handle successful generation fetching
        fetchImage({ generation_id: generationItems[0].id }).catch(err => {
          console.log(err);
        });
      }
    }); 
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (errorKey) {
      return <ErrorDisplay messageKey={errorKey} />;
    }

    return (
      <div className="flex flex-col h-screen bg-black overflow-hidden">
        {/* Top Half: Leaderboard */}
        <div className="h-1/2 md:h-3/5 relative flex flex-col items-center justify-center bg-neutral-900 overflow-hidden pt-4 md:pt-8">
          {generations.length > 0 ? (
            <ImageGallery
              images={IMAGE_DATA}
              currentIndex={galleryCurrentIndex}
              onScroll={handleGalleryScroll}
            />
          ) : (
            <p className="text-xl text-gray-400">No images to display.</p>
          )}
        </div>

        {/* Bottom Half: Toggleable Content */}
        {/* <div className="h-1/2 md:h-2/5 bg-neutral-900 flex items-center justify-center p-4 md:p-8 relative">
          {bottomContent === BottomContentType.GRAMMAR_VISUALIZATION ? (
            <GrammarVisualization
              mistakes={GRAMMAR_MISTAKES_DATA}
              onInteractionEnd={handleSwitchToDescriptiveWriting}
            />
          ) : (
            <DescriptiveWriting 
              text={DESCRIPTIVE_WRITING_SAMPLE} 
              onReturnToGrammarView={handleReturnToGrammarView}
            />
          )}
        </div> */}
      </div>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};