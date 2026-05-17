# Musium App

Aplicativo de música desenvolvido em React Native com Expo. Inclui telas de login/cadastro, home com recomendações, busca de faixas/artistas, favoritos e configurações de usuário.

## Tecnologias

- React Native
- Expo
- React Navigation
- AsyncStorage para armazenamento local
- API Audius para busca de faixas e artistas

## Estrutura do projeto

- `App.js` - Ponto de entrada do app, configura o `ThemeProvider` e a navegação.
- `src/contexts/ThemeContext.js` - Contexto de tema e autenticação com métodos de login, registro, logout, alteração de nome, senha e exclusão de conta.
- `src/navigation/StackNavigator.js` - Navegação principal entre login e área autenticada.
- `src/navigation/TabNavigator.js` - Navegação em abas para `Home`, `Search`, `Favorites` e `Settings`.
- `src/screens/LoginScreen.js` - Tela de login e cadastro.
- `src/screens/HomeScreen.js` - Tela inicial com recomendações e mixes.
- `src/screens/SearchScreen.js` - Tela de busca de músicas e artistas.
- `src/screens/FavoritesScreen.js` - Tela de favoritos com músicas, playlists e álbuns.
- `src/screens/SettingsScreen.js` - Tela de configurações do usuário.
- `src/database/index.js` - Simulação de banco local usando `AsyncStorage`.
- `src/utils/avatarColor.js` - Geração de cores para avatar com base no usuário.
- `src/styles/theme.js` - Tema de cores do app.

## Instalação

1. Clone o repositório:

```bash
git clone <LINK_DO_REPOSITORIO>
cd musium-app
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o aplicativo com Expo:

```bash
npx expo start
```

4. Abra no emulador ou no dispositivo usando o Expo Go.

## Comandos úteis

- `npx expo start` - inicia o Metro Bundler do Expo.
- `npx expo start --android` - abre o app no Android (com emulador ou dispositivo conectado).
- `npx expo start --ios` - abre o app no iOS (macOS / Xcode necessário).
- `npx expo start --web` - roda o app em navegador.

## Uso

- Cadastre um novo usuário ou faça login com um usuário existente.
- Explore a tela inicial com recomendações de faixas.
- Use a aba de busca para procurar músicas e artistas.
- Marque faixas como favoritas na tela de favoritos.
- Altere tema, nome e senha na tela de configurações.

## Membros e componentes desenvolvidos

- **Antonio Moura da Costa Filho - 01832627** - `SettingsScreen.js`
- **Enzo de Melo Cordeiro - 01776025** - `LoginScreen.js`
- **Dyuhan Lucas de Oliveira Ferreira - 01805592** - `HomeScreen.js`
- **Marcus Vinicius Ferreira Lustosa - 01796456** - `FavoritesScreen.js`
- **Rafael de Sousa Oliveira - 01804612** - `SearchScreen.js`
