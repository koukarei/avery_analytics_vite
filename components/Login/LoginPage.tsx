/** @jsxImportSource @emotion/react */
import React from "react";
import { css, keyframes } from "@emotion/react";
import MenuItem from "@mui/material/MenuItem";
import type { Theme } from "@mui/material/styles";
import {theme} from "../../src/Theme";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import HighlightOffIcon from '../icons/HighlightOffIcon';
import type { SigninData, SignupData } from "../../types/auth";
import { UserAuthAPI } from "../../api/UserAuth";

function ClearAdornment({ name, setValue }: { name: string; setValue: any }) {
  return (
    <InputAdornment position="end">
      <IconButton onClick={() => setValue(name, "")} edge="end" tabIndex={-1}>
        <HighlightOffIcon />
      </IconButton>
    </InputAdornment>
  );
}

const rules = {
  email: {
    required: "メールアドレスを入力してください",
    maxLength: {
      value: 254,
      message: "メールアドレスが長すぎます",
    },
    pattern: {
      value:
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      message: "メールアドレスの形式が不正です",
    },
  },
  username: {
    required: "ユーザー名を入力してください",
    maxLength: {
      value: 30,
      message: "ユーザー名は 30 文字以内で入力してください",
    },
    pattern: {
      value: /^[a-zA-Z0-9._-]+$/,
      message: "使用できない文字が含まれています",
    },
  },
  password: {
    required: "パスワードを入力してください",
    minLength: {
      value: 8,
      message: "パスワードは 8 文字以上 30 文字以内で入力してください",
    },
    maxLength: {
      value: 30,
      message: "パスワードは 8 文字以上 30 文字以内で入力してください",
    },
    pattern: {
      value: /^(?=.*[A-Z])(?=.*[.?/-])[a-zA-Z0-9.?/-]*$/,
      message: "使用できない文字が含まれています",
    },
  },
  display_name: {
    required: "表示名を入力してください",
    maxLength: {
      value: 30,
      message: "表示名は 30 文字以内で入力してください",
    },
  },
  user_type: {
    required: "ユーザータイプを選択してください",
  },
  program: {
    required: "プログラムを選択してください",
  }
};

const programs = [
  {
    value: "inlab_test",
    label: "InLab テストプログラム",
  },
  {
    value: "student_1_sem_awe",
    label: "自動評価プログラム",
  },
  {
    value: "student_1_sem_img",
    label: "画像生成プログラム",
  },
  {
    value: "student_2_sem",
    label: "自動評価・画像生成プログラム",
  },
];

function Signin() {
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SigninData>({
    defaultValues:{
        program: "student_2_sem", // Default program for login
        username: "",
        password: "",
    }
  });
  const navigate = useNavigate();

  const onSubmit = async (data: SigninData) => {
    try {
      const authData = await UserAuthAPI.login(data);
      for (const [key, value] of Object.entries(authData)) {
        sessionStorage.setItem(key, String(value));
      }
      sessionStorage.setItem("program", data.program)
      navigate("/");
    } catch (e) {
      console.log(e);
      setError("root", {
        type: "manual",
        message: "ユーザー名またはパスワードが違います。",
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} css={formStyle}>
        <h1>ログイン</h1>
        <div css={formInputStyle}>
          <Controller
            name="username"
            control={control}
            rules={rules.username}
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
                label="ユーザー名"
                placeholder="ユーザー名"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                InputProps={{
                  endAdornment: (
                    <ClearAdornment name={field.name} setValue={setValue} />
                  ),
                }}
              />
            )}
          />
        </div>
        <div css={formInputStyle}>
          <Controller
            name="password"
            control={control}
            rules={rules.password}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="password"
                label="パスワード"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                InputProps={{
                  endAdornment: (
                    <ClearAdornment name={field.name} setValue={setValue} />
                  ),
                }}
              />
            )}
          />
        </div>
        <div css={formInputStyle}>
          <Controller
            name="program"
            control={control}
            rules={rules.program}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                label="プログラム"
                placeholder="プログラム"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              >
                {programs.map((program) => (
                  <MenuItem key={program.value} value={program.value}>
                    {program.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </div>
        {errors.root && (
          <div css={errorMessageStyle}>{errors.root.message}</div>
        )}
        <button type="submit" css={okButtonStyle (theme)}>
          ログイン
        </button>
      </form>
      <div css={navigateLinkStyle(theme)}>
        <Link to="/login?signup">新規登録</Link>
      </div>
    </>
  );
}

function Signup() {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SignupData>({
    defaultValues:{
        is_admin: false,
        user_type: "student"
    }
  });
  const navigate = useNavigate();

  const onSubmit = async (data: SignupData) => {
    try {
      await UserAuthAPI.signup(data);
      navigate("/login?signin");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} css={formStyle}>
        <h1>新規登録</h1>
        <div css={formInputStyle}>
          <Controller
            name="email"
            control={control}
            rules={rules.email}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="メールアドレス"
                placeholder="email@example.com"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                InputProps={{
                  endAdornment: (
                    <ClearAdornment name={field.name} setValue={setValue} />
                  ),
                }}
              />
            )}
          />
        </div>
        <div css={formInputStyle}>
          <Controller
            name="username"
            control={control}
            rules={rules.username}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="ユーザー名"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                InputProps={{
                  endAdornment: (
                    <ClearAdornment name={field.name} setValue={setValue} />
                  ),
                }}
              />
            )}
          />
        </div>
        <div css={formInputStyle}>
          <Controller
            name="password1"
            control={control}
            rules={rules.password}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="password"
                label="パスワード"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                InputProps={{
                  endAdornment: (
                    <ClearAdornment name={field.name} setValue={setValue} />
                  ),
                }}
              />
            )}
          />
        </div>
        <div css={formInputStyle}>
          <Controller
            name="password2"
            control={control}
            rules={{
              required: "確認用のパスワードを入力してください",
              validate: (input) => {
                if (input !== getValues("password1")) {
                  return "パスワードが一致していません";
                }
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="password"
                label="パスワード(確認用)"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                InputProps={{
                  endAdornment: (
                    <ClearAdornment name={field.name} setValue={setValue} />
                  ),
                }}
              />
            )}
          />
        </div>
        <div css={formInputStyle}>
          <Controller
            name="display_name"
            control={control}
            rules={rules.display_name}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="表示名"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                InputProps={{
                  endAdornment: (
                    <ClearAdornment name={field.name} setValue={setValue} />
                  ),
                }}
              />
            )}
          />
        </div>
        <button type="submit" css={okButtonStyle (theme)}>
          登録
        </button>
      </form>
      <div css={navigateLinkStyle (theme)}>
        <Link to="/login?signin">ログイン</Link>
      </div>
    </>
  );
}

// ログイン / 新規登録
function Select() {
  return (
    <div css={selectLinkStyle (theme)}>
      <Link css={selectLoginLinkStyle (theme)} to="/login?signin">
        ログイン
      </Link>
      <Link to="/login?signup">新規登録</Link>
    </div>
  );
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();

  sessionStorage.removeItem("token");

  let comp;
  if (searchParams.has("signin")) {
    comp = <Signin />;
  } else if (searchParams.has("signup")) {
    comp = <Signup />;
  } else {
    comp = <Select />;
  }

  return (
    <Box css={backStyle(theme)}>
      <div css={containerStyle}>{comp}</div>
    </Box>
  );
}

const backStyle = (theme: Theme) => css`
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${theme.palette.primary.main};
  background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 20%,
      ${theme.palette.primary.main} 100%
    ),
    url(${process.env.PUBLIC_URL + "/images/background.jpg"});
  background-position: center bottom;
  background-size: 140%;
  background-repeat: no-repeat;
`;

const containerStyle = css`
  width: 80%;
  max-width: 600px;
  text-align: center;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
`;

const fadeUpAnime = keyframes`
  from {
    opacity: 0;
    transform: translateY(100px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const formStyle = css`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 95%;
  padding: 10px;
  margin: 30px 0px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 2px 2px 10px 0 rgba(0, 0, 0, 0.3);
  animation: ${fadeUpAnime} 1s ease forwards;
  & h1 {
    font-size: 20pt;
    margin-bottom: 30px;
    margin-top: 60px;
  }
`;

const formInputStyle = css`
  margin: 5px;
  width: 90%;
  max-width: 300px;
  div {
    color: #000;
  }
`;

const okButtonStyle = (theme: Theme) => css`
  background-color: ${theme.palette.primary.main};
  color: white;
  border-radius: 40px;
  border: none;
  width: 120px;
  height: 45px;
  margin: 30px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  font-size: 12pt;
  font-weight: 300;
  &:hover {
    background-color: ${theme.palette.primary.light};
  }
`;

const navigateLinkStyle = (theme: Theme) => css`
  padding-bottom: 20px;
  & * {
    display: block;
    color: ${theme.palette.primary.contrastText};
    margin: 20px 0;
  }
`;

const selectLinkStyle = (theme: Theme) => css`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  padding-bottom: 40px;
  box-sizing: border-box;
  & * {
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${theme.palette.primary.contrastText};
    border: solid 1px ${theme.palette.primary.contrastText};
    border-radius: 20px;
    margin: 20px 0;
    width: 100%;
    height: 40px;
    text-decoration: none;
  }
`;

const selectLoginLinkStyle = (theme: Theme) => css`
  color: ${theme.palette.primary.main};
  background-color: ${theme.palette.primary.contrastText};
`;

const errorMessageStyle = css`
  font-size: 14px;
  color: red;
`;