/** @type {import('tailwindcss').Config} */
import { colors } from './src/styles/theme/colors';
import { typography } from './src/styles/theme/typography';
import { spacing } from './src/styles/theme/spacing';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: colors,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
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
  plugins: [],
};
