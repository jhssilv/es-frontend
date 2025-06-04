import type { ReactNode } from 'react';

export interface MenuItemData {
  text: string;
  icon: ReactNode;
  effect?: () => void;
}