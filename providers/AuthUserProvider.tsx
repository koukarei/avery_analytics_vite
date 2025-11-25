import React, { createContext, useCallback, useEffect, useState } from "react";
import type { User } from '../types/user';
import { UserAPI } from "../api/User";

type AuthUserContextType = {
  currentUser?: User;
  loading: boolean;
};

export const AuthUserContext = createContext({} as AuthUserContextType);

export const AuthUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      if (!sessionStorage.getItem("access_token")) {
        if (localStorage.getItem("authData")) {
          for (const [key, value] of Object.entries(JSON.parse(localStorage.getItem("authData") || "{}"))) {
            sessionStorage.setItem(key, String(value));
          }
        } else {
          setLoading(false);
          return;
        }
      }
      const userData = await UserAPI.fetchAuthUser();
      setUser(userData);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <AuthUserContext.Provider value={{ currentUser: user, loading }}>
      {children}
    </AuthUserContext.Provider>
  );
};