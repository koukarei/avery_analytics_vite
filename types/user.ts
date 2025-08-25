export interface Profile {
  display_name: string;
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