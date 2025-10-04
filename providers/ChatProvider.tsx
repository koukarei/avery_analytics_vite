import React, { createContext, useState, useCallback } from "react";
import type { ChatStats } from "../types/studentWork";
import { ChatAPI } from "../api/Chat";

type ChatStatsContextType = {
  stats: ChatStats | null;
  loading: boolean;
  fetchStats: (round_id: number) => Promise<ChatStats | null>;
};

const ChatStatsContext = createContext({} as ChatStatsContextType);

const ChatStatsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStats = useCallback(async (round_id: number) => {
    setLoading(true);
    let statsData: ChatStats | null = null;
    try {
      statsData = await ChatAPI.GetChatStats(round_id);
      setStats(statsData);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return statsData;
  }, []);

  return (
    <ChatStatsContext.Provider value={{ stats, loading, fetchStats }}>
      {children}
    </ChatStatsContext.Provider>
  );
};

export { ChatStatsContext, ChatStatsProvider };