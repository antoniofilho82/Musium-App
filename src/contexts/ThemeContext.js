import React, { createContext, useContext, useState, useEffect } from 'react';
import { initDatabase, loginUser, registerUser, checkEmailExists, updateUserPassword, updateUserName, deleteUser } from '../database';

// Definição dos temas claro e escuro usados pela aplicação
const lightTheme = {
  background: '#FAFAFA',
  surface: '#F8F8F8',
  card: '#FFFFFF',
  inputBackground: '#F5F5F5',
  primary: '#1DB954',
  primarySoft: 'rgba(29, 185, 84, 0.1)',
  secondary: '#E8E8E8',
  white: '#2C2C2C',
  gray300: '#7A7A7A',
  gray400: '#A0A0A0',
  gray400Light: '#D0D0D0',
};

const darkTheme = {
  background: '#0D0D0F',
  surface: '#141418',
  card: '#1C1C22',
  inputBackground: '#1E1E26',
  primary: '#1DB954',
  primarySoft: 'rgba(29, 185, 84, 0.15)',
  secondary: '#2F2F39',
  white: '#FFFFFF',
  gray300: '#B3B3B8',
  gray400: '#8B8B97',
  gray400Light: '#D1D1D8',
};

const ThemeContext = createContext();

// Hook personalizado para acessar o contexto de tema e autenticação
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: darkTheme, isDarkMode: true, toggleTheme: () => {}, user: null, login: () => {}, register: () => {}, logout: () => {} };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  // Escolhe o tema com base no estado isDarkMode
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Inicializa o banco local ao montar o provider
    initDatabase().catch(console.error);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Faz login usando o banco local e atualiza o usuário no contexto
  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      if (userData) {
        setUser({ id: userData.id, email: userData.email, name: userData.name });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  // Registra novo usuário se o email ainda não existir
  const register = async (email, password, name) => {
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        return { success: false, message: 'Email já cadastrado' };
      }
      await registerUser(email, password, name);
      return { success: true, message: 'Usuário cadastrado com sucesso' };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: 'Erro ao cadastrar usuário' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user?.email) {
      return { success: false, message: 'Usuário não autenticado' };
    }
    try {
      await updateUserPassword(user.email, currentPassword, newPassword);
      return { success: true, message: 'Senha atualizada com sucesso' };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { success: false, message: error.message || 'Erro ao atualizar senha' };
    }
  };

  // Altera o nome do usuário no banco local e atualiza o contexto
  // Valida se o usuário está autenticado antes de prosseguir
  const changeUserName = async (newName) => {
    if (!user?.email) {
      return { success: false, message: 'Usuário não autenticado' };
    }
    try {
      await updateUserName(user.email, newName);
      setUser({ ...user, name: newName });
      return { success: true, message: 'Nome atualizado com sucesso' };
    } catch (error) {
      console.error('Erro ao alterar nome:', error);
      return { success: false, message: error.message || 'Erro ao atualizar nome' };
    }
  };

  // Deleta a conta do usuário permanentemente do banco local
  // Faz logout automático após a exclusão ser concluída
  const deleteAccount = async () => {
    if (!user?.email) {
      return { success: false, message: 'Usuário não autenticado' };
    }
    try {
      await deleteUser(user.email);
      setUser(null);
      return { success: true, message: 'Conta excluída com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      return { success: false, message: error.message || 'Erro ao deletar conta' };
    }
  };

  // Faz logout removendo o usuário do contexto
  const logout = () => {
    setUser(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, user, login, register, logout, changePassword, changeUserName, deleteAccount }}>
      {children}
    </ThemeContext.Provider>
  );
};
