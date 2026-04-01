/** @jsxImportSource @emotion/react */
import React, { useContext } from "react";
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import type { SelectChangeEvent } from "@mui/material/Select";
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { FormControlLabel, Checkbox, TextField, Chip, Box } from "@mui/material";
import dayjs from 'dayjs';
import { DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {theme} from "../../src/Theme";
import { Controller, useForm } from "react-hook-form";
import { AddStoryModal } from "./AddStoryModal";
import type { LeaderboardItem, LeaderboardDetail, LeaderboardUpdate, LeaderboardCourseUpdate, Scene, Story } from "../../types/leaderboard";
import type { Course } from "../../types/user";
import { LeaderboardAPI } from "../../api/Leaderboard";
import { useLocalization } from "../../contexts/localizationUtils";

import { LeaderboardListContext } from "../../providers/LeaderboardProvider";

const rules = {
  title: {
    required: "タイトルを入力してください",
    maxLength: {
      value: 254,
      message: "タイトルが長すぎます",
    },
  },
  story_extract: {
    maxLength: {
      value: 254,
      message: "関連描述は 254 文字以内で入力してください",
    },
  },
  published_at: {
    required: "公開日を入力してください",
  },
};

function ViewLeaderboard({ leaderboard, scenes, stories, courses }: { leaderboard: LeaderboardItem, scenes: Scene[], stories: Story[], courses: Course[] }) {
  const { t } = useLocalization();

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
      course_ids: leaderboard.courses?.map((course) => course.course_id) || [],
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
                label={ t("galleryView.form.title") }
                placeholder={ t("galleryView.form.title") }
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="course_ids"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? []}
                fullWidth
                select
                disabled
                label={ t("galleryView.form.course") }
                placeholder={ t("galleryView.form.course") }
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected: unknown) => {
                    const selectedIds = selected as Array<string | number>;
                    return selectedIds
                      .map((id) => {
                        const matched = courses.find((course) => String(course.id) === String(id));
                        return matched?.course_title || matched?.course_label || String(id);
                      })
                      .join(", ");
                  },
                }}
              >
                {Array.isArray(courses) && courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.course_title || course.course_label || course.id}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </div>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="published_at"
            control={control}
            rules={rules.published_at}
            render={() => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoItem>
                  <DatePicker
                    label={ t("galleryView.form.publishedAt") }
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
                label={ t("galleryView.form.scene") }
                placeholder={ t("galleryView.form.scene") }
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
                label={ t("galleryView.form.story") }
                placeholder={ t("galleryView.form.story") }
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
        {errors.root && (
          <div css={errorMessageStyle}>{errors.root.message}</div>
        )}
      </form>
    </>
  );
}

function EditLeaderboard({ leaderboard, scenes, stories, courses }: { leaderboard: LeaderboardItem, scenes: Scene[], stories: Story[], courses: Course[] }) {

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const { listParams, setListParams } = useContext(LeaderboardListContext);
  const [openAddStoryModal, setOpenAddStoryModal] = React.useState<boolean>(false);
  const [storiesForm, setStoriesForm] = React.useState<Story[]>([...stories]);
  const { t } = useLocalization();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaderboardDetail>({
    defaultValues:{
      title: leaderboard.title,
      is_public: leaderboard.is_public ? leaderboard.is_public : false,
      created_by: leaderboard.created_by.display_name,
      published_at: leaderboard.published_at,
      scene_id: leaderboard.scene.id,
      story_id: leaderboard.story?.id ?? "",
      course_ids: leaderboard.courses?.map((course) => course.course_id).filter((id): id is number => id !== undefined) ?? [],
      story_extract: leaderboard.story_extract,
    }
  });

  const onSubmit = async (data: LeaderboardDetail) => {
    try {
      const data_LeaderboardUpdate: LeaderboardUpdate = {
        id: leaderboard.id,
        title: data.title,
        published_at: data.published_at,
        is_public: data.is_public !== undefined ? data.is_public : true,
        scene_id: data.scene_id,
        story_id: data.story_id ? Number(data.story_id) : undefined,
        course_ids: data.course_ids && data.course_ids.length > 0 ? data.course_ids.map(Number) : [],
        story_extract: data.story_extract,
      };
      await LeaderboardAPI.updateLeaderboard(leaderboard.id, data_LeaderboardUpdate);
      setAnchorEl(document.getElementById('save-button') as HTMLButtonElement);

      const data_LeaderboardCourseUpdate: LeaderboardCourseUpdate = {
        leaderboard_id: leaderboard.id,
        course_ids: data.course_ids && data.course_ids.length > 0 ? data.course_ids.map(Number) : [],
      }

      await LeaderboardAPI.setLeaderboardSchools(leaderboard.id, data_LeaderboardCourseUpdate);

      const updatedParams = {
        published_at_start: dayjs(data_LeaderboardUpdate.published_at),
        published_at_end: dayjs(data_LeaderboardUpdate.published_at).add(1, 'day'),
        is_public: data_LeaderboardUpdate.is_public
      };
      setListParams({ ...(listParams ?? {}), ...updatedParams });

    } catch (e) {
      console.log(e);
    } 
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'update-success-popover' : undefined;

  return (
    <>
      <form className="grid" onSubmit={handleSubmit(onSubmit)}>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="title"
            control={control}
            rules={rules.title}
            render={({ field }) => (
              <TextField
                { ...field }
                fullWidth
                label={ t("galleryView.form.title")}
                placeholder={ t("galleryView.form.title")}
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
            name="course_ids"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? []}
                fullWidth
                select
                label={ t("galleryView.form.course") }
                placeholder={ t("galleryView.form.course") }
                error={errors.course_ids ? true : false}
                helperText={(errors.course_ids?.message as string) || " "}
                SelectProps={{
                  multiple: true,
                  onChange: (event: SelectChangeEvent<unknown>) => {
                    const value = event.target.value;
                    const valuesArray =
                      typeof value === "string"
                        ? value.split(",")
                        : Array.isArray(value)
                          ? value
                          : [value];
                    const selectedIds = valuesArray
                      .filter((id): id is string | number => typeof id === "string" || typeof id === "number")
                      .map((id) => Number(id));
                    field.onChange(selectedIds);
                  },
                  renderValue: (selected: unknown) => {
                    const selectedIds = selected as Array<string | number>;
                    
                    return (
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {selectedIds.map((id) => {
                          const matched = courses.find((course) => String(course.id) === String(id));
                          const label = matched?.course_title || matched?.course_label || String(id);
                          return (
                            <Chip 
                              key={id} 
                              label={label}
                              onMouseDown={(e: React.MouseEvent) => {
                                e.stopPropagation();
                              }}
                              onDelete={(e: React.MouseEvent) => {
                                e.stopPropagation(); // Prevent the select dropdown from opening
                                field.onChange((field.value ?? []).filter((v: number) => v !== Number(id)));
                              }}
                            />
                          );
                        })}
                      </Box>
                    ) 
                  },
                }}
              >
                {Array.isArray(courses) && courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.course_title || course.course_label || course.id}
                  </MenuItem>
                ))}

              </TextField>
            )}
          />
        </div>
        <div css={formInputStyle} className="grid grid-flow-row auto-rows-max md:auto-rows-min">
          <Controller
              name="is_public"
              control={control}
              render={({ field }) => (
                  <FormControlLabel
                      control={
                          <Checkbox
                              {...field}
                              checked={field.value}
                              color="default"
                          />
                      }
                      label={ t("galleryView.is_public")}
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
                label={ t("galleryView.form.createdBy") }
                placeholder={ t("galleryView.form.createdBy") }
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
                  label={ t("galleryView.form.publishedAt") }
                  value={field.value ? dayjs(field.value) : null} // bind value
                  views={['year', 'month', 'day']}
                  onChange={(date) => {
                    field.onChange(date ?  date.startOf('day').format() : null); // convert to ISO for API
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
                label={ t("galleryView.form.scene") }
                placeholder={ t("galleryView.form.scene") }
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
                label={ t("galleryView.form.story") }
                placeholder={ t("galleryView.form.story") }
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
                slotProps={{
                  input: { 
                    endAdornment: (
                      <AddStoryModal scenes={scenes} open={openAddStoryModal} setOpen={setOpenAddStoryModal} setStories={setStoriesForm} />
                    )
                  }
                }}
              >
                {Array.isArray(storiesForm) && storiesForm.map((story) => (
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
                label={ t("galleryView.form.description") }
                placeholder={ t("galleryView.form.description") }
                error={errors[field.name] ? true : false}
                helperText={(errors[field.name]?.message as string) || " "}
              />
            )}
          />
        </div>
        {errors.root && (
          <div css={errorMessageStyle}>{errors.root.message}</div>
        )}
        <button id="save-button" aria-describedby={id} type="submit" css={okButtonStyle (theme)}>
          { t("galleryView.form.save") }
        </button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Typography sx={{ p: 2 }}>{ t("galleryView.form.updatedMessage") }</Typography>
        </Popover>
      </form>
    </>
  );
}

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

export { ViewLeaderboard, EditLeaderboard };