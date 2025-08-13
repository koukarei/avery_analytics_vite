export type SigninData = {
    username: string;
    password: string;
    program: string;
  };
  
  export type SignupData = {
    email: string;
    username: string;
    display_name: string;
    is_admin: boolean; // it would set to false as always by backend
    user_type: string; // Type of user (e.g., student, teacher)
    password1: string;
    password2: string;
  };