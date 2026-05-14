import { alpha, createTheme } from "@mui/material/styles";

const primaryMain = "#081f34";
const primaryLight = "#113f6a";
const accentBlue = "#2b88de";
const softBackground = "#eef4f8";
const softSurface = "#f7fafc";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primaryMain,
      dark: "#041321",
      light: primaryLight,
      contrastText: "#ffffff",
    },
    secondary: {
      main: accentBlue,
      dark: "#1e5f9d",
      light: "#d8ebfb",
      contrastText: "#ffffff",
    },
    button: {
      main: primaryLight,
      dark: primaryMain,
      light: accentBlue,
    },
    card: {
      main: softSurface,
      light: "#ffffff",
    },
    text: {
      primary: "#10263d",
      secondary: "#587086",
      main: "#eef4fb",
    },
    background: {
      default: softBackground,
      paper: "#ffffff",
    },
    divider: alpha(primaryMain, 0.08),
    success: {
      main: "#2e7d32",
      light: "#e8f5ea",
    },
    warning: {
      main: "#b7791f",
      light: "#fff4dd",
    },
    error: {
      main: "#b3261e",
      light: "#fdecea",
    },
    info: {
      main: "#1d5f8f",
      light: "#e7f1f8",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
      lineHeight: 1.08,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.12,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      color: "#587086",
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
  },
  shadows: [
    "none",
    "0px 10px 30px rgba(8, 31, 52, 0.05)",
    "0px 12px 34px rgba(8, 31, 52, 0.06)",
    "0px 14px 38px rgba(8, 31, 52, 0.07)",
    "0px 16px 42px rgba(8, 31, 52, 0.08)",
    "0px 18px 46px rgba(8, 31, 52, 0.09)",
    "0px 22px 52px rgba(8, 31, 52, 0.1)",
    "0px 24px 58px rgba(8, 31, 52, 0.11)",
    "0px 26px 64px rgba(8, 31, 52, 0.12)",
    "0px 28px 70px rgba(8, 31, 52, 0.13)",
    "0px 30px 76px rgba(8, 31, 52, 0.14)",
    "0px 32px 82px rgba(8, 31, 52, 0.15)",
    "0px 34px 88px rgba(8, 31, 52, 0.16)",
    "0px 36px 94px rgba(8, 31, 52, 0.17)",
    "0px 38px 100px rgba(8, 31, 52, 0.18)",
    "0px 40px 106px rgba(8, 31, 52, 0.19)",
    "0px 42px 112px rgba(8, 31, 52, 0.2)",
    "0px 44px 118px rgba(8, 31, 52, 0.21)",
    "0px 46px 124px rgba(8, 31, 52, 0.22)",
    "0px 48px 130px rgba(8, 31, 52, 0.23)",
    "0px 50px 136px rgba(8, 31, 52, 0.24)",
    "0px 52px 142px rgba(8, 31, 52, 0.25)",
    "0px 54px 148px rgba(8, 31, 52, 0.26)",
    "0px 56px 154px rgba(8, 31, 52, 0.27)",
    "0px 58px 160px rgba(8, 31, 52, 0.28)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(180deg, #f6f9fb 0%, #eef4f8 52%, #edf3f7 100%)",
          color: "#10263d",
        },
        a: {
          color: "inherit",
        },
        "::selection": {
          backgroundColor: alpha(accentBlue, 0.24),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${alpha(primaryMain, 0.08)}`,
          boxShadow: "0 18px 45px rgba(8, 31, 52, 0.07)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: `1px solid ${alpha(primaryMain, 0.08)}`,
          boxShadow: "0 18px 45px rgba(8, 31, 52, 0.07)",
          borderRadius: 24,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 18,
          minHeight: 44,
          "&.Mui-disabled": {
            color: "rgba(16, 38, 61, 0.42)",
            backgroundColor: "rgba(8, 31, 52, 0.1)",
          },
        },
        containedPrimary: {
          backgroundColor: primaryMain,
          "&:hover": {
            backgroundColor: "#06192b",
          },
        },
        containedSecondary: {
          backgroundColor: accentBlue,
          "&:hover": {
            backgroundColor: "#1e6eb8",
          },
        },
        outlined: {
          borderColor: alpha(primaryMain, 0.18),
          backgroundColor: alpha("#ffffff", 0.72),
          "&:hover": {
            borderColor: alpha(primaryMain, 0.3),
            backgroundColor: alpha(primaryMain, 0.03),
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: alpha("#ffffff", 0.92),
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(primaryMain, 0.12),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(primaryMain, 0.2),
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 4px ${alpha(accentBlue, 0.12)}`,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          overflow: "hidden",
          border: `1px solid ${alpha(primaryMain, 0.08)}`,
          boxShadow: "0 16px 36px rgba(8, 31, 52, 0.06)",
          "&::before": {
            display: "none",
          },
          "&:not(:last-child)": {
            marginBottom: 14,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: primaryMain,
            color: "#ffffff",
            borderBottom: "none",
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: `1px solid ${alpha(primaryMain, 0.08)}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td, &:last-child th": {
            borderBottom: "none",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 12,
          backgroundColor: alpha(primaryMain, 0.94),
          fontSize: 12,
        },
      },
    },
  },
});

export default theme;
