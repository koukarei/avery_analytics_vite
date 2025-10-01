/** @jsxImportSource @emotion/react */
import React, { useState, useContext } from 'react';
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import dayjs from 'dayjs';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {theme} from "../../src/Theme";
import { Controller, set, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import type { LeaderboardCreate, Scene, Story } from "../../types/leaderboard";

import { FileUploader } from "react-drag-drop-files";

import { SceneContext } from "../../providers/SceneProvider";
import { StoryContext } from "../../providers/StoryProvider";
import { LeaderboardAPI } from '../../api/Leaderboard';

interface AddImageModalProps {
  isOpen: boolean;
  activeStep?: number;
  onClose: () => void;
}

interface InfoInputFormProps {
  handleNext: (values: LeaderboardCreate) => void;
  handleBack: () => void;
  formValues: LeaderboardCreate;
  scenes: Scene[] | null;
  stories: Story[] | null;
}

const InfoInputForm: React.FC<InfoInputFormProps> = ({ handleNext, handleBack, formValues, scenes, stories }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaderboardCreate>({
    defaultValues: formValues,
  });

  const onSubmit = async (data: LeaderboardCreate) => {
    try {
      handleNext(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='grid'>
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
        name="published_at"
        control={control}
        rules={rules.published_at}
        render={({ field }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="公開日/ Published Date"
              value={field.value ? dayjs(field.value) : null}
              views={['year', 'month', 'day']}
              onChange={(date) => {
                  field.onChange(date ? date.startOf('day') : null);
                }}
                slotProps={{
                textField: {
                  error: !!errors.published_at,
                  helperText: errors.published_at?.message || " ",
                  },
                }}
            />
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
            value={field.value || ''}
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
            value={field.value || ''}
            label="関連描述/ Related Narrative*"
            placeholder="関連描述"
            error={errors[field.name] ? true : false}
            helperText={(errors[field.name]?.message as string) || " "}
          />
        )}
      />
    </div>
    {errors.root && (
      <div css={errorMessageStyle}>{errors.root.message}</div>
    )}

    <React.Fragment>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          css={cancelButtonStyle(theme)}
          className='focus:outline-none focus:ring-2 focus:ring-teal-400'
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          戻る/ Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button
          css={addButtonStyle(theme)}
          onClick={handleSubmit(onSubmit)}
        >
          次へ/ Next
        </Button>
      </Box>
    </React.Fragment>
        
    </form>
  )
}

interface ImageUploadProps {
  handleNext: () => void;
  onClose: () => void;
  file: File | null;
  setFile: (file: File | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ handleNext, onClose, file, setFile }) => {
  const fileTypes = ["JPG", "PNG"];
  const handleChange = (file: File | File[]) => {
    if (Array.isArray(file)) {
      setFile(file[0] || null);
    } else {
      setFile(file);
    }
  };

  return (
    <>
      <FileUploader
        handleChange={handleChange}
        name="file"
        types={fileTypes}
      />
      {/*選択ファイル名を表示させる*/}
      <p>{file !== null ? `ファイル名：${file['name']}` : ''}</p>
      <React.Fragment>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            css={cancelButtonStyle(theme)}
            className='focus:outline-none focus:ring-2 focus:ring-teal-400'
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            取消/ Cancel
          </Button>
        <Box sx={{ flex: '1 1 auto' }} />
          <Button
            css={addButtonStyle(theme)}
            onClick={handleNext}
            disabled={!file}
          >
            次へ/ Next
          </Button>
        </Box>
      </React.Fragment>
    </>
  );
};

export const AddImageModal: React.FC<AddImageModalProps> = ({ isOpen, onClose }) => {

  const [activeStep, setActiveStep] = useState(0);

  const steps = ['画像のアップロード', '情報の入力', '相関単語の追加'];

  const { scenes } = useContext(SceneContext);
  const { stories } = useContext(StoryContext);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formValues, setFormValues] = useState<LeaderboardCreate>({
    scene_id: 2,
    published_at: new Date(),
  } as LeaderboardCreate);

  const handleNextToVocab = async (data: LeaderboardCreate) => {
    if ( activeStep === 1 && imageFile ) {
      LeaderboardAPI.createLeaderboardImage(
        imageFile,
      ).then((response) => {
        LeaderboardAPI.createLeaderboard(
          { ...data, original_image_id: response.id, is_public: true }
        )
      }).catch((error) => {
        console.log(error);
      });
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleNextToForm = async () => {
    if ( imageFile ) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    
  };

  if (!isOpen) {
    return null;
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setImageFile(null);
    setFormValues({
      scene_id: 2,
      published_at: new Date(),
    } as LeaderboardCreate);
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ImageUpload handleNext={handleNextToForm} onClose={handleReset} file={imageFile} setFile={setImageFile} />
        );
      case 1:
        return (
          <InfoInputForm handleNext={handleNextToVocab} handleBack={handleBack} formValues={formValues} scenes={scenes} stories={stories} />
        );
      case 2:
        return "Under development";
      default:
        break;
    }
  };

  return (
    <div 
      css={formBackgroundStyle(theme)}
      onClick={handleReset}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-image-modal-title"
    >
      <div 
        css={formContainerStyle(theme)}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        style={isOpen ? { transform: 'scale(1)' } : {}}
      >
        <h2 id="add-image-modal-title" css={formTitleStyle(theme)}>Add a New Writing Task</h2>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {activeStep === steps.length ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              ライティングタスクが正常に追加されました。
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Box sx={{ mt: 2, mb: 1 }}>
              {renderStepContent(activeStep)}
            </Box>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

const formTitleStyle = (theme: Theme) => css`
  text-align: center;
  user-select: none;
  color: ${theme.palette.text.secondary};
  font-size: var(--text-xl);
  line-height: var(--text-xl--line-height);
  font-weight: 700;
  margin-bottom: 6px;
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
    required: "関連描述を入力してください",
    maxLength: {
      value: 254,
      message: "関連描述は 254 文字以内で入力してください",
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

const cancelButtonStyle = (theme: Theme) => css`
  color: white;
  font-weight: 700;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 0.25rem;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  background-color: ${theme.palette.primary.dark};
  &:hover {
    background-color: ${theme.palette.primary.main};
  }
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