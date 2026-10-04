export const colors = {
  primary: '#1A56C8',
  primaryDark: '#123A8A',
  primarySoft: '#E8F0FC',
  accent: '#F47B20',
  accentSoft: '#FFF1E4',
  background: '#F4F7FC',
  surface: '#FFFFFF',
  text: '#12233F',
  textMuted: '#5B6B86',
  textOnPrimary: '#FFFFFF',
  border: '#D5DEF0',
  danger: '#C62828',
  dangerSoft: '#FDECEC',
  success: '#1B7A4E',
  successSoft: '#E8F6EE',
  warning: '#F47B20',
  overlay: 'rgba(18, 35, 63, 0.45)',
  pinDot: '#1A56C8',
  pinEmpty: '#C5D3EA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.4 },
  h1: { fontSize: 22, fontWeight: '700' as const },
  h2: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  amount: { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.6 },
};

export const shadow = {
  card: {
    shadowColor: '#123A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  floating: {
    shadowColor: '#123A8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
};
