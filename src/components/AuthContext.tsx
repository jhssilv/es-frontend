import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { type UserData } from '../types/UserData';

// 1. Estado de autenticação sem 'role' e com o objeto UserData completo.
interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
}

// 2. Contexto com as novas funções 'updateUser'.
interface AuthContextType extends AuthState {
  login: (userData: UserData, token: string) => void;
  logout: () => void;
  updateUser: (updatedUserData: Partial<UserData>) => void;
}

// Chaves para o localStorage
const USER_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

// Valor inicial do contexto
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: () => { throw new Error('AuthProvider not found'); },
  logout: () => { throw new Error('AuthProvider not found'); },
  updateUser: () => { throw new Error('AuthProvider not found'); },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true); // Estado de loading para verificar a sessão

  // 3. Carregar sessão do localStorage ao iniciar a aplicação
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedUser && storedToken) {
        setAuthState({
          isAuthenticated: true,
          user: JSON.parse(storedUser),
          token: storedToken,
        });
      }
    } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
        // Limpa em caso de dados corrompidos
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // 4. Função de login que persiste os dados
  const login = useCallback((userData: UserData, token: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token);
    setAuthState({
      isAuthenticated: true,
      user: userData,
      token,
    });
  }, []);

  // 5. ATUALIZAÇÃO: Função de logout que limpa os dados
  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }, []);

  // 6. NOVO: Função para atualizar dados do usuário na sessão ativa
  const updateUser = useCallback((updatedUserData: Partial<UserData>) => {
    setAuthState((prevState) => {
      if (!prevState.user) return prevState; // Não faz nada se não houver usuário

      const newUser = { ...prevState.user, ...updatedUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return {
        ...prevState,
        user: newUser,
      };
    });
  }, []);

  // useMemo para evitar recriações desnecessárias do objeto de valor do contexto
  const contextValue = useMemo(() => ({
    ...authState,
    login,
    logout,
    updateUser,
  }), [authState, login, logout, updateUser]);

  // Enquanto verifica o localStorage, pode-se exibir um loader
  if (isLoading) {
    return <div>Carregando sessão...</div>; // Ou um componente de Spinner
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;