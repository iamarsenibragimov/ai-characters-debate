import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DebateCharacter, DebateMessage } from '@/types/debate';
import { playAudioFromBase64, stopAudio } from '@/utils/audio';
import { FIXED_CHARACTERS } from '@/constants/characters';
import { newsQueue } from '@/lib/news-queue';

export const useDebate = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [characters, setCharacters] = useState<DebateCharacter[]>([]);
  const nextGenerationStarted = useRef(false);
  const nextResponseData = useRef<{ text: string; audio: string; character: number } | null>(null);
  const isStopping = useRef(false);
  const { toast } = useToast();
  const [currentNews, setCurrentNews] = useState(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const maxExchanges = useRef(Math.floor(Math.random() * 3) + 1);
  const currentTopicRef = useRef('');

  const initializeDebate = async () => {
    try {
      await newsQueue.loadingPromise; // Wait for initial news load
      const news = await newsQueue.getCurrentNews();
      if (news) {
        setCurrentNews(news);
        setTopic(news.title);
        currentTopicRef.current = news.title;
      } else {
        console.error('No news available');
        toast({
          title: "Error",
          description: "No news available to discuss",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing debate:', error);
      toast({
        title: "Error",
        description: "Failed to initialize debate",
        variant: "destructive",
      });
    }
  };

  const startDebate = async () => {
    try {
      setCharacters(FIXED_CHARACTERS);
      setIsLoading(true);
      setExchangeCount(0); // Reset exchange count

      // Get current news if not provided
      if (!currentNews || !currentNews.title) {
        const news = await newsQueue.getCurrentNews();
        if (!news) {
          throw new Error('No news available');
        }
        setCurrentNews(news);
        setTopic(news.title);
        currentTopicRef.current = news.title;
      }

      const topicToUse = currentTopicRef.current;
      console.log('Starting debate with topic:', topicToUse);

      setIsDebating(true);
      setMessages([]);
      nextGenerationStarted.current = false;
      nextResponseData.current = null;

      // Randomly choose starting character (1 or 2)
      const startingCharacter = Math.random() < 0.5 ? 1 : 2;

      const response = await generateDebateResponse(startingCharacter, FIXED_CHARACTERS, topicToUse);
      if (response) {
        await playMessage(response.text, response.audio, response.character, FIXED_CHARACTERS);
        setIsLoading(false);
      } else {
        throw new Error('Failed to generate initial response');
      }
    } catch (error) {
      console.error('Error starting debate:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to start debate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateDebateResponse = async (
    characterNumber: number,
    currentCharacters: DebateCharacter[],
    currentTopic?: string
  ) => {
    if (isStopping.current) return null;

    const topicToUse = currentTopic || topic;
    if (!topicToUse) {
      console.error('No topic available for debate');
      return null;
    }

    console.log('Generating debate response for character:', characterNumber);
    console.log('Current topic:', topicToUse);

    try {
      setIsLoading(true);
      const character = currentCharacters.find(c => c.character_number === characterNumber);
      if (!character) throw new Error('Character not found');

      const stance = characterNumber === 1 ? 'supportive' : 'critical';
      const { data, error } = await supabase.functions.invoke('debate', {
        body: {
          topic: topicToUse,
          messages,
          character: characterNumber,
          stance,
          characterInfo: {
            name: character.name,
            background: character.background,
            personality: character.personality,
            occupation: character.occupation
          },
          lastOpponentMessage: messages.length > 0 ? messages[messages.length - 1].text : null,
        },
      });

      if (error) throw error;
      if (!data.text) throw new Error('No response received');

      const audioResponse = await fetch('http://localhost:3000/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.text, voiceId: character.voice_id })
      });

      const audioData = await audioResponse.json();

      return {
        text: data.text,
        audio: audioData.audioContent,
        character: characterNumber
      };
    } catch (error) {
      console.error('Error generating debate response:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate debate response. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getNewTopic = async () => {
    try {
      const news = await newsQueue.getCurrentNews();
      if (!news) {
        throw new Error('No news available');
      }
      
      console.log('New topic:', news.title);
      setCurrentNews(news);
      return news.title;
    } catch (error) {
      console.error('Error getting new topic:', error);
      toast({
        title: "Error",
        description: "Failed to get new topic. Using fallback.",
        variant: "destructive",
      });
      return "Breaking: Technical Difficulties at AI News Network";
    }
  };

  const playMessage = async (text: string, audio: string, characterNumber: number, currentCharacters: DebateCharacter[]) => {
    if (isStopping.current) return;

    try {
      setIsSpeaking(true);

      // Update messages and get the new count
      let currentMessageCount = 0;
      setMessages(prev => {
        currentMessageCount = prev.length + 1;
        return [...prev, { character: characterNumber, text }];
      });

      // Start generating next response before playing current audio
      let nextResponsePromise: Promise<{ text: string; audio: string; character: number } | null> | null = null;

      if (currentMessageCount < 2) {
        const nextCharacter = characterNumber === 1 ? 2 : 1;
        nextResponsePromise = generateDebateResponse(nextCharacter, currentCharacters, currentTopicRef.current);
      }

      // Play current audio
      await playAudioFromBase64(audio);

      console.log('Current message count:', currentMessageCount);

      // Change topic after one message
      if (currentMessageCount >= 2) {
        console.log('Changing topic after message count:', currentMessageCount);
        isStopping.current = true;
        setIsSpeaking(false);

        try {
          const newTopic = await getNewTopic();
          // Reset all state before starting new debate
          setMessages([]);
          setTopic(newTopic);
          currentTopicRef.current = newTopic;
          nextGenerationStarted.current = false;
          nextResponseData.current = null;

          // Update current news
          setCurrentNews({ title: newTopic });

          // Wait for state updates
          await new Promise(resolve => setTimeout(resolve, 100));

          // Reset stopping flag and start new debate
          isStopping.current = false;
          console.log('Starting new debate with topic:', newTopic);
          await startDebate();
          return;
        } catch (error) {
          console.error('Error during topic change:', error);
          isStopping.current = false;
          setIsSpeaking(false);
          return;
        }
      }

      setIsSpeaking(false);

      // Use pre-generated response if available
      if (!isStopping.current && nextResponsePromise) {
        const response = await nextResponsePromise;
        if (response) {
          await playMessage(response.text, response.audio, response.character, currentCharacters);
        }
      }
    } catch (error) {
      console.error('Error playing message:', error);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (topic) {
      currentTopicRef.current = topic;
    }
  }, [topic]);

  useEffect(() => {
    initializeDebate();
  }, []);

  return {
    topic,
    isDebating,
    isLoading,
    messages,
    isSpeaking,
    characters,
    startDebate
  };
};
