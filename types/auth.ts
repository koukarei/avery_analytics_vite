export type SigninData = {
    username: string;
    password: string;
    program: string;
  };
  
export type SignupData = {
  email: string;
  username: string;
  display_name: string;
  password: string;
  password2: string;
  };
  
export type RandomSignupData = {
  username: string;
  password: string;
  password2: string;
  agree_terms: boolean;
  };