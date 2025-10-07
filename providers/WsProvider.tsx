import React, { createContext, useCallback, useState } from "react";
import { wsAPI } from "../api/WritingWS";
import type { wsTokenResponse } from "../types/websocketAPI";

type WsContextType = {
  wsToken: string | null;
  loading: boolean;
  fetchWsToken: () => Promise<wsTokenResponse | null>;
};

const WsContext = createContext({} as WsContextType);

const WsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wsToken, setWsToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWsToken = useCallback(async () => {
    let wsTokenCache: wsTokenResponse | null = null;
    setLoading(true);
    try {
        wsTokenCache = await wsAPI.fetchWsToken();
        setWsToken(wsTokenCache?.ws_token || null);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
    return wsTokenCache;
  }, []);

  return (
    <WsContext.Provider value={{ wsToken, loading, fetchWsToken }}>
      {children}
    </WsContext.Provider>
  );
};

export { 
    WsContext, 
    WsProvider, 
};