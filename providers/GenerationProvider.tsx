import React, { createContext, useState } from "react";
import type { GenerationItem, GenerationItemParams } from '../types/leaderboard';
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

  const fetchImage = async ({ generation_id }: { generation_id: number }) => {
    setLoading(true);
    let imageData: string | null = null;
    try {
      imageData = await GenerationItemAPI.fetchGenerationImage(generation_id);
      setImage(imageData);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return imageData;
  };

  return (
    <GenerationImageContext.Provider value={{ 
      image, loading, fetchImage 
    }}>
      {children}
    </GenerationImageContext.Provider>
  );
};

export { GenerationListContext, GenerationListProvider, GenerationImageContext, GenerationImageProvider };