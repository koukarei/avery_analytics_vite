/** @jsxImportSource @emotion/react */
import { CardHeader, CardContent, TextField } from "@mui/material";
import React from "react";
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
    disabledSubmit: boolean;
    isLoading: boolean;
}

export const WritingFrame: React.FC<WritingFrameProps> = ({ title,imageUrl, writingText, setWritingText, submitWritingFn, disabledSubmit, isLoading }) => {
    const { t } = useLocalization();

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
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
                value: /^[\x20-\x7E\r\n]+$/,
                message: t("writerView.writingFrame.error.pattern")
            }
        },
        submit: {}
    };

    const onSubmit = (data: { writing: string }) => {
        setWritingText(data.writing);
        submitWritingFn();
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card css={WritingFrameStyle(theme)} variant="outlined">
                    <div className='flex-col w-1/3 items-center' css={css`@media (max-width: 600px) { width: 100%; }`}>
                        <CardHeader title={title} />
                        {imageUrl ? (
                            <ImageListItem style={{ minWidth: '200px', maxWidth: '60%', padding: 5, marginBottom: '8px' }}>
                                <img src={imageUrl} alt="Writing" />
                            </ImageListItem>
                        ) : null}
                    </div>
                    <CardContent css={typingAreaStyle} className="w-2/3 md:w-1/2">
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
                                onFocus={(event) => {
                                    if (!disabledSubmit) {
                                        event.target.select();
                                    }
                                    
                                }}
                                disabled={disabledSubmit}
                                minRows={10}
                                variant="outlined"
                                error={errors[field.name] ? true : false}
                                helperText={(errors[field.name]?.message as string) || " "}
                                placeholder={
                                    disabledSubmit ? t("writerView.writingFrame.placeholderDisabled") :
                                    t("writerView.writingFrame.placeholder")
                                }
                                onChange={(e) => {
                                    field.onChange(e);
                                    setWritingText(e.target.value);
                                }}
                            />
                        )}
                        />
                        <Controller
                            name="writing"
                            control={control}
                            render={() => (
                                <Button
                                    css={SubmitWritingButton(theme)}
                                    disabled={disabledSubmit || !isValid || isLoading}
                                    type="submit"
                                    variant="contained"
                                >
                                    { disabledSubmit ? t("writerView.writingFrame.submit.time_exceeded") : isLoading ? t("writerView.writingFrame.submit.loading") : t("writerView.writingFrame.submit.ok_to_proceed")}
                                </Button>
                            )}
                        />
                    </CardContent>
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
        background-color: ${theme.palette.primary.light};
    }
`;