export const typography = {
  fontFamily: {
    sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },

  fontSize: {
    // Header Styles
    'header1-bold': ['32px', { lineHeight: '1.5', fontWeight: '700' }],
    'header1-semibold': ['32px', { lineHeight: '1.5', fontWeight: '600' }],
    'header1-medium': ['32px', { lineHeight: '1.5', fontWeight: '500' }],

    'header2-bold': ['28px', { lineHeight: '1.5', fontWeight: '700' }],
    'header2-semibold': ['28px', { lineHeight: '1.5', fontWeight: '600' }],
    'header2-medium': ['28px', { lineHeight: '1.5', fontWeight: '500' }],

    'header3-bold': ['24px', { lineHeight: '1.5', fontWeight: '700' }],
    'header3-semibold': ['24px', { lineHeight: '1.5', fontWeight: '600' }],
    'header3-medium': ['24px', { lineHeight: '1.5', fontWeight: '500' }],

    // Body Styles
    'body1-medium': ['20px', { lineHeight: '1.6', fontWeight: '500' }],
    'body1-regular': ['20px', { lineHeight: '1.6', fontWeight: '400' }],

    'body2-medium': ['18px', { lineHeight: '1.6', fontWeight: '500' }],
    'body2-regular': ['18px', { lineHeight: '1.6', fontWeight: '400' }],

    'body3-medium': ['16px', { lineHeight: '1.6', fontWeight: '500' }],
    'body3-regular': ['16px', { lineHeight: '1.6', fontWeight: '400' }],

    // Text Styles
    'text-regular': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
    'text-light': ['14px', { lineHeight: '1.6', fontWeight: '300' }],
  },

  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
