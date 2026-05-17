import AsyncStorage from '@react-native-async-storage/async-storage';

// Módulo de banco de dados local usando AsyncStorage para salvar usuários
// Todas as operações são assíncronas e baseadas em armazenamento em memória do dispositivo

// Inicializar banco (AsyncStorage não precisa inicialização específica)// Está sempre pronto para uso quando o app iniciaexport const initDatabase = async () => {
  // AsyncStorage está sempre pronto
  return Promise.resolve();
};

// Cadastra novo usuário com validação de email duplicado
// Retorna o ID do novo usuário ou lança erro se o email já existe
export const registerUser = async (email, password, name) => {
  try {
    const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
      throw new Error('Email já cadastrado');
    }
    // Cria novo usuário e persiste localmente
    const newUser = {
      id: Date.now(),
      email,
      password,
      name,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return newUser.id;
  } catch (error) {
    throw error;
  }
};

// Autentica o usuário verificando credenciais no armazenamento local
// Retorna os dados do usuário se encontrado ou null se falhar
export const loginUser = async (email, password) => {
  try {
    const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
  } catch (error) {
    throw error;
  }
};

// Verifica se um email já existe para evitar cadastro duplicado
// Retorna true se o email já está registrado, false caso contrário
export const checkEmailExists = async (email) => {
  try {
    const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
    return users.some(user => user.email === email);
  } catch (error) {
    throw error;
  }
};

// Atualiza o nome do usuário no armazenamento local
// Localiza o usuário pelo email e altera seu nome registrado
export const updateUserName = async (email, newName) => {
  try {
    const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
    const index = users.findIndex(user => user.email === email);
    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }
    users[index].name = newName;
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return true;
  } catch (error) {
    throw error;
  }
};

// Altera a senha do usuário após validação da senha atual
// Requer autenticidade: a senha atual deve ser correta para permitir mudança
export const updateUserPassword = async (email, currentPassword, newPassword) => {
  try {
    const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
    const index = users.findIndex(user => user.email === email && user.password === currentPassword);
    if (index === -1) {
      throw new Error('Senha atual incorreta');
    }
    users[index].password = newPassword;
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return true;
  } catch (error) {
    throw error;
  }
};

// Remove um usuário e todos os seus dados do armazenamento local
// Operação permanente e irreversível
export const deleteUser = async (email) => {
  try {
    const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
    const updatedUsers = users.filter(user => user.email !== email);
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    return true;
  } catch (error) {
    throw error;
  }
};