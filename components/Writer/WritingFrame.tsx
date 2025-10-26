/** @jsxImportSource @emotion/react */
import { CardHeader, CardContent, TextField, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React, { useEffect, useState } from "react";
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
    displayName?: string;
    setDisplayName: (name: string | undefined) => void;
    showAsAnonymous: boolean;
    setShowAsAnonymous: (show: boolean) => void;
    submitWritingFn: () => void;
    disabledSubmit: boolean;
    isLoading: boolean;
}

export const WritingFrame: React.FC<WritingFrameProps> = ({ title,imageUrl, writingText, setWritingText, displayName, setDisplayName, showAsAnonymous, setShowAsAnonymous, submitWritingFn, disabledSubmit, isLoading }) => {
    const { t } = useLocalization();

    // if you keep local state:
    const [localName, setLocalName] = useState<string | undefined>(displayName);
    const [localAnon, setLocalAnon] = useState<boolean>(showAsAnonymous);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isValid },
    } = useForm<{ writing: string, show_as_anonymous: boolean, display_name: string | undefined }>( {
        defaultValues: { 
            writing: writingText, 
            show_as_anonymous: localAnon, 
            display_name: localName || localStorage.getItem("display_name") || undefined 
        },
        mode: "onChange",
    });

    const watchShowAsAnonymous = watch("show_as_anonymous");

    const rules = {
        writing: {
            required: {
                value: true,
                message: t("writerView.writingFrame.error.required")
            },
            maxLength: {
                value: 16777215,
                message: t("writerView.writingFrame.error.maxLength", { maxLength: 16777215 })
            }, // MediumText limit in MySQL
            minLength: {
                value: 10,
                message: t("writerView.writingFrame.error.minLength", { minLength: 10 })
            },
            pattern: {
                value: /^[\x20-\x7E\r\n]+$/,
                message: t("writerView.writingFrame.error.pattern")
            }
        },
        display_name: {
            maxLength: {
                value: 50,
                message: t("writerView.writingFrame.error.maxLength", { maxLength: 50 })
            },
        },
        submit: {}
    };

    const onSubmit = (data: { writing: string, show_as_anonymous: boolean, display_name: string | undefined }) => {
        setWritingText(data.writing);

        if (!data.show_as_anonymous && data.display_name) {
            setDisplayName(data.display_name);
            setShowAsAnonymous(false);
        } else {
            setDisplayName(undefined);
            setShowAsAnonymous(true);
        }

        submitWritingFn();
    };

    // Sync when parent props change:
    useEffect(() => {
        setLocalName(displayName);
    }, [displayName]);

    useEffect(() => {
        setLocalAnon(showAsAnonymous);
    }, [showAsAnonymous]);

    // Reset form values when parent props update so defaultValues take effect
    useEffect(() => {
        reset({
            writing: writingText,
            show_as_anonymous: showAsAnonymous,
            display_name: displayName ?? localStorage.getItem("display_name") ?? undefined,
        });
    }, [writingText, displayName, showAsAnonymous, reset]);

    // When the user edits the local inputs push updates up:
    useEffect(() => {
        if (localName !== displayName) setDisplayName(localName);
    }, [localName]);

    useEffect(() => {
        if (localAnon !== showAsAnonymous) setShowAsAnonymous(localAnon);
    }, [localAnon]);

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
                        <FormGroup>
                            <Controller
                                name="show_as_anonymous"
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
                                        label={ t("writerView.writingFrame.showAsAnonymous")}
                                    />
                                )}
                            />
                            <Controller
                                name="display_name"
                                control={control}
                                rules={rules.display_name}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        css={displayNameFieldStyle}
                                        label={t("writerView.writingFrame.displayName")}
                                        variant="standard"
                                        error={errors[field.name] ? true : false}
                                        helperText={(errors[field.name]?.message as string) || " "}
                                        disabled={watchShowAsAnonymous}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            localStorage.setItem("display_name", e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </FormGroup>
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
                                    { disabledSubmit ? 
                                    t("writerView.writingFrame.submit.time_exceeded") : 
                                    isLoading ? t("writerView.writingFrame.submit.loading") : t("writerView.writingFrame.submit.ok_to_proceed")
                                    }
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

const displayNameFieldStyle = css`
    margin: 8px;
    width: 50%;
    max-width: 200px;
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