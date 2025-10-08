/** @jsxImportSource @emotion/react */
import { TextField } from "@mui/material";
import React, { useEffect } from "react";
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Button from '@mui/material/Button';
import { theme } from "../../src/Theme";
import ImageListItem from "@mui/material/ImageListItem";
import { useForm, Controller } from "react-hook-form";

import { useLocalization } from '../../contexts/localizationUtils';

interface WritingFrameProps {
    title: string;
    imageUrl: string;
    writingText: string;
    setWritingText: (text: string) => void;
    submitWritingFn: () => void;
    setView: ()=>void;
}

export const WritingFrame: React.FC<WritingFrameProps> = ({ title,imageUrl, writingText, setWritingText, submitWritingFn, setView }) => {
    const { t } = useLocalization();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<{ writing: string }>({
        defaultValues: { writing: writingText },
        mode: "onChange",
    });

    const rules = {
        writing: {
            required: {
                value: true,
                message: t("writerView.writingFrame.error.required")
            },
            maxLength: {
                value: 16777215,
                message: t("writerView.writingFrame.error.maxLength")
            }, // MediumText limit in MySQL
            minLength: {
                value: 10,
                message: t("writerView.writingFrame.error.minLength")
            },
            pattern: {
                value: /^[A-Za-z0-9 .,?!'"\n]+$/,
                message: t("writerView.writingFrame.error.pattern")
            }
        }
    };

    const onSubmit = (data: { writing: string }) => {
        setWritingText(data.writing);
        submitWritingFn();
    };

    return (
        <div>
            <button onClick={setView}></button>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card css={WritingFrameStyle(theme)} variant="outlined">
                    <h2>{title}</h2>
                    {imageUrl ? (
                        <ImageListItem style={{ minWidth: '200px', maxWidth: '60%', padding: 5, marginBottom: '8px' }}>
                            <img src={imageUrl} alt="Writing" />
                        </ImageListItem>
                    ) : null}
                    <div css={typingAreaStyle}>
                    <Controller
                        name="writing"
                        control={control}
                        rules={rules.writing}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                css={typingFieldStyle(theme)}
                                multiline
                                fullWidth
                                minRows={10}
                                variant="outlined"
                                error={errors[field.name] ? true : false}
                                helperText={(errors[field.name]?.message as string) || " "}
                                placeholder={t("writerView.writingFrame.placeholder")}
                            />
                        )}
                        />
                        <Button css={SubmitWritingButton(theme)} type="submit" variant="contained">Submit Writing</Button>
                    </div>
                </Card>
            </form>
        </div>
    )
};
const typingFieldStyle = (theme: Theme) => css`
    background-color: ${theme.palette.background.paper};
    margin: 8px;
    width: 90%;
`

const typingAreaStyle = css`
    flex-direction: column;
    width: 100%;
`

const WritingFrameStyle = (theme: Theme) =>css`
    background-color: ${theme.palette.primary.contrastText};
    height: 100%;
    width: 100%;
    display: flex;
    opacity: 0.95;
    
    flex-direction: row;
    
    align-items: start;
    justify-content: center;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
    
    @media (max-width: 600px) {
        flex-direction: column; /* 縦並びにする */
    }
`;

const SubmitWritingButton = (theme: Theme) => css`
    background-color: ${theme.palette.secondary.dark};
    margin: 16px;
    &:hover {
        background-color: ${theme.palette.secondary.light};
    }
`;