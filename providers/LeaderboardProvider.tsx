import React, { createContext, useCallback, useState } from "react";
import type { Leaderboard, School, LeaderboardAnalysis, LeaderboardItem, LeaderboardListParams, LeaderboardAnalysisParams, WordCloudParams } from '../types/leaderboard';
import type { WritingMistake, ChatWordCloudItem, Round } from "../types/studentWork"
import { LeaderboardAPI } from "../api/Leaderboard";

type LeaderboardListContextType = {
  leaderboards: Leaderboard[];
  loading: boolean;
  fetchLeaderboards: (params: LeaderboardListParams, is_admin: boolean) => Promise<Leaderboard[]>;
};

type LeaderboardItemContextType = {
  leaderboard: LeaderboardItem | null;
  loading: boolean;
  fetchLeaderboard: (leaderboard_id: number) => Promise<LeaderboardItem | null>;
};

const LeaderboardItemContext = createContext({} as LeaderboardItemContextType);

const LeaderboardItemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaderboard = useCallback(async (leaderboard_id: number) => {
    setLoading(true);
    let leaderboardData: LeaderboardItem | null = null;
    try {
      leaderboardData = await LeaderboardAPI.fetchLeaderboardDetail(leaderboard_id);
      setLeaderboard(leaderboardData);
    } catch (e) {
      console.log(e);
    }finally {
      setLoading(false);
    }

    return leaderboardData;
  }, []);

  return (
    <LeaderboardItemContext.Provider value={{ leaderboard, loading, fetchLeaderboard }}>
      {children}
    </LeaderboardItemContext.Provider>
  );
};

const LeaderboardListContext = createContext({} as LeaderboardListContextType);

const LeaderboardListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaderboards = useCallback(async (params: LeaderboardListParams, is_admin: boolean=false) => {
    setLoading(true);
    let leaderboardData: [Leaderboard, School][] = [];
    let leaderboard: Leaderboard[] = [];
    const school: School[] = [];
    try {
      if (is_admin) {
        leaderboard = await LeaderboardAPI.fetchLeaderboardListAdmin(params);
        setLeaderboards(leaderboard);
      } else {
        leaderboardData = await LeaderboardAPI.fetchLeaderboardList(params);
        leaderboardData.map(([leaderboardItem, schoolItem]) => {
          leaderboard.push(leaderboardItem);
          school.push(schoolItem);
        });
        setLeaderboards(leaderboard);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return leaderboard;
  }, []);

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

type LeaderboardImagesContextType = {
  images: { [key: number]: string }; // Map of leaderboard_id to image URL
  loading: boolean;
  fetchImages: (leaderboard_ids: number[]) => Promise<{ [key: number]: string }>;
}

const LeaderboardImagesContext = createContext({} as LeaderboardImagesContextType);

const LeaderboardImagesProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [images, setImages] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const fetchImages = useCallback(async (leaderboard_ids: number[]) => {
    setLoading(true);
    const newImages: { [key: number]: string } = { ...images };
    try {
      await Promise.all(leaderboard_ids.map(async (id) => {
        if (!newImages[id]) { // Only fetch if not already present
          const imageData = await LeaderboardAPI.fetchLeaderboardImage(id);
          newImages[id] = imageData;
        }
      }));
      setImages(newImages);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return newImages;
  }, []);

  return (
    <LeaderboardImagesContext.Provider value={{
      images, loading, fetchImages
    }}>
      {children}
    </LeaderboardImagesContext.Provider>
  );
}

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

    const fetchImage = useCallback(async (leaderboard_id: number) => {
      setLoading(true);
      let imageData: string | null = null;
      try {
        imageData = await LeaderboardAPI.fetchLeaderboardImage(leaderboard_id);
        setImage(imageData);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
      return imageData;
    }, []);

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


type LeaderboardSchoolType = {
    schoolItems: string[];
    loading: boolean;
    fetchSchoolItems: (id: number) => Promise<string[]>;
}

const LeaderboardSchoolContext = createContext({} as LeaderboardSchoolType);

const LeaderboardSchoolProvider = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const [schoolItems, setSchoolItems] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchSchoolItems = useCallback(async (leaderboard_id: number) => {
    setLoading(true);
    const schoolData: string[] = [];
    try {
      const schools = await LeaderboardAPI.fetchLeaderboardSchools(leaderboard_id);
      schools.forEach(s => {
        if (s && s.school) {
          schoolData.push(s.school);
        }
      });
      setSchoolItems(schoolData);
    } catch (e) {
      console.log(e);
    }finally {
      setLoading(false);
    }

    return schoolData;
  }, []);

    return (
        <LeaderboardSchoolContext.Provider value={{
            schoolItems, loading, fetchSchoolItems
        }}>
            {children}
        </LeaderboardSchoolContext.Provider>
    );
};

type LeaderboardRoundContextType = {
    rounds: Round[];
    loading: boolean;
    fetchRounds: (leaderboard_id: number, params: { program: string }) => Promise<Round[]>;
}

const LeaderboardRoundContext = createContext({} as LeaderboardRoundContextType);

const LeaderboardRoundProvider = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const fetchRounds = useCallback(async (leaderboard_id: number, params: { program: string }) => {
        setLoading(true);
        let roundData: Round[] = [];
        try {
            roundData = await LeaderboardAPI.fetchLeaderboardRounds(leaderboard_id, params);
            setRounds(roundData);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
        return roundData;
    }, []);

    return (
        <LeaderboardRoundContext.Provider value={{
            rounds, loading, fetchRounds
        }}>
            {children}
        </LeaderboardRoundContext.Provider>
    );
};

export { 
    LeaderboardListContext, 
    LeaderboardListProvider, 
    LeaderboardItemContext,
    LeaderboardItemProvider,
    LeaderboardAnalysisContext, 
    LeaderboardAnalysisProvider, 
    LeaderboardImagesContext,
    LeaderboardImagesProvider,
    LeaderboardImageContext, 
    LeaderboardImageProvider,
    WordCloudContext,
    WordCloudProvider,
    LeaderboardSchoolContext,
    LeaderboardSchoolProvider,
    LeaderboardRoundContext,
    LeaderboardRoundProvider
};