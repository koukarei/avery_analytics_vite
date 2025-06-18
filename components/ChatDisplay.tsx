import React from 'react';
import type { ChatRecord } from '../types/studentWork';
import { PLACEHOLDER_IMAGE_DIMENSIONS } from '../constants';
import { useLocalization } from '../contexts/localizationUtils';

interface ChatDisplayProps {
  chatRecord: ChatRecord;
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ chatRecord }) => {
  const { language } = useLocalization();
  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
      <h4 className="text-lg font-semibold text-accent mb-2">{chatRecord.topic}</h4>
      {chatRecord.relatedImageUrl && (
        <img 
          src={chatRecord.relatedImageUrl} 
          alt={chatRecord.topic} 
          className="w-full h-auto max-h-48 object-cover rounded-md mb-3 shadow-sm"
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/${PLACEHOLDER_IMAGE_DIMENSIONS.small}?random=${Math.random()}`)}
        />
      )}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {chatRecord.messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg max-w-[70%] ${
              message.sender === 'student' 
                ? 'bg-primary-light text-primary-dark' 
                : 'bg-slate-200 text-slate-800'
            }`}>
              <p className="text-sm">{message.text}</p>
              <p className="text-xs text-opacity-75 mt-1">
                {new Date(message.timestamp).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatDisplay;
