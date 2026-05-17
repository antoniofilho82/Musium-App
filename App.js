// Ponto de entrada do aplicativo que configura o provedor de tema e a navegação
// O ThemeProvider disponibiliza tema escuro/claro e informações de usuário para toda a app
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/contexts/ThemeContext';

import StackNavigator from './src/navigation/StackNavigator.js';

export default function App() {
  return (
    // ThemeProvider disponibiliza tema escuro/claro e informações de usuário para o app
    <ThemeProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}