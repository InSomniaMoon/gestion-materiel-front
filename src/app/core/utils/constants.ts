import { DynamicDialogConfig } from 'primeng/dynamicdialog';

export const REFRESH_TOKEN_KEY = 'refresh_token';
export const SELECTED_GROUP_ID_KEY = 'selected_group_id';

export const DIALOG_RESPONSIVE_BREAKPOINTS = {
  '960px': '75vw',
  '640px': '90vw',
  '320px': '95vw',
};

export function buildDialogOptions<T>(
  options: DynamicDialogConfig<T>
): DynamicDialogConfig {
  return {
    ...options,
    closeOnEscape: true,
    dismissableMask: true,
    modal: true,
    appendTo: 'body',
    breakpoints: DIALOG_RESPONSIVE_BREAKPOINTS,
  };
}
