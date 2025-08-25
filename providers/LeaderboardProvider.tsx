import React, { createContext, useState } from "react";
import type { Leaderboard, School, LeaderboardAnalysis, LeaderboardListParams, LeaderboardAnalysisParams, WordCloudParams } from '../types/leaderboard';
import { WritingMistake, ChatWordCloudItem } from "../types/studentWork"
import { LeaderboardAPI } from "../api/Leaderboard";

type LeaderboardListContextType = {
  leaderboards: Leaderboard[];
  loading: boolean;
  fetchLeaderboards: (params: LeaderboardListParams) => Promise<Leaderboard[]>;
};

const LeaderboardListContext = createContext({} as LeaderboardListContextType);

const LeaderboardListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaderboards = async (params: LeaderboardListParams) => {
    setLoading(true);
    let leaderboardData: [Leaderboard, School][] = [];
    const leaderboard: Leaderboard[] = [];
    const school: School[] = [];
    try {
      leaderboardData = await LeaderboardAPI.fetchLeaderboardList(params);
      leaderboardData.map(([leaderboardItem, schoolItem]) => {
        leaderboard.push(leaderboardItem);
        school.push(schoolItem);
      });
      setLeaderboards(leaderboard);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return leaderboard;
  };

  return (
    <LeaderboardListContext.Provider value={{ leaderboards, loading, fetchLeaderboards }}>
      {children}
    </LeaderboardListContext.Provider>
  );
};

type LeaderboardAnalysisContextType = {
  analysis: LeaderboardAnalysis | null;
  loading: boolean;
  fetchAnalysis: (leaderboard_id: number, program_name: string, params: LeaderboardAnalysisParams) => Promise<LeaderboardAnalysis | null>;
};

const LeaderboardAnalysisContext = createContext({} as LeaderboardAnalysisContextType);

const LeaderboardAnalysisProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [analysis, setAnalysis] = useState<LeaderboardAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAnalysis = async (leaderboard_id: number, program_name: string, params: LeaderboardAnalysisParams) => {
    setLoading(true);
    let analysisData: LeaderboardAnalysis | null = null;
    try {
      analysisData = await LeaderboardAPI.fetchLeaderboardAnalysis(leaderboard_id, program_name, params);
      setAnalysis(analysisData);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return analysisData;
  };

  return (
    <LeaderboardAnalysisContext.Provider value={{
      analysis, loading, fetchAnalysis
    }}>
      {children}
    </LeaderboardAnalysisContext.Provider>
  );
};

type LeaderboardImageContextType = {
    image: string | null;
    loading: boolean;
    fetchImage: (leaderboard_id: number) => Promise<string | null>;
};

const LeaderboardImageContext = createContext({} as LeaderboardImageContextType);

const LeaderboardImageProvider = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchImage = async (leaderboard_id: number) => {
        setLoading(true);
        let imageData: Blob | null = null;
        try {
            imageData = await LeaderboardAPI.fetchLeaderboardImage(leaderboard_id);
            setImage(imageData);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
        return imageData;
    };

    return (
        <LeaderboardImageContext.Provider value={{
            image, loading, fetchImage
        }}>
            {children}
        </LeaderboardImageContext.Provider>
    );
};

type WordCloudContextType = {
    wordCloudItems: (WritingMistake | ChatWordCloudItem)[];
    loading: boolean;
    fetchWordCloud: (params: WordCloudParams) => Promise<(WritingMistake | ChatWordCloudItem)[]>;
}

const WordCloudContext = createContext({} as WordCloudContextType);

const WordCloudProvider = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const [wordCloudItems, setWordCloudItems] = useState<(WritingMistake | ChatWordCloudItem)[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchWordCloud = async (params: WordCloudParams) => {
        setLoading(true);
        let wordCloudData: (WritingMistake | ChatWordCloudItem)[] = [];
        try {
            wordCloudData = await LeaderboardAPI.fetchWordCloud(params);
            setWordCloudItems(wordCloudData);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
        return wordCloudData;
    };

    return (
        <WordCloudContext.Provider value={{
            wordCloudItems, loading, fetchWordCloud
        }}>
            {children}
        </WordCloudContext.Provider>
    );
};

export { 
    LeaderboardListContext, 
    LeaderboardListProvider, 
    LeaderboardAnalysisContext, 
    LeaderboardAnalysisProvider, 
    LeaderboardImageContext, 
    LeaderboardImageProvider,
    WordCloudContext,
    WordCloudProvider
};