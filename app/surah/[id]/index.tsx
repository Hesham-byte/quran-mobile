import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation, Stack, Link } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
}

const API = 'https://api.alquran.cloud/v1';
const AUDIO_EDITION = 'ar.alafasy';

export default function SurahScreen() {
  const { id } = useLocalSearchParams();
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioVerse, setCurrentAudioVerse] = useState<number | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const soundRef = useRef<Audio.Sound | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const playFromVerse = async (startVerse: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const audioUrl = `https://cdn.islamic.network/quran/audio/128/${AUDIO_EDITION}/${startVerse}.mp3`;
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: true });
      soundRef.current = sound;
      setCurrentAudioVerse(startVerse);
      setIsPlaying(true);
      setShowPlayer(true);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          const nextVerse = startVerse + 1;
          const totalAyahs = surah?.ayahs.length ?? 0;
          if (nextVerse <= totalAyahs) {
            playFromVerse(nextVerse);
          } else {
            setIsPlaying(false);
            setShowPlayer(false);
          }
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const playAll = () => {
    if (surah && surah.ayahs.length > 0) {
      playFromVerse(surah.ayahs[0].number);
    }
  };

  const stopPlayback = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      setCurrentAudioVerse(null);
      setShowPlayer(false);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/surah/${id}/${AUDIO_EDITION}`)
      .then(res => res.json())
      .then(data => {
        setSurah(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (surah) {
      navigation.setOptions({ title: surah.englishName });
    }
  }, [surah, navigation]);

  const scrollToVerse = (verseNumber: number) => {
    setCurrentVerse(verseNumber);
    const index = surah?.ayahs.findIndex(a => a.numberInSurah === verseNumber) ?? 0;
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const renderVerse = ({ item }: { item: Ayah }) => {
    const isActive = currentVerse === item.numberInSurah;
    const isCurrentAudio = currentAudioVerse === item.number;
    return (
      <TouchableOpacity
        style={[
          styles.verseContainer,
          { backgroundColor: colors.backgroundSecondary },
          isActive && { backgroundColor: isDark ? '#1a3a4a' : '#e0f7fa', borderLeftColor: colors.tint, borderLeftWidth: 3 }
        ]}
        onPress={() => scrollToVerse(item.numberInSurah)}
        onLongPress={() => playFromVerse(item.number)}
        activeOpacity={0.7}
      >
        <View style={[styles.verseNumber, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}>
          <ThemedText style={[styles.verseNumberText, isCurrentAudio && { color: colors.tint }]}>
            {isCurrentAudio && isPlaying ? '🔊' : item.numberInSurah}
          </ThemedText>
        </View>
        <ThemedText style={[styles.verseText, { color: colors.text }]}>{item.text}</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (!surah) return null;
    return (
      <View style={[styles.chapterHeader, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.bismillahContainer, { backgroundColor: isDark ? '#0d2833' : '#e0f7fa' }]}>
          <ThemedText style={[styles.bismillah, { color: colors.tint }]}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</ThemedText>
        </View>
        <ThemedText style={[styles.chapterTitleArabic, { color: colors.text }]}>{surah.name}</ThemedText>
        <ThemedText style={[styles.chapterTitleEnglish, { color: colors.text }]}>{surah.englishName}</ThemedText>
        <ThemedText style={[styles.chapterTranslation, { color: colors.icon }]}>{surah.englishNameTranslation}</ThemedText>
        <View style={styles.metaContainer}>
          <View style={[styles.badge, { backgroundColor: isDark ? '#0d2833' : '#e0f7fa' }]}>
            <ThemedText style={[styles.badgeText, { color: colors.tint }]}>{surah.ayahs.length} verses</ThemedText>
          </View>
          <View style={[styles.badge, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}>
            <ThemedText style={[styles.badgeText, { color: colors.icon }]}>{surah.revelationType}</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.hint, { color: colors.icon }]}>Long press any verse to play audio</ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={[styles.loadingText, { color: colors.icon }]}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.headerBar, { backgroundColor: colors.backgroundSecondary, borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </Link>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{surah?.englishName}</ThemedText>
        <TouchableOpacity style={[styles.playButton, { backgroundColor: colors.tint }]} onPress={isPlaying ? stopPlayback : playAll}>
          <Ionicons name={isPlaying ? "stop" : "play"} size={22} color={colors.background} />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={surah?.ayahs || []}
        keyExtractor={item => item.number.toString()}
        renderItem={renderVerse}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => flatListRef.current?.scrollToIndex({ index: info.index, animated: true }), 100);
        }}
      />
      {showPlayer && (
        <View style={[styles.playerBar, { backgroundColor: colors.tint }]}>
          <View style={styles.playerInfo}>
            <Ionicons name="musical-notes" size={20} color={colors.background} />
            <ThemedText style={[styles.playerText, { color: colors.background }]}>Verse {currentAudioVerse}</ThemedText>
          </View>
          <TouchableOpacity onPress={stopPlayback} style={styles.stopButton}>
            <Ionicons name="stop" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600' },
  playButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 120 },
  playerBar: { position: 'absolute', bottom: Platform.OS === 'ios' ? 90 : 20, left: 16, right: 16, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerInfo: { flexDirection: 'row', alignItems: 'center' },
  playerText: { fontSize: 15, marginLeft: 8, fontWeight: '500' },
  stopButton: { padding: 4 },
  chapterHeader: { padding: 24, alignItems: 'center', marginBottom: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 16 },
  bismillahContainer: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginBottom: 20 },
  bismillah: { fontSize: 22, textAlign: 'center' },
  chapterTitleArabic: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  chapterTitleEnglish: { fontSize: 22, fontWeight: '600' },
  chapterTranslation: { fontSize: 15, marginTop: 4 },
  metaContainer: { flexDirection: 'row', marginTop: 16, gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeSecondary: { marginLeft: 8 },
  badgeText: { fontSize: 13, fontWeight: '500' },
  hint: { marginTop: 16, fontSize: 13, fontStyle: 'italic' },
  verseContainer: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderLeftWidth: 3 },
  verseNumber: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  verseNumberText: { fontSize: 13, fontWeight: '500', color: '#888' },
  verseText: { flex: 1, fontSize: 18, lineHeight: 30, textAlign: 'justify' },
});