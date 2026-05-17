// Tela de biblioteca do usuário com músicas, playlists e álbuns favoritos
import { useState, useEffect } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Dados estáticos usados como fallback para a tela de favoritos.
// Eles mantêm a interface visível caso a API demore ou falhe.
const initialLikedSongs = [
  {
    id: '1',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: '3:53',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
  },
  {
    id: '2',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: '3:23',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
  },
  {
    id: '3',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    duration: '2:47',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
  },
  {
    id: '4',
    title: 'Heat Waves',
    artist: 'Glass Animals',
    album: 'Dreamland',
    duration: '3:58',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
  },
  {
    id: '5',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
  },
  {
    id: '6',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3: OVER YOU',
    duration: '2:21',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
  },
  {
    id: '7',
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP',
    duration: '3:14',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  },
  {
    id: '8',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    album: 'Midnights',
    duration: '3:20',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  },
  {
    id: '9',
    title: 'Don’t Start Now',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: '3:03',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b',
  },
  {
    id: '10',
    title: 'Happy',
    artist: 'Pharrell Williams',
    album: 'G I R L',
    duration: '3:53',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
  },
];

// Playlists iniciais mostradas na aba de playlists.
// A propriedade query é usada para buscar faixas relacionadas via API.
const initialPlaylists = [
  {
    id: '1',
    title: 'My Playlist #1',
    songs: 25,
    query: 'top hits',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
    tracks: [],
  },
  {
    id: '2',
    title: 'Chill Vibes',
    songs: 42,
    query: 'chill vibes',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
    tracks: [],
  },
  {
    id: '3',
    title: 'Focus Mode',
    songs: 18,
    query: 'focus',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    tracks: [],
  },
  {
    id: '4',
    title: 'Workout Mix',
    songs: 30,
    query: 'workout',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    tracks: [],
  },
  {
    id: '5',
    title: 'Noite Relax',
    songs: 22,
    query: 'relax',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b',
    tracks: [],
  },
];

// Álbuns iniciais mostrados na aba de álbuns.
// Também usamos query para buscar faixas que representam o álbum.
const initialAlbums = [
  {
    id: '1',
    title: 'After Hours',
    artist: 'The Weeknd',
    year: '2020',
    query: 'The Weeknd after hours',
    image: 'https://via.placeholder.com/120/1C1C3A/FFFFFF?text=After+Hours',
    tracks: [],
  },
  {
    id: '2',
    title: 'Future Nostalgia',
    artist: 'Dua Lipa',
    year: '2020',
    query: 'Dua Lipa future nostalgia',
    image: 'https://via.placeholder.com/120/4D4DFF/FFFFFF?text=Future+Nostalgia',
    tracks: [],
  },
  {
    id: '3',
    title: 'Indie Soft',
    artist: 'Indie Favorites',
    year: '2024',
    query: 'indie',
    image: 'https://via.placeholder.com/120/5E5E5E/FFFFFF?text=Indie',
    tracks: [],
  },
];

export default function FavoritesScreen() {
  const [activeTab, setActiveTab] = useState('Músicas');
  const [favoriteTracks, setFavoriteTracks] = useState(initialLikedSongs);
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [albums, setAlbums] = useState(initialAlbums);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  // Remove uma faixa da lista de favoritos localmente
  // A remoção é permanente enquanto o app estiver em sessão
  const removeFavorite = (id) => {
    setFavoriteTracks((currentTracks) => currentTracks.filter((track) => track.id !== id));
  };

  // Mostra confirmação antes de remover uma faixa dos favoritos
  // Evita exclusão acidental de músicas da lista de favoritos
  const confirmRemoveFavorite = (id) => {
    Alert.alert(
      'Remover favorito',
      'Tem certeza de que deseja remover esta música dos seus favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeFavorite(id) },
      ]
    );
  };

  // Converte o campo artwork retornado pela API em uma URL de imagem utilizável.
  const extractImageUrl = (artwork) => {
    if (!artwork) return 'https://via.placeholder.com/60';
    if (typeof artwork === 'string') return artwork;
    return artwork['1000x1000'] || artwork['480x480'] || artwork['150x150'] || artwork['100x100'] || 'https://via.placeholder.com/60';
  };

  // Executa buscas iniciais para preencher músicas, playlists e álbuns
  useEffect(() => {
    const formatTrack = (track) => ({
      id: String(track.id || track.track_id || Math.random()),
      title: track.title || track.name || 'Título indisponível',
      artist: track.user?.name || track.user?.handle || 'Artista desconhecido',
      album: track.album ? track.album.name : track.genre || 'Favoritos',
      duration: formatDuration(track.duration),
      image: extractImageUrl(track.artwork) || 'https://via.placeholder.com/60',
    });

    // Busca faixas da API Audius usando uma query. Essa função é usada
    // para carregar músicas iniciais, playlists e álbuns.
    const fetchTracksByQuery = async (query, limit = 12) => {
      const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar músicas para ${query}`);
      }

      const data = await response.json();
      const tracks = Array.isArray(data.data) ? data.data : [];
      return tracks.map(formatTrack);
    };

    // Tenta carregar faixas favoritas da API usando uma busca genérica por top.
    // Se falhar, mantém os dados de fallback local.
    const fetchFavoriteTracks = async () => {
      setLoading(true);
      setError(null);

      try {
        const tracks = await fetchTracksByQuery('top');
        setFavoriteTracks(tracks.length > 0 ? tracks.slice(0, 12) : initialLikedSongs);
      } catch (fetchError) {
        setError(fetchError.message || 'Erro ao carregar favoritos.');
        setFavoriteTracks(initialLikedSongs);
      } finally {
        setLoading(false);
      }
    };

    // Carrega dados dinamicamente para cada playlist inicial.
    // Atualiza a lista com faixas reais vindas da API.
    const fetchPlaylistData = async () => {
      try {
        const results = await Promise.all(
          initialPlaylists.map(async (playlist) => {
            const tracks = await fetchTracksByQuery(playlist.query, 15);
            return {
              ...playlist,
              tracks,
              songs: tracks.length,
              image: tracks[0]?.image || playlist.image,
            };
          })
        );
        setPlaylists(results);
      } catch (fetchError) {
        setError(fetchError.message || 'Erro ao carregar playlists.');
      }
    };

    // Carrega dados dinâmicos para cada álbum inicial.
    // Exibe faixas e imagem de capa com base na busca.
    const fetchAlbumData = async () => {
      try {
        const results = await Promise.all(
          initialAlbums.map(async (album) => {
            const tracks = await fetchTracksByQuery(album.query, 15);
            return {
              ...album,
              tracks,
              image: tracks[0]?.image || album.image,
            };
          })
        );
        setAlbums(results);
      } catch (fetchError) {
        setError(fetchError.message || 'Erro ao carregar álbuns.');
      }
    };

    // Inicia todas as buscas necessárias apenas uma vez, quando o componente monta.
    fetchFavoriteTracks();
    fetchPlaylistData();
    fetchAlbumData();
  }, []);

  // Formata duração de uma faixa em segundos para o formato mm:ss.
  const formatDuration = (seconds) => {
    const total = Number(seconds) || 0;
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Estilos usados na tela de favoritos.
  // Mantém a aparência alinhada ao tema atual.
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 36,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: {
      color: theme.white,
      fontSize: 24,
      fontWeight: '700',
    },
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 22,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme.primary,
    },
    tabText: {
      color: theme.gray300,
      fontSize: 14,
      fontWeight: '600',
    },
    activeTabText: {
      color: theme.white,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    songRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#26262E',
    },
    songImage: {
      width: 50,
      height: 50,
      borderRadius: 4,
      marginRight: 12,
    },
    songInfo: {
      flex: 1,
    },
    songTitle: {
      color: theme.white,
      fontSize: 16,
      fontWeight: '600',
    },
    songDetails: {
      color: theme.gray300,
      fontSize: 14,
      marginTop: 2,
    },
    songDuration: {
      color: theme.gray300,
      fontSize: 14,
      marginRight: 12,
    },
    moreButton: {
      padding: 8,
    },
    moreText: {
      color: theme.gray300,
      fontSize: 18,
    },
    playlistCard: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    playlistImage: {
      width: 60,
      height: 60,
      borderRadius: 4,
      marginRight: 12,
    },
    playlistInfo: {
      flex: 1,
    },
    playlistTitle: {
      color: theme.white,
      fontSize: 16,
      fontWeight: '600',
    },
    playlistSongs: {
      color: theme.gray300,
      fontSize: 14,
      marginTop: 2,
    },
    selectedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      padding: 16,
      backgroundColor: theme.surface,
      borderRadius: 12,
    },
    selectedCover: {
      width: 70,
      height: 70,
      borderRadius: 8,
      marginRight: 14,
    },
    selectedInfo: {
      flex: 1,
    },
    selectedTitle: {
      color: theme.white,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    selectedSubtitle: {
      color: theme.gray300,
      fontSize: 14,
    },
    albumCard: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    albumImage: {
      width: 60,
      height: 60,
      borderRadius: 4,
      marginRight: 12,
    },
    albumInfo: {
      flex: 1,
    },
    albumTitle: {
      color: theme.white,
      fontSize: 16,
      fontWeight: '600',
    },
    albumDetails: {
      color: theme.gray300,
      fontSize: 14,
      marginTop: 2,
    },
    backRow: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: theme.surface,
    },
    backText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 60,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      color: theme.white,
      fontSize: 18,
      fontWeight: '700',
      marginTop: 12,
    },
    emptyText: {
      color: theme.gray300,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 6,
    },
  });

  // Renderiza o conteúdo da aba ativa: músicas, playlists ou álbuns.
  // A função escolhe o layout correto com base em activeTab.
  const renderContent = () => {
    switch (activeTab) {
      case 'Músicas':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Mostra indicador de carregamento enquanto busca músicas favoritas. */}
            {loading && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            )}

            {/* Mensagem de erro quando algo falha e não está carregando. */}
            {error && !loading && (
              <View style={{ padding: 20 }}>
                <Text style={[styles.songDetails, { color: theme.primary }]}>{error}</Text>
              </View>
            )}

            {/* Exibe estado vazio caso não haja músicas favoritas. */}
            {favoriteTracks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 42, color: theme.white }}>♡</Text>
                <Text style={styles.emptyTitle}>Nenhuma música favorita</Text>
                <Text style={styles.emptyText}>
                  Quando você salvar músicas aqui, elas vão aparecer nesta seção.
                </Text>
              </View>
            ) : (
              favoriteTracks.map((song) => (
                <View key={song.id} style={styles.songRow}>
                  <Image source={{ uri: song.image }} style={styles.songImage} />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{song.title}</Text>
                    <Text style={styles.songDetails}>{song.artist} • {song.album}</Text>
                  </View>
                  <Text style={styles.songDuration}>{song.duration}</Text>
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => confirmRemoveFavorite(song.id)}
                  >
                    <Text style={styles.moreText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        );
      case 'Playlists':
        // Se uma playlist estiver selecionada, mostra detalhes dela.
        if (selectedPlaylistId) {
          const selectedPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId);
          return (
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={() => setSelectedPlaylistId(null)} style={styles.backRow}>
                <Text style={styles.backText}>← Voltar para playlists</Text>
              </TouchableOpacity>
              <View style={styles.selectedHeader}>
                <Image source={{ uri: selectedPlaylist?.image }} style={styles.selectedCover} />
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>{selectedPlaylist?.title}</Text>
                  <Text style={styles.selectedSubtitle}>{selectedPlaylist?.songs} músicas • {selectedPlaylist?.tracks.length} faixas exibidas</Text>
                </View>
              </View>
              {selectedPlaylist?.tracks.map((track) => (
                <TouchableOpacity key={track.id} style={styles.songRow}>
                  <Image source={{ uri: track.image }} style={styles.songImage} />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{track.title}</Text>
                    <Text style={styles.songDetails}>{track.artist}</Text>
                  </View>
                  <Text style={styles.songDuration}>{track.duration}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          );
        }
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={styles.playlistCard}
                onPress={() => setSelectedPlaylistId(playlist.id)}
              >
                <Image source={{ uri: playlist.image }} style={styles.playlistImage} />
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistTitle}>{playlist.title}</Text>
                  <Text style={styles.playlistSongs}>{playlist.songs} músicas</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      case 'Álbuns':
        if (selectedAlbumId) {
          const selectedAlbum = albums.find((album) => album.id === selectedAlbumId);
          return (
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={() => setSelectedAlbumId(null)} style={styles.backRow}>
                <Text style={styles.backText}>← Voltar para álbuns</Text>
              </TouchableOpacity>
              <View style={styles.selectedHeader}>
                <Image source={{ uri: selectedAlbum?.image }} style={styles.selectedCover} />
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>{selectedAlbum?.title}</Text>
                  <Text style={styles.selectedSubtitle}>{selectedAlbum?.artist} • {selectedAlbum?.year}</Text>
                  <Text style={styles.selectedSubtitle}>{selectedAlbum?.tracks.length} músicas</Text>
                </View>
              </View>
              {selectedAlbum?.tracks.map((track) => (
                <TouchableOpacity key={track.id} style={styles.songRow}>
                  <Image source={{ uri: track.image }} style={styles.songImage} />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{track.title}</Text>
                    <Text style={styles.songDetails}>{track.artist}</Text>
                  </View>
                  <Text style={styles.songDuration}>{track.duration}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          );
        }
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {albums.map((album) => (
              <TouchableOpacity
                key={album.id}
                style={styles.albumCard}
                onPress={() => setSelectedAlbumId(album.id)}
              >
                <Image source={{ uri: album.image }} style={styles.albumImage} />
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle}>{album.title}</Text>
                  <Text style={styles.albumDetails}>{album.artist} • {album.year}</Text>
                  <Text style={styles.albumDetails}>{album.tracks.length} músicas</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  // Retorna a estrutura principal da tela com cabeçalho, abas e conteúdo.
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Sua Biblioteca</Text>
      </View>

      <View style={styles.tabContainer}>
        {['Músicas', 'Playlists', 'Álbuns'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}