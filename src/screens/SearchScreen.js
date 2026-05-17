// Tela de busca de músicas e artistas usando a API do Audius
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const genres = [
  { id: '1', name: 'Pop', color: '#8B5CF6' },
  { id: '2', name: 'Rock', color: '#10B981' },
  { id: '3', name: 'Jazz', color: '#3B82F6' },
  { id: '4', name: 'Electronic', color: '#F59E0B' },
  { id: '5', name: 'R&B', color: '#EF4444' },
  { id: '6', name: 'Lo-fi', color: '#f65ce2' },
  { id: '7', name: 'Hip-Hop', color: '#06B6D4' },
  { id: '8', name: 'Classical', color: '#84CC16' },
];

// Artistas fixos usados como fallback
// enquanto a API não retorna artistas populares
const fallbackArtists = [
  {
    id: '1',
    name: 'The Weeknd',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    followers: '90M',
  },
  {
    id: '2',
    name: 'Dua Lipa',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2',
    followers: '60M',
  },
  {
    id: '3',
    name: 'Eminem',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    followers: '95M',
  },
  {
    id: '4',
    name: 'Ariana Grande',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    followers: '85M',
  },
  {
    id: '5',
    name: 'Billie Eilish',
    image: 'https://images.unsplash.com/photo-1502323777036-f29e3972d82f',
    followers: '75M',
  },
  {
    id: '6',
    name: 'Bruno Mars',
    image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598',
    followers: '80M',
  },
];

const initialRecentSearches = [
  'Pop hits 2023',
  'Jazz classics',
  'Workout playlist',
];

const placeholderImage = 'https://via.placeholder.com/100/1F2937/FFFFFF?text=Sem+imagem';

export default function SearchScreen() {
  const { theme, user } = useTheme();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(initialRecentSearches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Usa artistas reais da API quando disponíveis,
  // caso contrário exibe os artistas de fallback.
  const artistsToShow = popularArtists.length > 0 ? popularArtists : fallbackArtists;

  useEffect(() => {
    loadPopularArtists();
  }, []);

  // Extrai uma URL de imagem válida a partir dos dados retornados pela API
  const extractImageUrl = (imageField) => {
    if (!imageField) {
      return placeholderImage;
    }

    if (typeof imageField === 'string') {
      return imageField;
    }

    if (typeof imageField === 'object') {
      if (typeof imageField.url === 'string') {
        return imageField.url;
      }

      const preferredSizes = ['1000x1000', '600x600', '480x480', '300x300', '150x150', '2000x', '640x'];
      for (const size of preferredSizes) {
        if (typeof imageField[size] === 'string') {
          return imageField[size];
        }
      }

      const firstStringValue = Object.values(imageField).find((value) => typeof value === 'string');
      return firstStringValue || placeholderImage;
    }

    return placeholderImage;
  };

  const getTrackImage = (track) => {
    return extractImageUrl(track?.artwork) || placeholderImage;
  };

  // Seleciona a melhor imagem disponível para o artista
  const getArtistImage = (artistUser) => {
    return extractImageUrl(artistUser?.profile_picture) || extractImageUrl(artistUser?.cover_photo) || placeholderImage;
  };

  const formatFollowers = (count) => {
    const value = Number(count) || 0;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }
    return String(value);
  };

  // Adiciona buscas recentes à lista sem duplicatas
  // Mantém apenas as 5 buscas mais recentes
  const addRecentSearch = (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      return;
    }

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 5);
    });
  };

  // Constrói lista de artistas únicos a partir das faixas retornadas
  // Evita duplicatas e extrai apenas as informações necessárias de cada artista
  const buildArtistsFromTracks = (tracks) => {
    const uniqueArtists = [];
    const artistIds = new Set();

    tracks.forEach((track) => {
      const user = track?.user;
      if (!user || artistIds.has(user?.id)) {
        return;
      }

      artistIds.add(user.id);
      uniqueArtists.push({
        id: String(user.id),
        name: user.name || user.handle || 'Artista desconhecido',
        handle: user.handle,
        image: getArtistImage(user),
        followers: formatFollowers(user.follower_count),
      });
    });

    return uniqueArtists.slice(0, 8);
  };

  // Salva as últimas faixas buscadas localmente para uso na home
  // Cada usuário tem sua própria chave no AsyncStorage.
  const saveLastSearchTracks = async (tracks) => {
    try {
      const storageKey = `@lastSearchTracks:${user?.email || 'guest'}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(tracks.slice(0, 6)));
    } catch (storageError) {
      // Ignora falha de armazenamento, mas mantém a busca funcionando
    }
  };

  // Busca faixas na API do Audius com o termo informado
  const fetchTracks = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar resultados. Tente novamente.');
      }

      const json = await response.json();
      const tracks = Array.isArray(json.data) ? json.data : [];
      setSearchResults(tracks.slice(0, 20));
      // também atualiza resultados de artistas para a mesma query
      fetchArtists(searchTerm).catch(() => {});
      if (tracks.length > 0) {
        await saveLastSearchTracks(tracks);
      }
      setError(tracks.length === 0 ? 'Nenhum resultado encontrado para esta busca.' : null);
    } catch (fetchError) {
      setError(fetchError.message || 'Erro ao conectar com a API.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Busca artistas (usuários) na API do Audius pelo termo informado
  const fetchArtists = async (searchTerm) => {
    if (!searchTerm) {
      setArtistResults([]);
      return;
    }

    try {
      const res = await fetch(`https://discoveryprovider.audius.co/v1/users/search?query=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) {
        throw new Error('Erro ao buscar artistas.');
      }
      const json = await res.json();
      const users = Array.isArray(json.data) ? json.data : [];
      const mapped = users.map((u) => ({
        id: String(u.id || u.user_id || Math.random()),
        name: u.name || u.handle || 'Artista desconhecido',
        handle: u.handle,
        image: getArtistImage(u),
        followers: formatFollowers(u.follower_count),
      }));
      setArtistResults(mapped.slice(0, 10));
    } catch (err) {
      setArtistResults([]);
    }
  };

  // Carrega artistas populares com base em uma busca padrão por top tracks
  const loadPopularArtists = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://discoveryprovider.audius.co/v1/tracks/search?query=top'
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar artistas populares.');
      }

      const json = await response.json();
      const tracks = Array.isArray(json.data) ? json.data : [];
      setPopularArtists(buildArtistsFromTracks(tracks));
    } catch (fetchError) {
      setError(fetchError.message || 'Erro ao carregar artistas populares.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim().length > 0) {
      const trimmed = text.trim();
      fetchTracks(trimmed);
      fetchArtists(trimmed);
    } else {
      setSearchResults([]);
      setError(null);
    }
  };

  const handleSubmitEditing = () => {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      addRecentSearch(trimmed);
      fetchTracks(trimmed);
      fetchArtists(trimmed);
    }
  };

  const handleCategoryPress = (genreName) => {
    // Dispara busca pelo gênero sem alterar o texto do input visível.
    addRecentSearch(genreName);
    fetchTracks(genreName);
  };

  const handleArtistPress = (artist) => {
    // Use o nome do artista como termo de busca sempre que possível.
    const artistQuery = artist.handle || artist.name || artist.id;
    // Não atualiza o campo de pesquisa, apenas busca e salva em recentes.
    addRecentSearch(artist.name || artistQuery);
    fetchTracks(artistQuery);
  };

  const removeRecentSearch = (searchToRemove) => {
    setRecentSearches((prev) => prev.filter((item) => item.toLowerCase() !== searchToRemove.toLowerCase()));
  };

  const handleOpenTrack = async (url) => {
    if (!url) {
      Alert.alert('Link indisponível', 'Não foi possível abrir esta música.');
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o link da música.');
    }
  };

  // Renderiza um cartão de resultado de música
  const renderTrackItem = ({ item }) => {
    const trackTitle = item?.title || item?.name || 'Título indisponível';
    const artistName = item?.user?.name || item?.user?.handle || 'Artista desconhecido';
    const trackUrl = item?.permalink || item?.permalink_url || (item?.user?.handle ? `https://audius.co/${item.user.handle}` : 'https://audius.co');

    return (
      <View style={styles.resultCard}>
        <Image source={{ uri: getTrackImage(item) }} style={styles.resultImage} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle}>{trackTitle}</Text>
          <Text style={styles.resultSubtitle}>{artistName}</Text>
          <TouchableOpacity
            style={[styles.listenButton, { backgroundColor: theme.primary }]}
            onPress={() => handleOpenTrack(trackUrl)}
          >
            <Text style={styles.listenButtonText}>Ouvir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchBox: {
      paddingTop: 42,
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    input: {
      backgroundColor: theme.inputBackground,
      color: theme.white,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    sectionTitle: {
      color: theme.white,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      marginTop: 20,
    },
    genresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    genreCard: {
      width: '48%',
      height: 80,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    genreName: {
      color: theme.white,
      fontSize: 16,
      fontWeight: '600',
    },
    artistsList: {
      marginBottom: 20,
    },
    artistCard: {
      width: 120,
      marginRight: 16,
      alignItems: 'center',
    },
    artistImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 8,
    },
    artistName: {
      color: theme.white,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    artistFollowers: {
      color: theme.gray300,
      fontSize: 12,
      textAlign: 'center',
    },
    recentSection: {
      marginBottom: 20,
    },
    recentItem: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    recentText: {
      color: theme.white,
      fontSize: 16,
    },
    clearButton: {
      color: theme.gray300,
      fontSize: 18,
    },
    resultCard: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      alignItems: 'center',
    },
    resultImage: {
      width: 70,
      height: 70,
      borderRadius: 12,
      marginRight: 12,
    },
    resultInfo: {
      flex: 1,
    },
    resultTitle: {
      color: theme.white,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    resultSubtitle: {
      color: theme.gray300,
      fontSize: 14,
      marginBottom: 10,
    },
    listenButton: {
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignSelf: 'flex-start',
    },
    listenButtonText: {
      color: theme.white,
      fontSize: 14,
      fontWeight: '700',
    },
    loading: {
      marginBottom: 16,
    },
    errorText: {
      color: '#F87171',
      fontSize: 14,
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.searchBox}>
        <TextInput
          value={query}
          onChangeText={handleSearch}
          onSubmitEditing={handleSubmitEditing}
          placeholder="O que você quer ouvir?"
          placeholderTextColor={theme.gray400}
          style={styles.input}
          returnKeyType="search"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Explorar tudo</Text>
            <View style={styles.genresGrid}>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={[styles.genreCard, { backgroundColor: genre.color }]}
                  onPress={() => handleCategoryPress(genre.name)}
                >
                  <Text style={styles.genreName}>{genre.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {loading && <ActivityIndicator size="large" color={theme.primary} style={styles.loading} />}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {artistResults.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Artistas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.artistsList}>
                  {artistResults.map((artist) => (
                    <TouchableOpacity key={artist.id} style={styles.artistCard} onPress={() => handleArtistPress(artist)}>
                      <Image source={{ uri: artist.image }} style={styles.artistImage} />
                      <Text style={styles.artistName}>{artist.name}</Text>
                      <Text style={styles.artistFollowers}>{artist.followers} seguidores</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {searchResults.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Resultados</Text>
                <FlatList
                  data={searchResults}
                  keyExtractor={(item, index) => String(item?.id ?? index)}
                  renderItem={renderTrackItem}
                  scrollEnabled={false}
                  nestedScrollEnabled
                />
              </View>
            )}

            <Text style={styles.sectionTitle}>Artistas populares</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.artistsList}>
              {artistsToShow.map((artist) => (
                <TouchableOpacity key={artist.id} style={styles.artistCard} onPress={() => handleArtistPress(artist)}>
                  <Image source={{ uri: artist.image }} style={styles.artistImage} />
                  <Text style={styles.artistName}>{artist.name}</Text>
                  <Text style={styles.artistFollowers}>{artist.followers} seguidores</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Buscas recentes</Text>
              {recentSearches.map((search, index) => (
                <View key={index} style={styles.recentItem}>
                  <TouchableOpacity onPress={() => handleSearch(search)} style={{ flex: 1 }}>
                    <Text style={styles.recentText}>{search}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                    <Text style={styles.clearButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
      </ScrollView>
    </View>
  );
}