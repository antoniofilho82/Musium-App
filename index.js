// Inicializador do Expo que registra o componente raiz do aplicativo
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent registra o App como componente principal do projeto
// e cuida da configuração adequada para Expo Go ou builds nativos
registerRootComponent(App);