import React, { useState } from 'react';
import type { StudentWork, WritingEntry, ChatRecord } from '../types/studentWork';
import WritingDisplay from './WritingDisplay';
import ChatDisplay from './ChatDisplay';
import BookOpenIcon from './icons/BookOpenIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import { useLocalization } from '../contexts/localizationUtils';

interface StudentCardProps {
  studentWork: StudentWork;
}

type ActiveTab = 'writings' | 'chats';

const StudentCard: React.FC<StudentCardProps> = ({ studentWork }) => {
  const { t, language } = useLocalization();
  const [activeTab, setActiveTab] = useState<ActiveTab>('writings');
  const [selectedWriting, setSelectedWriting] = useState<WritingEntry | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-200">
      <div className="p-5 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="flex items-center">
          <img 
            src={studentWork.student.avatarUrl} 
            alt={studentWork.student.name} 
            className="w-16 h-16 rounded-full border-2 border-white shadow-sm mr-4"
            onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/${studentWork.student.id}/100/100`)}
          />
          <h3 className="text-2xl font-semibold">{studentWork.student.name}</h3>
        </div>
      </div>
      
      <div className="border-b border-slate-200">
        <div className="flex">
          <button 
            onClick={() => { setActiveTab('writings'); setSelectedChat(null); }}
            className={`flex-1 py-3 px-4 text-center font-medium flex items-center justify-center
              ${activeTab === 'writings' ? 'text-primary border-b-2 border-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            aria-pressed={activeTab === 'writings'}
          >
            <BookOpenIcon className="w-5 h-5 mr-2" /> {t('studentCard.writingsTab')} ({studentWork.writings.length})
          </button>
          <button 
            onClick={() => { setActiveTab('chats'); setSelectedWriting(null); }}
            className={`flex-1 py-3 px-4 text-center font-medium flex items-center justify-center
              ${activeTab === 'chats' ? 'text-accent border-b-2 border-accent' : 'text-slate-600 hover:bg-slate-50'}`}
            aria-pressed={activeTab === 'chats'}
          >
            <ChatBubbleIcon className="w-5 h-5 mr-2" /> {t('studentCard.chatLogsTab')} ({studentWork.chatRecords.length})
          </button>
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'writings' && (
          <div>
            {studentWork.writings.length === 0 ? (
              <p className="text-slate-500">{t('studentCard.noWritings')}</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {studentWork.writings.map(writing => (
                  <li key={writing.id}>
                    <button 
                      onClick={() => setSelectedWriting(selectedWriting?.id === writing.id ? null : writing)}
                      className="w-full text-left p-3 bg-slate-100 hover:bg-primary-light hover:text-primary-dark rounded-md transition-colors duration-150"
                      aria-expanded={selectedWriting?.id === writing.id}
                    >
                      {writing.title} <span className="text-xs text-slate-500">({new Date(writing.date).toLocaleDateString(language)})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedWriting && <WritingDisplay writing={selectedWriting} />}
          </div>
        )}

        {activeTab === 'chats' && (
          <div>
            {studentWork.chatRecords.length === 0 ? (
               <p className="text-slate-500">{t('studentCard.noChatRecords')}</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {studentWork.chatRecords.map(chat => (
                  <li key={chat.id}>
                     <button 
                      onClick={() => setSelectedChat(selectedChat?.id === chat.id ? null : chat)}
                      className="w-full text-left p-3 bg-slate-100 hover:bg-accent/20 hover:text-accent-dark rounded-md transition-colors duration-150"
                      aria-expanded={selectedChat?.id === chat.id}
                    >
                      {chat.topic}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedChat && <ChatDisplay chatRecord={selectedChat} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCard;
