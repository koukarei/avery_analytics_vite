import React, { createContext, useCallback, useState } from "react";
import type { GenerationItem, GenerationItemParams } from '../types/leaderboard';
import type { GenerationDetail, ChatMessage } from "../types/studentWork";
import { GenerationItemAPI } from "../api/Generation";

type GenerationContextType = {
  generations: GenerationItem[];
  loading: boolean;
  fetchGenerations: (params: GenerationItemParams) => Promise<GenerationItem[]>;
};

const GenerationListContext = createContext({} as GenerationContextType);

const GenerationListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchGenerations = async (params: GenerationItemParams) => {
    setLoading(true);
    let generationData: GenerationItem[] = [];
    try {
      generationData = await GenerationItemAPI.fetchGenerationItemList(params);
      setGenerations(generationData);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return generationData;
  };

  return (
    <GenerationListContext.Provider value={{ generations, loading, fetchGenerations }}>
      {children}
    </GenerationListContext.Provider>
  );
};

type GenerationImageContextType = {
  image: string | null;
  loading: boolean;
  fetchImage: ({ generation_id }: { generation_id: number }) => Promise<string | null>;
};

const GenerationImageContext = createContext({} as GenerationImageContextType);

const GenerationImageProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchImage = useCallback(async ({ generation_id }: { generation_id: number }) => {
    setLoading(true);
    const retryLimit = 10;
    const retryDelay = 5; // seconds
    let attempt = 0;

    let imageData: string | null = null;
    while (attempt < retryLimit) {
      try {
        imageData = await GenerationItemAPI.fetchGenerationImage(generation_id);
        if (imageData) {
          setImage(imageData);
          break;
        }
      } catch (e) {
        console.log(e);
      }
      attempt++;
      if (attempt < retryLimit) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * 1000));
      }
    }
    setLoading(false);
    return imageData;
  }, []);

  return (
    <GenerationImageContext.Provider value={{ 
      image, loading, fetchImage 
    }}>
      {children}
    </GenerationImageContext.Provider>
  );
};

type GenerationDetailContextType = {
  detail: GenerationDetail | null;
  loading: boolean;
  fetchDetail: (generation_id: number) => Promise<GenerationDetail | null>;
};

const GenerationDetailContext = createContext({} as GenerationDetailContextType);

const GenerationDetailProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [detail, setDetail] = useState<GenerationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDetail = useCallback(async (generation_id: number) => {
    setLoading(true);
    let detailData: GenerationDetail | null = null;
    try {
      detailData = await GenerationItemAPI.fetchGenerationDetail(generation_id);
      setDetail(detailData);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return detailData;
  }, []);

  return (
    <GenerationDetailContext.Provider value={{ detail, loading, fetchDetail }}>
      {children}
    </GenerationDetailContext.Provider>
  );
};

type GenerationEvaluationContextType = {
  evaluation_msg: ChatMessage | null;
  loading: boolean;
  fetchEvaluation: (generation_id: number) => Promise<ChatMessage | null>;
};

const GenerationEvaluationContext = createContext({} as GenerationEvaluationContextType);

const GenerationEvaluationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [evaluation_msg, setEvaluationMsg] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchEvaluation = useCallback(async (generation_id: number) => {
    setLoading(true);
    let evaluationData: ChatMessage | null = null;
    try {
      evaluationData = await GenerationItemAPI.fetchGenerationEvaluation(generation_id);
      setEvaluationMsg(evaluationData);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
    return evaluationData;
  },[]);

  return (
    <GenerationEvaluationContext.Provider value={{ evaluation_msg, loading, fetchEvaluation }}>
      {children}
    </GenerationEvaluationContext.Provider>
  );
};

export { 
  GenerationListContext, 
  GenerationListProvider, 
  GenerationImageContext, 
  GenerationImageProvider, 
  GenerationDetailContext, 
  GenerationDetailProvider,
  GenerationEvaluationContext,
  GenerationEvaluationProvider
};