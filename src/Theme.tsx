import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            light: "#afdedc",
            main: "#91a8a4",
            dark: "#776871",
            contrastText: "#f0ffee",
        },
        secondary: {
            light: "#c4d7f2",
            main: "#afdedc",
            dark: "#91a8a4",
        },
        background: {
            paper: "#f1f5e6",
        },
        text:{
            primary: "#1f2937",
            secondary: "#4b5563",
        }
    }
});

export { theme };