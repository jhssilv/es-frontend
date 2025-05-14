import { 
    createContext, 
    useState, 
    useEffect, 
    useCallback, 
    type ReactNode 
} from 'react';

import { type UserData } from '../types/UserData';

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  token: string | null;
  role: number;
}

interface AuthContextType extends AuthState {
  login: (userData: UserData, token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  role: 2,
  login: async () => { throw new Error("AuthProvider not found") }, // Add dummy function
  logout: () => { throw new Error("AuthProvider not found") }
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    role: 2,
  });

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      role: 2,
    });
  }, []);

  useEffect(() => {
    logout();
  }, [logout]);

  const login = useCallback(async (userData: UserData, token: string) => {
    setAuthState({
      isAuthenticated: true,
      user: userData.name,
      token,
      role: userData.role,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;