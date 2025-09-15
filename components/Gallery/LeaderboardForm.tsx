/** @jsxImportSource @emotion/react */
import React, { useContext, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { css, keyframes } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {theme} from "../../src/Theme";
import { Controller, useForm } from "react-hook-form";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import HighlightOffIcon from '../icons/HighlightOffIcon';
import type { LeaderboardItem, LeaderboardAnalysis, LeaderboardDetail, LeaderboardAnalysisParams, Scene, Story } from "../../types/leaderboard";
import VocabularyChip from "./VocabularyChip";

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

function ViewLeaderboard({ leaderboard, scenes, stories }: { leaderboard: LeaderboardItem, scenes: Scene[], stories: Story[] }) {

  const {
    control,
    formState: { errors },
  } = useForm<LeaderboardDetail>({
    defaultValues:{
      title: leaderboard.title,
      created_by: leaderboard.created_by.display_name,
      published_at: leaderboard.published_at,
      scene_id: leaderboard.scene.id,
      story_id: leaderboard.story?.id ?? "",
      story_extract: leaderboard.story_extract,
      vocabularies: leaderboard.vocabularies,
    }
  });

  return (
    <>
      <form className="grid">
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="title"
            control={control}
            rules={rules.title}
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
                disabled 
                label="タイトル/ Title"
                placeholder="タイトル"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="created_by"
            control={control}
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
                disabled 
                label="作成者/ Created By"
                placeholder="作成者"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="published_at"
            control={control}
            rules={rules.published_at}
            render={({ field }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoItem>
                  <DatePicker
                    label="公開日/ Published Date"
                    defaultValue={dayjs(leaderboard.published_at)}
                    disabled
                />
                </DemoItem>
              </LocalizationProvider>
            )}
          />
        </div>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="scene_id"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                disabled
                label="シーン/ Scene"
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
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="story_id"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                disabled
                label="ストーリー/ Story"
                placeholder="ストーリー"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              >
                {Array.isArray(stories) && stories.map((story) => (
                  <MenuItem key={story.id} value={story.id}>
                    {story.title}
                  </MenuItem>
                ))}

              </TextField>
            )}
          />
        </div>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="story_extract"
            control={control}
            rules={rules.story_extract}
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
                multiline
                minRows={2}
                maxRows={6}
                disabled
                label="ストーリー抜粋/ Story Extract"
                placeholder="ストーリー抜粋"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div>
        {/* <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="descriptions"
            control={control}
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
                multiline
                minRows={2}
                maxRows={6}
                disabled
                label="説明/ Description"
                placeholder="説明"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div> */}
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

const formInputStyle = css`
  margin: 5px;
  width: 85%;
  div {
    color: #000;
  }
`;

const errorMessageStyle = css`
  font-size: 14px;
  color: red;
`;

export { ViewLeaderboard, EditLeaderboard };