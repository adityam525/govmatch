// Single source of truth for the design. Web maps these to CSS variables; mobile reads them directly.
export const colors = {
  primary: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a' },
  neutral: { 0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 400: '#94a3b8', 600: '#475569', 900: '#0f172a' },
  success: '#16a34a', warning: '#f59e0b', danger: '#dc2626', info: '#2563eb',
} as const;

// Section rhythm by screen size (px): phone, tablet 768+, desktop 1024+.
export const space = { sectionGap: { base: 48, md: 80, lg: 128 }, sectionHead: { base: 16, md: 20, lg: 24 }, pageX: { base: 16, md: 24, lg: 24 } } as const;

// Text roles: size/line height in px by screen size.
export const type = {
  pageTitle: { base: [22, 28], md: [26, 32], lg: [30, 36], weight: 700 },
  sectionTitle: { base: [18, 26], md: [20, 28], lg: [22, 29], weight: 700 },
  body: { base: [15, 22], weight: 400 },
  small: { base: [13, 18], weight: 400 },
  caption: { base: [11, 16], weight: 500 },
} as const;

export const radius = { sm: 6, md: 8, lg: 12, xl: 16 } as const;
