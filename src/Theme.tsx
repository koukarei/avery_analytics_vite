import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            light: "#91bdbbff",
            main: "#91a8a4",
            dark: "#776871",
            contrastText: "#f0ffee",
        },
        secondary: {
            light: "#907f89ff",
            main: "#aedad8ff",
            dark: "#776871",
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