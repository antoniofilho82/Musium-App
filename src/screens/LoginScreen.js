// Tela de login e cadastro do usuário
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  FlatList,
  Button,
  Alert
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginScreen() {
  const { theme, login, register } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const benefits = [
    { id: '1', text: 'Músicas ilimitadas' },
    { id: '2', text: 'Ouça offline' },
    { id: '3', text: 'Sem anúncios' }
  ];

  // Valida campos e executa login ou cadastro de usuário
  // Exibe alertas para campos em branco ou erros de autenticação
  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (isRegistering && !name) {
      Alert.alert('Erro', 'Por favor, preencha o nome.');
      return;
    }

    try {
      if (isRegistering) {
        const result = await register(email, password, name);
        if (result.success) {
          Alert.alert('Sucesso', result.message);
          setIsRegistering(false);
          setName('');
        } else {
          Alert.alert('Erro', result.message);
        }
      } else {
        const success = await login(email, password);
        if (!success) {
          Alert.alert('Erro', 'Email ou senha incorretos.');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    }
  };

  // Estilos específicos para a tela de login
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    hero: {
      marginBottom: 20,
      alignItems: 'center',
    },
    title: {
      color: theme.white,
      fontSize: 32,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.gray300,
      marginTop: 8,
      fontSize: 14,
      textAlign: 'center',
    },
    benefitList: {
      maxHeight: 40,
      marginBottom: 20,
    },
    benefitItem: {
      backgroundColor: theme.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginHorizontal: 5,
      height: 30,
    },
    benefitText: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    label: {
      color: theme.gray300,
      fontSize: 14,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: theme.inputBackground,
      color: theme.white,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    buttonContainer: {
      marginTop: 30,
    },
    switchButton: {
      marginTop: 20,
      alignItems: 'center',
    },
    switchText: {
      color: theme.primary,
      fontSize: 14,
      textDecorationLine: 'underline',
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/musium.jpeg')} 
          style={styles.logo} 
        />
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Musium</Text>
        <Text style={styles.subtitle}>Sua música, seu ritmo, seu mundo.</Text>
      </View>

      <FlatList
        data={benefits}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        style={styles.benefitList}
        contentContainerStyle={{ alignItems: 'center' }}
        renderItem={({ item }) => (
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="seu@email.com"
          placeholderTextColor={theme.gray400}
          style={styles.input}
        />

        {isRegistering && (
          <>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
              placeholderTextColor={theme.gray400}
              style={styles.input}
            />
          </>
        )}

        <Text style={styles.label}>Senha</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Digite sua senha"
          placeholderTextColor={theme.gray400}
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <Button 
            title={isRegistering ? "Cadastrar" : "Entrar"} 
            color={theme.primary} 
            onPress={handleSubmit} 
          />
        </View>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => {
            setIsRegistering(!isRegistering);
            setName('');
          }}
        >
          <Text style={styles.switchText}>
            {isRegistering ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
