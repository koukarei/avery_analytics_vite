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
import type { Leaderboard, LeaderboardAnalysis, LeaderboardDetail, LeaderboardAnalysisParams, Scene, Story } from "../../types/leaderboard";
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

function ViewLeaderboard({ leaderboard, analysis, scenes, stories }: { leaderboard: Leaderboard, analysis: LeaderboardAnalysis, scenes: Scene[], stories: Story[] }) {

  const {
    control,
    formState: { errors },
  } = useForm<LeaderboardDetail>({
    defaultValues:{
      title: analysis.title,
      created_by: leaderboard.created_by.display_name,
      published_at: analysis.published_at,
      scene_id: leaderboard.scene.id,
      story_id: leaderboard.story?.id,
      story_extract: analysis.story_extract,
      descriptions: analysis.descriptions || "",
      vocabularies: leaderboard.vocabularies,
    }
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [typing, setTyping] = useState(false); // 日本語入力中は true
  const tagInputRef = useRef<HTMLInputElement>(null);


  const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value.trim());
  };

  const handleTagInputBlur = () => {
    processTagInput();
  };

  const appendTags = (newTags: string[]) => {
    const uniqueTags = Array.from(new Set(newTags));
    const newTagList = [...tags.filter(tag => !uniqueTags.includes(tag)), ...uniqueTags];
    setTags(newTagList);
  };

  const processTagInput = () => {
    if (tagInput.trim() === '') return;
    const newTags = tagInput.split(/\s+/).filter(tag => tag !== '');
    appendTags(newTags);
    setTagInput('');
  };

  const handleTagDelete = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (typing) return;
    if (e.key === ' ' || e.key === '　' || e.key === 'Enter') {
      processTagInput();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      handleTagDelete(tags.length - 1);
    }
  };

  const setFocusOnTagInput = () => {
    if (tagInputRef.current) {
      tagInputRef.current.focus();
    }
  };

  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    // 確定文字が全角スペースの場合，compositionend イベントが発生しない
    if (e.data === '　') {
      setTyping(false);
      processTagInput();
    }
  };

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
                label="タイトル/ Title"
                placeholder="タイトル"
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div>
        <div css={formInputStyle}>
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
        <div css={formInputStyle}>
          <Controller
            name="published_at"
            control={control}
            rules={rules.published_at}
            render={({ field }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoItem label="公開日/ Published Date">
                  <DatePicker
                    defaultValue={dayjs(analysis.published_at)}
                    disabled
                />
                </DemoItem>
              </LocalizationProvider>
            )}
          />
        </div>
        <div css={formInputStyle}>
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
        <div css={formInputStyle}>
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
        <div css={formInputStyle}>
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
        <div css={formInputStyle}>
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
        </div>
        <div css={tagAreaStyle} onClick={setFocusOnTagInput}>
          {tags.map((tag, index) => (
            <VocabularyChip key={index} label={tag} onDelete={() => handleTagDelete(index)} />
          ))}
          <input type="text"
            ref={tagInputRef}
            value={tagInput}
            placeholder={tags.length == 0 ? 'タグをスペース区切りで入力' : ''}
            onChange={handleTagInputChange}
            onBlur={handleTagInputBlur}
            onKeyDown={handleTagInputKeyDown}
            onCompositionStart={() => setTyping(true)}
            onCompositionUpdate={handleCompositionUpdate}
            onCompositionEnd={() => setTyping(false)}
            css={tagInputStyle}
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

const tagAreaStyle = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px;
  background-color: #e9f7fb;
  border: 1px solid #797979;
  border-left: none;
  border-right: none;
  box-sizing: border-box;
`;

const tagInputStyle = css`
  flex: 1;
  min-width: 50px;
  padding: 5px;
  font-size: 1rem;
  line-height: 1.2;
  border: none;
  outline: none;
  resize: none;
  box-sizing: border-box;
  background-color: transparent;
`;

export { ViewLeaderboard, EditLeaderboard };