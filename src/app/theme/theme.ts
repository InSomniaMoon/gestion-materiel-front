import { definePreset, palette } from '@primeng/themes';
import ThemeBase from '@primeng/themes/lara';
import {
  PrimitiveDesignTokens,
  SemanticDesignTokens,
} from '@primeng/themes/types';
import { ButtonDesignTokens } from '@primeng/themes/types/button';
import { DataTableDesignTokens } from '@primeng/themes/types/datatable';
import { MenubarDesignTokens } from '@primeng/themes/types/menubar';
import { TieredMenuDesignTokens } from '@primeng/themes/types/tieredmenu';

const whitePalette = palette('#ffffff');
export const primitives: PrimitiveDesignTokens = {
  cyan: palette('#0077b3'),
  blue: palette('#003a5d'),
  green: palette('#007254'),
  orange: palette('#ff8300'),
  red: palette('#d03f15'),
  violet: palette('#6e74aa'),
  amber: whitePalette,
  emerald: whitePalette,
  fuchsia: whitePalette,
  yellow: whitePalette,
  indigo: whitePalette,
  lime: whitePalette,
  pink: whitePalette,
  purple: whitePalette,
  rose: whitePalette,
  sky: whitePalette,
  // gray: whitePalette,
  // zinc: whitePalette,
  // neutral: whitePalette,
  // slate: whitePalette,
  // stone: whitePalette,
  // teal: whitePalette,
  borderRadius: {
    none: '0',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
};

export const SgdfPresetTheme = definePreset(ThemeBase, {
  primitive: primitives,
  semantic: {
    primary: primitives.blue,
    focusRing: {
      width: '1px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px',
      shadow: 'none',
    },
    iconSize: '1rem',
    transitionDuration: '0.2s',
    anchorGutter: '2px',
    formField: {
      paddingX: '1rem',
      paddingY: '0.5rem',
      sm: {
        fontSize: '0.875rem',
        paddingX: '0.625rem',
        paddingY: '0.375rem',
      },
      lg: {
        fontSize: '1.125rem',
        paddingX: '0.875rem',
        paddingY: '0.625rem',
      },
      borderRadius: '{border.radius.md}',
      // focusRing: {
      //   width: '0',
      //   style: 'none',
      //   color: 'transparent',
      //   offset: '0',
      //   shadow: 'none',
      // },
      transitionDuration: '{transition.duration}',
    },
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
        primary: {
          color: '{primary.500}',
          contrastColor: '#fff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}',
        },
        mask: {
          background: 'rgba(0,0,0,0.4)',
          color: '{surface.200}',
        },
        navigation: {
          item: {
            focusBackground: '{surface.100}',
            activeBackground: '{surface.100}',
            color: '{priamry.contrastColor}',
            focusColor: '{text.hover.color}',
            activeColor: '{text.hover.color}',
            icon: {
              color: '{surface.400}',
              focusColor: '{surface.500}',
              activeColor: '{surface.500}',
            },
          },
          submenuLabel: {
            background: 'transparent',
            color: '{surface.0}',
          },
          submenuIcon: {
            color: '{surface.400}',
            focusColor: '{surface.500}',
            activeColor: '{surface.500}',
          },
        },
      },
    },
  } as SemanticDesignTokens,
  components: {
    menubar: {
      colorScheme: {
        light: {
          root: {
            borderColor: '{primary.color}',
            borderRadius: '{border.radius.none}',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            transitionDuration: '{transition.duration}',
            background: '{primary.color}',
          },
          item: {
            color: '{primary.contrastColor}',
          },
          submenu: {
            background: `${primitives!.blue?.[500]}`,
            borderColor: '{primary.color}',
          },
        },
      },
    } as MenubarDesignTokens,
    button: {
      colorScheme: {
        light: {
          root: {
            info: {
              background: '{cyan.500}',
              hoverBackground: '{cyan.600}',
              activeBackground: '{cyan.700}',
            },
            danger: {
              background: '{red.500}',
              hoverBackground: '{red.600}',
              activeBackground: '{red.700}',
            },
          },
        },
      },
    } as ButtonDesignTokens,
    datatable: {
      root: {
        borderColor: '{surface.200}',
        transitionDuration: '{transition.duration}',
      },
      row: {
        background: '{surface.0}',
        hoverBackground: '{primary.500}',
      },

      colorScheme: {
        light: {
          root: {
            borderColor: '{surface.200}',
            transitionDuration: '{transition.duration}',
          },
          header: {
            background: '{surface.400}',
            color: '{text.color}',
          },

          row: {
            background: '{surface.0}',
            hoverBackground: '{primary.500}',
            selectedBackground: '{surface.300}',
            stripedBackground: '{surface.100}',
          },

          headerCell: {
            padding: '0.75rem 0.5rem',
          },
          bodyCell: {
            padding: '0.75rem 0.25rem',
          },
        },
      },
    } as DataTableDesignTokens,
    tieredmenu: {
      css: 'margin-top: 0rem;',
    } as TieredMenuDesignTokens,
  },
});
