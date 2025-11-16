import React, { createContext, useCallback, useState } from "react";
import { UserAPI } from '../api/UserAPI';
import type { User, UserListParams, UsersStats } from '../types/user';

type UsersContextType = {
  users: User[];
  loading: boolean;
  listParams: UserListParams;
  setListParams: (listParams: UserListParams) => void;

  stats: UsersStats | null;
  setStats: (stats: UsersStats | null) => void;
  fetchStats: () => Promise<UsersStats | null>;
  fetchUsers: () => Promise<User[]>;
};

const UsersContext = createContext({} as UsersContextType);

const UsersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [listParams, setListParams] = useState<UserListParams>({ skip: 0, limit: 100 });
  const [stats, setStats] = useState<UsersStats | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let usersData: User[] = [];
    try {
      usersData = await UserAPI.fetchUsers(listParams);
      setUsers(usersData);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
    return usersData;
  }, [listParams]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    let statsData: UsersStats | null = null;
    try {
      statsData = await UserAPI.fetchUsersStats(listParams);
      setStats(statsData);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
    return statsData;
  }, [listParams]);

  return (
    <UsersContext.Provider value={{ users, loading, listParams, setListParams, stats, setStats, fetchUsers, fetchStats }}>
      {children}
    </UsersContext.Provider>
  );
};

export { UsersContext, UsersProvider };