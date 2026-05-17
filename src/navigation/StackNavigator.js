// Navegação principal da aplicação que alterna entre login e área principal
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const { user } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        // Usuário autenticado vê as telas principais via TabNavigator
        <Stack.Screen
          name="Main"
          component={TabNavigator}
        />
      ) : (
        // Usuário não autenticado vê a tela de login
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      )}
    </Stack.Navigator>
  );
}
