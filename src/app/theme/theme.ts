import { definePreset, palette } from '@primeng/themes';
import Lara from '@primeng/themes/lara';
import {
  PaletteDesignToken,
  PrimitiveDesignTokens,
} from '@primeng/themes/types';
import { PasswordDesignTokens } from '@primeng/themes/types/password';

export const whitePalette: PaletteDesignToken = {
  '500': '#ffffff',
};

export const bluePalette = palette('#00395c');

// green based on #007254
export const greenPalette: PaletteDesignToken = {
  '500': '#007254',
  '300': '#004c36',
  '100': '#00271a',
};

// orange based on #ff8300
export const orangePalette: PaletteDesignToken = {
  '500': '#ff8300',
  '300': '#b35900',
  '100': '#662c00',
};

// red based on #d03f15
export const redPalette: PaletteDesignToken = {
  '500': '#d03f15',
  '300': '#8c2f0f',
  '100': '#471807',
};

export const primitives: PrimitiveDesignTokens = {
  amber: whitePalette,
  blue: bluePalette,
  green: greenPalette,
  orange: orangePalette,
  red: redPalette,
  borderRadius: {
    none: '0',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
};

export const SgdfPresetTheme = definePreset(Lara, {
  semantic: {
    primary: bluePalette,
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },

      password: {
        width: '100%',
      } as PasswordDesignTokens,
    },
  },
});
