/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
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
import { TextField } from "@mui/material";
import type { LeaderboardItem, LeaderboardAnalysis, LeaderboardDetail, LeaderboardAnalysisParams, Scene, Story } from "../../types/leaderboard";
import VocabularyChip from "./VocabularyChip";

import { ImageItem } from '../types';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: (image: ImageItem) => void;
}

export const AddImageModal: React.FC<AddImageModalProps> = ({ isOpen, onClose, onAddImage }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && url.trim()) {
      onAddImage({
        id: `img_${new Date().getTime()}`, // Simple unique ID
        name,
        url,
      });
      setName('');
      setUrl('');
    }
  };

  const {
    control,
    formState: { errors },
  } = useForm<LeaderboardDetail>({});

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-image-modal-title"
    >
      <div 
        className="bg-neutral-800 rounded-lg shadow-xl p-6 md:p-8 w-11/12 max-w-md relative transform transition-all duration-300 ease-in-out scale-95"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        style={isOpen ? { transform: 'scale(1)' } : {}}
      >
        <h2 id="add-image-modal-title" className="text-2xl font-bold mb-6 text-center text-teal-300 select-none">Add a New Image</h2>
        <form onSubmit={handleSubmit} className='grid'>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="title"
            control={control}
            rules={rules.title}
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
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
            disabled
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
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
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-2 px-4 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Add Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const formInputStyle = css`
  margin: 5px;
  width: 85%;
  div {
    color: #000;
  }
`;

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

const errorMessageStyle = css`
  font-size: 14px;
  color: red;
`;