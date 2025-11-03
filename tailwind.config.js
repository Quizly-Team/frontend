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
    },
  },
  plugins: [],
};
