export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    900: "#1e3a8a",
  },
  neutral: {
    0: "#ffffff",
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    400: "#94a3b8",
    600: "#475569",
    900: "#0f172a",
  },
  accent: {
    purple: "#7c3aed",
    orange: "#f97316",
    green: "#16a34a",
    red: "#dc2626",
    amber: "#ca8a04",
    sky: "#0284c7",
  },
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#dc2626",
  info: "#2563eb",
} as const;

export const typography = {
  fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "2.5rem",
  },
  fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;
export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;
export const shadow = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
  md: "0 4px 6px rgba(15, 23, 42, 0.08)",
  lg: "0 10px 15px rgba(15, 23, 42, 0.10)",
  card: "0 2px 8px rgba(15, 23, 42, 0.06)",
} as const;
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const categoryColors: Record<string, string> = {
  ssc: colors.accent.amber,
  rrb: colors.accent.red,
  banking: colors.accent.sky,
  upsc: colors.accent.amber,
  stateGovt: colors.accent.purple,
  defence: colors.accent.green,
  psu: colors.accent.orange,
};
