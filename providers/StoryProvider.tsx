import React, { createContext, useEffect, useState } from "react";
import type { Story } from '../types/leaderboard';
import { StoryAPI } from "../api/Story";

type StoryContextType = {
  stories: Story[];
  loading: boolean;
};

export const StoryContext = createContext({} as StoryContextType);

export const StoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const storyList = await StoryAPI.fetchStoryList({skip: 0, limit: 100});
      setStories(storyList);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <StoryContext.Provider value={{ stories, loading }}>
      {children}
    </StoryContext.Provider>
  );
};
