export interface Profile {
  id?: number;
  display_name: string;
  level?: number;
}

export interface User {
  id: number;
  username?: string;
  email?: string;
  is_admin?: boolean; // it would set to false as always by backend
  user_type?: string;
  is_active?: boolean;
  school?: string;
  profiles: Profile;
}

export interface UsersStats {
  n_users: number;
  n_active_users: number;
}

export interface UserListParams {
  skip?: number;
  limit?: number;
}

export interface UserUpdate{
  id?: number;
  username?: string;
  email?: string;
  is_admin?: boolean; // it would set to false as always by backend
  user_type?: string;
  is_active?: boolean;
}

export interface UserPasswordUpdate{
  id?: number;
  old_password?: string;
  new_password?: string;
}
