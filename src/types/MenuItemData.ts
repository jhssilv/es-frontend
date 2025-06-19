import type { ReactNode } from 'react';

export type PageKey =
  | 'Pesquisar'
  | 'Meus Livros'
  | 'Minhas Trocas'
  | 'Conta'
  | 'Contatos'
  | 'Configurações'
  | 'Logout';

export interface MenuItemData {
  /** O texto que aparece no menu (também serve como identificador de página) */
  text: PageKey;

  /** O ícone que aparece à esquerda do texto */
  icon: ReactNode;

  /**
   * Se este campo existir, chamaremos essa função (ex: logout).
   * Caso contrário, entenderemos que “text” é a página que queremos mostrar.
   */
  effect?: () => void;
}
