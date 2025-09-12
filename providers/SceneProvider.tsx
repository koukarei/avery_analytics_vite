import React, { createContext, useEffect, useState } from "react";
import type { Scene } from '../types/leaderboard';
import { SceneAPI } from "../api/Scene";

type SceneContextType = {
  scenes: Scene[];
  loading: boolean;
};

export const SceneContext = createContext({} as SceneContextType);

export const SceneProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchScenes = async () => {
    setLoading(true);
    try {
      const sceneList = await SceneAPI.fetchSceneList({skip: 0, limit: 100});
      setScenes(sceneList);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScenes();
  }, []);

  return (
    <SceneContext.Provider value={{ scenes, loading }}>
      {children}
    </SceneContext.Provider>
  );
};
