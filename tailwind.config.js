/** @type {import('tailwindcss').Config} */
import { colors } from './src/styles/theme/colors';
import { typography } from './src/styles/theme/typography';
import { spacing } from './src/styles/theme/spacing';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ...colors,
      },
      fontFamily: typography.fontFamily,
      fontWeight: typography.fontWeight,
      spacing: spacing,
      screens: {
        md: '768px',
        lg: '1024px',
      },
      // Grid System - Figma Design System
      container: {
        center: true,
        padding: {
          DEFAULT: '24px', // Web: 양옆 마진 24px
          'max-lg': '60px', // Tablet: 양옆 마진 60px
          'max-md': '20px', // Mobile: 양옆 마진 20px
        },
        screens: {
          DEFAULT: '1024px', // Web: 콘텐츠 영역
          'max-lg': '904px', // Tablet: 콘텐츠 영역
          'max-md': '335px', // Mobile: 콘텐츠 영역
        },
      },
      gap: {
        gutter: '20px', // Web, Tablet 거터
        'gutter-mobile': '12px', // Mobile 거터
      },
      gridTemplateColumns: {
        12: 'repeat(12, minmax(0, 1fr))', // Web: 12칼럼
        6: 'repeat(6, minmax(0, 1fr))', // Tablet, Mobile: 6칼럼
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        // Header Styles
        '.text-header1-bold': {
          fontSize: '32px',
          lineHeight: '1.4',
          fontWeight: '700',
        },
        '.text-header1-semibold': {
          fontSize: '32px',
          lineHeight: '1.4',
          fontWeight: '600',
        },
        '.text-header1-medium': {
          fontSize: '32px',
          lineHeight: '1.4',
          fontWeight: '500',
        },
        '.text-header2-bold': {
          fontSize: '28px',
          lineHeight: '1.4',
          fontWeight: '700',
        },
        '.text-header2-semibold': {
          fontSize: '28px',
          lineHeight: '1.4',
          fontWeight: '600',
        },
        '.text-header2-medium': {
          fontSize: '28px',
          lineHeight: '1.4',
          fontWeight: '500',
        },
        '.text-header3-bold': {
          fontSize: '24px',
          lineHeight: '1.4',
          fontWeight: '700',
        },
        '.text-header3-semibold': {
          fontSize: '24px',
          lineHeight: '1.4',
          fontWeight: '600',
        },
        '.text-header3-medium': {
          fontSize: '24px',
          lineHeight: '1.4',
          fontWeight: '500',
        },
        // Body Styles
        '.text-body1-medium': {
          fontSize: '20px',
          lineHeight: '1.4',
          fontWeight: '500',
        },
        '.text-body1-regular': {
          fontSize: '20px',
          lineHeight: '1.4',
          fontWeight: '400',
        },
        '.text-body2-medium': {
          fontSize: '18px',
          lineHeight: '1.4',
          fontWeight: '500',
        },
        '.text-body2-regular': {
          fontSize: '18px',
          lineHeight: '1.4',
          fontWeight: '400',
        },
        '.text-body3-medium': {
          fontSize: '16px',
          lineHeight: '1.4',
          fontWeight: '500',
        },
        '.text-body3-regular': {
          fontSize: '16px',
          lineHeight: '1.4',
          fontWeight: '400',
        },
        // Tint Styles
        '.text-tint-regular': {
          fontSize: '14px',
          lineHeight: '1.4',
          fontWeight: '400',
        },
        '.text-tint-light': {
          fontSize: '14px',
          lineHeight: '1.4',
          fontWeight: '300',
        },
        // Footer Text - Responsive
        '.text-footer': {
          fontSize: '16px',
          lineHeight: '1.4',
          fontWeight: '400',
          '@media (max-width: 1023px)': {
            fontSize: '14px',
          },
        },
      });
    }),
  ],
};
