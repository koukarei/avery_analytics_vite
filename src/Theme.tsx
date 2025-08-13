import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            light: "#9a9a9aff",
            main: "#737373ff",
            dark: "#575757ff",
            contrastText: "#f0ffec",
        },
        secondary: {
            light: "#373a9bff",
            main: "#2e2888ff",
            dark: "#1b1978ff",
        },
        background: {
            paper: "#f1f5e6",
        },
    }
});

export { theme };