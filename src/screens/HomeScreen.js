// Tela inicial principal, com seções de recomendações, mixes e histórico recente
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from "@expo/vector-icons";
import { useTheme } from '../contexts/ThemeContext';
import { getUserAvatarColor } from '../utils/avatarColor';

// Dados estáticos de exemplo para a seção "Continuar Ouvindo"
const continueListening = [
  {
    title: "Coffee & Jazz",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600",
  },
  {
    title: "RELEASED",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600",
  },
  {
    title: "Anything Goes",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=600",
  },
  {
    title: "Anime OSTs",
    image:
      "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?q=80&w=600",
  },
  {
    title: "Harry's House",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600",
  },
  {
    title: "Lo-Fi Beats",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600",
  },
];

// Dados estáticos de exemplo para os mixes principais
const mixes = [
  {
    title: "Pop Mix",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600",
    color: "#ff6b81",
  },
  {
    title: "Chill Mix",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600",
    color: "#f9f871",
  },
  {
    title: "K-Pop Mix",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600",
    color: "#6effa2",
  },
  {
    title: "Rock Mix",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600",
    color: "#1e40af",
  },
  {
    title: "Jazz Mix",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600",
    color: "#8b5cf6",
  },
];

// Imagens de exemplo para a seção "Baseado no que você ouviu recentemente"
const recentListening = [
  {
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600",
  },
  {
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?q=80&w=600",
  },
  {
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600",
  },
  {
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=600",
  },
];

// Mixes de gêneros usados para buscar faixas de cada estilo
const genreMixes = [
  {
    title: "Pop Mix",
    query: "pop",
    color: "#ff6b81",
  },
  {
    title: "Chill Mix",
    query: "electronic",
    color: "#f9f871",
  },
  {
    title: "K-Pop Mix",
    query: "k-pop",
    color: "#6effa2",
  },
  {
    title: "Rock Mix",
    query: "rock",
    color: "#1e40af",
  },
  {
    title: "Jazz Mix",
    query: "jazz",
    color: "#8b5cf6",
  },
];

// Normaliza os dados da faixa retornados pela API para o formato usado na UI
// Garante que título, imagem e artista tenham valores fallback se não disponíveis
const formatTrackItem = (track) => ({
  title: track.title || track.name || 'Título indisponível',
  image:
    track.artwork?.['1000x1000'] || track.artwork?.['480x480'] || track.artwork?.['150x150'] ||
    track.artwork?.['100x100'] ||
    'https://via.placeholder.com/150',
  artist: track.user?.name || track.user?.handle || 'Artista desconhecido',
});

export default function App() {
  const { theme, user } = useTheme();

  const styles = getStyles(theme);

  // Estados locais para armazenar dados da home
  // continueListeningData: itens da seção de continuar ouvindo
  // mixesData: dados dos mixes carregados da API
  // recentListeningData: itens recentes baseados no histórico
  const [continueListeningData, setContinueListeningData] = useState([]);
  const [mixesData, setMixesData] = useState([]);
  const [recentListeningData, setRecentListeningData] = useState([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const [homeError, setHomeError] = useState(null);
  const displayName = user?.name || 'Usuário';
  const firstName = displayName.split(' ')[0];
  const avatarColor = getUserAvatarColor(user?.email || user?.name || 'default');
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Carrega dados da tela inicial quando o componente é montado
  // Busca músicas: do histórico, e mixes por gênero via API do Audius
  // Se falhar, usa dados estáticos como fallback
  useEffect(() => {
    // Função genérica para buscar faixas na API do Audius
    const fetchTracks = async (query, limit = 6) => {
      const response = await fetch(
        `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Falha ao carregar dados da API Audius.');
      }

      const data = await response.json();
      return Array.isArray(data.data) ? data.data.map(formatTrackItem) : [];
    };

    // Função que organiza o carregamento de todos os dados da home
    const loadHomeData = async () => {
      setLoadingHome(true);
      setHomeError(null);

      try {
        // Tenta recuperar as últimas faixas pesquisadas do AsyncStorage para o usuário atual
        const storageKey = `@lastSearchTracks:${user?.email || 'guest'}`;
        const storedSearch = await AsyncStorage.getItem(storageKey);
        let continueTracks = [];

        if (storedSearch) {
          const parsed = JSON.parse(storedSearch);
          if (Array.isArray(parsed) && parsed.length > 0) {
            continueTracks = parsed.map(formatTrackItem).slice(0, 6);
          }
        }

        if (continueTracks.length === 0) {
          // Usuário novo ou sem histórico: carrega músicas aleatórias
          const randomQueries = ['pop', 'jazz', 'rock', 'electronic', 'chill', 'indie', 'hip hop', 'r&b', 'latin', 'acoustic'];
          const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
          continueTracks = await fetchTracks(randomQuery, 6);
          if (continueTracks.length === 0) {
            continueTracks = await fetchTracks('top', 6);
          }
        }

        // Busca faixas recentes e a mesma quantidade de mixes
        const recentTracks = await fetchTracks('recent', genreMixes.length);
        const mixItems = await Promise.all(
          genreMixes.map(async (mix) => {
            const tracks = await fetchTracks(mix.query, 4);
            return {
              ...mix,
              image: tracks[0]?.image || 'https://via.placeholder.com/150',
              tracks,
            };
          })
        );

        setContinueListeningData(continueTracks);
        setRecentListeningData(recentTracks);
        setMixesData(mixItems);
      } catch (error) {
        setHomeError(error.message);
      } finally {
        setLoadingHome(false);
      }
    };

    loadHomeData();
  }, [user?.email]);

  // Usa os dados carregados da API quando disponíveis,
  // caso contrário usa valores de fallback definidos localmente
  const continueItems = continueListeningData.length
    ? continueListeningData
    : continueListening;
  const mixItems = mixesData.length ? mixesData : mixes;
  const recentItems = recentListeningData.length ? recentListeningData : recentListening;

  // Dados utilizados para renderizar cada seção da tela
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}> 
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>

            <View>
              <Text style={styles.welcome}>Bem-vindo de volta!</Text>
              <Text style={styles.username}>{displayName}</Text>
            </View>
          </View>

          <View style={styles.headerIcons}>
            <Feather name="bar-chart-2" size={22} color={theme.white} />
          </View>
        </View>

        {/* Seção de continuação de músicas que o usuário pode retomar */}
        <Text style={styles.sectionTitle}>Continuar Ouvindo</Text>

        {loadingHome && (
          <View style={{ marginBottom: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}

        {homeError && (
          <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 20, color: '#ff6b6b' }]}>Erro: {homeError}</Text>
        )}

        <View style={styles.grid}>
          {continueItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />

              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seção de mixes principais em rolagem horizontal */}
        <Text style={styles.sectionTitle}>Seus Top Mixes</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 30 }}
        >
          {mixItems.map((mix, index) => (
            <View key={index} style={styles.mixCard}>
              <Image source={{ uri: mix.image }} style={styles.mixImage} />

              <Text style={styles.mixTitle}>{mix.title}</Text>

              <View
                style={[styles.mixBottomBar, { backgroundColor: mix.color }]}
              />
            </View>
          ))}
        </ScrollView>

        {/* Seção de recomendações baseadas no histórico recente de reprodução */}
        <Text style={styles.sectionTitle}>
          Baseado no que você ouviu recentemente
        </Text>

        <View style={styles.recentContainer}>
          {recentItems.map((item, index) => (
            <Image
              key={index}
              source={{ uri: item.image }}
              style={styles.recentImage}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos CSS-in-JS usados para estruturar e decorar a tela inicial
const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: 40,
      paddingHorizontal: 20,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },

    userInfo: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginRight: 12,
    },

    avatarPlaceholder: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },

    avatarText: {
      color: theme.white,
      fontSize: 24,
      fontWeight: 'bold',
    },

    welcome: {
      color: theme.white,
      fontSize: 24,
      fontWeight: "700",
    },

    username: {
      color: theme.gray300,
      marginTop: 4,
      fontSize: 14,
    },

    headerIcons: {
      flexDirection: "row",
      alignItems: "center",
    },

    sectionTitle: {
      color: theme.white,
      fontSize: 30,
      fontWeight: "700",
      marginBottom: 20,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 30,
    },

    card: {
      width: "48%",
      height: 80,
      backgroundColor: theme.surface,
      borderRadius: 14,
      overflow: "hidden",
      flexDirection: "row",
      marginBottom: 16,
    },

    cardImage: {
      width: 70,
      height: "100%",
    },

    cardTextWrapper: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    cardTitle: {
      color: theme.white,
      fontWeight: "600",
      fontSize: 15,
    },

    mixCard: {
      width: 150,
      marginRight: 16,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: theme.surface,
    },

    mixImage: {
      width: "100%",
      height: 200,
    },

    mixTitle: {
      position: "absolute",
      top: 12,
      left: 12,
      color: theme.white,
      fontWeight: "700",
      fontSize: 22,
    },

    mixBottomBar: {
      height: 6,
      width: "100%",
    },

    recentContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 30,
    },

    recentImage: {
      width: "48%",
      height: 180,
      borderRadius: 16,
      marginBottom: 12,
    }
  });