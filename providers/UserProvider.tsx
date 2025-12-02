import React, { createContext, useCallback, useState } from "react";
import { UserAPI } from '../api/User';
import type { User, UserListParams, UsersStats } from '../types/user';

type UsersContextType = {
  users: User[];
  loading: boolean;
  stats: UsersStats | null;
  setStats: (stats: UsersStats | null) => void;
  fetchStats: () => Promise<UsersStats | null>;
  fetchUsers: (listParams: UserListParams) => Promise<User[]>;
};

const UsersContext = createContext({} as UsersContextType);

const UsersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<UsersStats | null>(null);

  const fetchUsers = useCallback(async (listParams: UserListParams) => {
    setLoading(true);
    let usersData: User[] = [];
    try {
      usersData = await UserAPI.fetchUsersList(listParams);
      setUsers(usersData);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
    return usersData;
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    let statsData: UsersStats | null = null;
    try {
      statsData = await UserAPI.fetchUsersStats();
      setStats(statsData);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
    return statsData;
  }, []);

  return (
    <UsersContext.Provider value={{ users, loading, stats, setStats, fetchUsers, fetchStats }}>
      {children}
    </UsersContext.Provider>
  );
};

export { UsersContext, UsersProvider };