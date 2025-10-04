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