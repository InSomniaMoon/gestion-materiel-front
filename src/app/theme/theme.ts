import { definePreset, palette } from '@primeng/themes';
import ThemeBase from '@primeng/themes/lara';
import { LaraBaseTokenSections } from '@primeuix/themes/lara/base';
import { ButtonDesignTokens } from '@primeuix/themes/types/button';
import { DataTableDesignTokens } from '@primeuix/themes/types/datatable';
import { DatePickerDesignTokens } from '@primeuix/themes/types/datepicker';
import { MenubarDesignTokens } from '@primeuix/themes/types/menubar';
import { ProgressSpinnerDesignTokens } from '@primeuix/themes/types/progressspinner';
import { StepperDesignTokens } from '@primeuix/themes/types/stepper';
import { TieredMenuDesignTokens } from '@primeuix/themes/types/tieredmenu';

type Palette = {
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  950?: string;
};

export const primitive: LaraBaseTokenSections.Primitive = {
  cyan: palette('#0077b3') as Palette,
  blue: palette('#003a5d') as Palette,
  green: palette('#007254') as Palette,
  orange: palette('#ff8300') as Palette,
  red: palette('#d03f15') as Palette,
  violet: palette('#6e74aa') as Palette,
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
  primitive,
  semantic: {
    primary: primitive.blue,
    focusRing: {
      width: '1px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px',
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
  },
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
            background: `${primitive.blue?.[500]}`,
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
            background: '{highlight.background}',
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
    progressspinner: {
      colorScheme: {
        light: {
          root: {
            'color.1': '{primary.500}',
            'color.2': '{primary.500}',
            'color.3': '{primary.500}',
            'color.4': '{primary.500}',
          },
        },
      },
    } as ProgressSpinnerDesignTokens,
    stepper: {
      root: {
        transitionDuration: '{transition.duration}',
      },
      steppanel: {
        padding: '0',
      },
    } as StepperDesignTokens,
    datepicker: {
      date: {
        padding: '0px',
      },
      panel: {
        padding: '0px',
      },
    } as DatePickerDesignTokens,
  },
});
