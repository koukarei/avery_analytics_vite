/** @jsxImportSource @emotion/react */
import React, { useContext } from "react";
import { css, keyframes } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import {theme} from "../../src/Theme";
import { Link, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import HighlightOffIcon from '../icons/HighlightOffIcon';
import type { Leaderboard, LeaderboardAnalysis, LeaderboardAnalysisParams, Scene } from "../../types/leaderboard";

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
  title: {
    required: "タイトルを入力してください",
    maxLength: {
      value: 254,
      message: "タイトルが長すぎます",
    },
  },
  story_extract: {
    required: "ストーリー抜粋を入力してください",
    maxLength: {
      value: 254,
      message: "ストーリー抜粋は 254 文字以内で入力してください",
    },
  },
  published_at: {
    required: "公開日を入力してください",
  },
};

function ViewLeaderboard({ leaderboard, analysis, scenes }: { leaderboard: Leaderboard, analysis: LeaderboardAnalysis, scenes: Scene[] }) {

  const {
    control,
    formState: { errors },
  } = useForm<Leaderboard>({
    defaultValues:{
      title: analysis.title,
      scene: leaderboard.scene.id,
      story_extract: analysis.story_extract,
      published_at: analysis.published_at,
    }
  });

  return (
    <>
      <form css={formStyle(theme)}>
        <div css={formInputStyle}>
          <Controller
            name="title"
            control={control}
            rules={rules.title}
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
                disabled 
                label="タイトル"
                placeholder="タイトル"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div>
        <div css={formInputStyle}>
          <Controller
            name="scene"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                disabled 
                label="シーン"
                placeholder="シーン"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              >
                {Array.isArray(scenes) && scenes.map((scene) => (
                  <MenuItem key={scene.id} value={scene.id}>
                    {scene.name}
                  </MenuItem>
                ))}

              </TextField>
            )}
          />
        </div>
        {errors.root && (
          <div css={errorMessageStyle}>{errors.root.message}</div>
        )}
      </form>
    </>
  );
}

function EditLeaderboard({ leaderboard }: { leaderboard: LeaderboardAnalysis | null }) {
  

  return (
    <>

    </>
  );
};

export default function LeaderboardForm() {
  const [searchParams] = useSearchParams();

  sessionStorage.removeItem("token");

  let comp;
  if (searchParams.has("edit")) {
    comp = <EditLeaderboard />;
  } else {
    comp = <ViewLeaderboard />;
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

const formStyle = (theme: Theme) => css`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 95%;
  padding: 10px;
  margin: 30px 0px;
  background-color: ${theme.palette.background.paper};
  border-radius: 20px;
  box-shadow: 2px 2px 10px 0 rgba(0, 0, 0, 0.3);
  & h1 {
    font-size: 20pt;
    margin-bottom: 30px;
    margin-top: 60px;
  }
`;

const formInputStyle = css`
  margin: 5px;
  width: 85%;
  div {
    color: #000;
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

export { ViewLeaderboard, EditLeaderboard };