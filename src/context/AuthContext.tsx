import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LoginCredentials, AuthState, UserProfile, LoginResponse } from '../types';
import api from '../services/api';
import { useToast } from '@chakra-ui/react';

interface DecodedToken {
  user_id: string;
  full_name: string;
  email: string;
  profile: UserProfile;
  admin_id?: string;
  exp: number;
}

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Check if the user is already logged in when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token has expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        } else {
          // Token is valid
          setAuthState({
            isAuthenticated: true,
            user: JSON.parse(user),
            token,
          });
        }
      } catch (error) {
        // Invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await api.post<LoginResponse>('/api/users/login', credentials);
      const { token, user_id, user_name, profile } = response.data.detail;
      
      const decoded = jwtDecode<DecodedToken>(token);
      
      const user = {
        id: user_id,
        name: user_name,
        email: decoded.email,
        profile: profile,
        adminId: decoded.admin_id,
      };

      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        user,
        token,
      });

      // Redirect to dashboard
      navigate('/dashboard');
      
      toast({
        title: 'Login bem-sucedido!',
        description: `Bem-vindo, ${user_name}!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.detail?.message || 
                           'Erro ao fazer login. Verifique suas credenciais.';
      
      toast({
        title: 'Erro de autenticação',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update state
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });

    // Redirect to login page
    navigate('/login');
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};