import React, { useState, useEffect } from 'react';
import NewsAnchor from './NewsAnchor';
import { DebateCharacter, DebateMessage } from '@/types/debate';
import { Loader2 } from "lucide-react";
import { useRotatingHeadlines } from '@/hooks/useRotatingHeadlines';
import NewsLocationTime from './NewsLocationTime';
import { DotPattern } from './ui/dot-pattern';

interface NewsDiscussionProps {
  topic: string;
  isLoading: boolean;
  messages: DebateMessage[];
  isSpeaking: boolean;
  characters: DebateCharacter[];
}

const NewsDiscussion = ({
  topic,
  isLoading,
  messages,
  isSpeaking,
  characters,
}: NewsDiscussionProps) => {
  const currentHeadline = useRotatingHeadlines();
  const [displayedTopic, setDisplayedTopic] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!topic) return;

    console.log('Topic changed:', {
      originalTopic: topic,
      length: topic.length
    });

    setIsTyping(true);
    setDisplayedTopic('');

    const truncatedTopic = topic.length > 128 ? topic.substring(0, 128) + '...' : topic;
    console.log('Truncated topic:', {
      truncatedTopic,
      length: truncatedTopic.length
    });

    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < truncatedTopic.length) {
        const nextChar = truncatedTopic[currentIndex];
        console.log('Typing character:', {
          index: currentIndex,
          char: nextChar,
          currentText: displayedTopic + nextChar
        });
        setDisplayedTopic(prev => prev + nextChar);
        currentIndex++;
      } else {
        console.log('Finished typing:', {
          finalText: displayedTopic,
          length: displayedTopic.length
        });
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [topic]);

  if (!characters.length || !topic) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 data-testid="loading-spinner" className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 debate-slide-in min-h-screen flex flex-col">
      <DotPattern 
        width={20}
        height={20}
        className="opacity-50"
        glow
      />
      <NewsLocationTime />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center mt-12 mb-20">
          <div className="flex gap-16 justify-center">
            {characters.map((character) => (
              <NewsAnchor
                key={character.character_number}
                name={character.name}
                isActive={isLoading && messages.length % 2 === character.character_number - 1}
                lastMessage={messages.find(m => m.character === character.character_number)?.text}
                isSpeaking={isSpeaking && messages[messages.length - 1]?.character === character.character_number}
                avatarUrl={character.avatar_url}
              />
            ))}
          </div>
        </div>
        
        {/* CNN-style news chyron */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {/* Main headline - limited width */}
          <div className="flex justify-center">
            <div className="max-w-4xl w-full bg-black rounded-lg">
              <div className="flex items-center gap-4 py-4">
                <div className="bg-red-600 text-white px-3 py-1 font-bold text-sm">
                  LIVE
                </div>
                <h2 data-testid="topic-heading" className="text-4xl font-bold uppercase tracking-wide text-white typing-text">
                  {displayedTopic}
                  {isTyping && <span className="typing-animation" />}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Spacer */}
          <div className="h-12 bg-white" />
          
          {/* News ticker - full width */}
          <div className="w-full bg-black overflow-hidden whitespace-nowrap">
            <div className="inline-flex animate-[tickerScroll_240s_linear_infinite] py-4">
              {/* Duplicate the headline string twice to ensure smooth infinite loop */}
              {[1, 2].map((_, i) => (
                <div key={i} className="inline-block whitespace-nowrap leading-8">
                  <span className="text-white text-xl font-medium">
                    {currentHeadline} • AI NEWS NETWORK • 
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDiscussion; 