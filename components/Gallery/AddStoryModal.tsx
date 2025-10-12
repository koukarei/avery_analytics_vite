/** @jsxImportSource @emotion/react */

import * as React from 'react';
import { css } from "@emotion/react";
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { Controller, useForm } from "react-hook-form";
import type { StoryCreate, Scene, Story} from "../../types/leaderboard";
import { StoryAPI } from "../../api/Story";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import {theme} from "../../src/Theme";
import type { Theme } from "@mui/material/styles";
import { Alert } from '@mui/material';


interface AddStoryModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    scenes: Scene[];
    // changed: accept a React state setter so updater functions (prev => [...prev]) are typed
    setStories: React.Dispatch<React.SetStateAction<Story[]>>;
}


const rules = {
  title: {
    required: "タイトルを入力してください",
    maxLength: {
      value: 254,
      message: "タイトルが長すぎます",
    },
  },
};

export const AddStoryModal: React.FC<AddStoryModalProps> = ({ open, setOpen, scenes, setStories }) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    } = useForm<StoryCreate>({});

  const onSubmit = async (data: StoryCreate) => {
    try {
        const response = await StoryAPI.createStory(data);
        setStories(prev => [response, ...prev]);
        handleClose();
    } catch (error) {
        console.error("Error creating story:", error);
        setErrorMessage("Failed to create story. Please try again.");
    }
};

  return (
    <React.Fragment>
      <Button onClick={handleOpen}><AddBoxRoundedIcon /></Button>
            <Modal
                css={formBackgroundStyle(theme)}
                open={open}
                onClose={handleClose}
                aria-labelledby="add-story-modal"
                aria-describedby="add-story-modal"
            >
            <form onSubmit={handleSubmit(onSubmit)} css={formContainerStyle(theme)} className='grid'>
                <h2 css={css`text-align: center; font-size: 24px;`}>ストーリーを追加/ Add Story</h2>
                <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
                    <Controller
                        name="title"
                        control={control}
                        rules={rules.title}
                        render={({ field }) => (
                        <TextField
                            { ...field }
                            fullWidth
                            value={field.value || ''}
                            label="タイトル/ Title*"
                            placeholder="タイトル"
                            error={errors[field.name] ? true : false}
                            helperText={(errors[field.name]?.message as string) || " "}
                        />
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
                        value={field.value || ''}
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
                <div css={formFileUploadStyle(theme)} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
                    <Controller
                        name="story_content_file"
                        control={control}
                        defaultValue={undefined}
                        render={({ field }) => (
                        <>
                            <input
                                title='テキストファイルを選択'
                                type="file"
                                accept=".txt"
                                // forward ref so RHF can register the input
                                ref={field.ref}
                                onChange={(e) => {
                                    // pass the selected File (or null) into the controller
                                    const file = e.target.files?.[0] ?? null;
                                    field.onChange(file);
                                }}
                            />
                            {/* optional: show selected file name for debugging/UX */}
                            {field.value ? <div css={css`margin-top:4px;`}>{(field.value as File).name}</div> : null}
                        </>
                        )}
                    />
                </div>
                <Box sx={{ flex: '1 1 auto' }} />
                <div css={formInputStyle}>
                    <Button
                        type='submit'
                        css={addButtonStyle(theme)}
                        onClick={handleSubmit(onSubmit)}
                    >
                        ストーリーを追加/ Add Story
                    </Button>
                </div>
                {errorMessage && <Alert severity="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}
                <Box sx={{ flex: '1 1 auto' }} />
            </form>
        </Modal>
    </React.Fragment>
  );
}

const formInputStyle = css`
  margin: 5px;
  width: 85%;
  div {
    color: #000;
  }
`;

const formFileUploadStyle = (theme: Theme) => css`
  margin: 5px;
  width: 85%;
  input {
    border: 1px solid ${theme.palette.divider};
    border-radius: 4px;
  }
`;


const formBackgroundStyle = (theme: Theme) => css`
  position: fixed;
  inset: 0;
  color: ${theme.palette.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: opacity 0.3s ease-in-out;
`;

const formContainerStyle = (theme: Theme) => css`
  background-color: ${theme.palette.background.paper};  
  color: ${theme.palette.text.primary};
  box-shadow: var(--shadow-xl);
  border-radius: var(--radius-lg);
  padding-inline: calc(var(--spacing) * 2);
  padding: 5px;
  align-items: center;
  justify-content: center;
  position: relative;
  width: calc(9/10 * 100%);
  max-width: 500px;
  transition: all 0.3s ease-in-out scale(0.95);
`;

const addButtonStyle = (theme: Theme) => css`
  color: white;
  font-weight: 700;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 0.25rem;
  background-color: ${theme.palette.primary.light};
  &:hover {
    background-color: ${theme.palette.primary.main};
  }
`;