import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const FALLBACK_SURAHS: Surah[] = [
  { number: 1, name: 'سُورَةُ ٱلْفَاتِحَةِ', englishName: 'Al-Faatiha', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan' },
  { number: 2, name: 'سُورَةُ ٱلْبَقَرَةِ', englishName: 'Al-Baqara', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan' },
  { number: 3, name: 'سُورَةُ آلِ عِمْرَانَ', englishName: 'Aal-i-Imraan', englishNameTranslation: 'The Family of Imraan', numberOfAyahs: 200, revelationType: 'Medinan' },
  { number: 4, name: 'سُورَةُ ٱلنِّسَاءِ', englishName: 'An-Nisaa', englishNameTranslation: 'The Women', numberOfAyahs: 176, revelationType: 'Medinan' },
  { number: 5, name: 'سُورَةُ ٱلْمَائِدَةِ', englishName: 'Al-Maaida', englishNameTranslation: 'The Table', numberOfAyahs: 120, revelationType: 'Medinan' },
  { number: 6, name: 'سُورَةُ ٱلْأَنْعَامِ', englishName: "Al-An'aam", englishNameTranslation: 'The Cattle', numberOfAyahs: 165, revelationType: 'Meccan' },
  { number: 7, name: 'سُورَةُ ٱلْأَعْرَافِ', englishName: "Al-A'raaf", englishNameTranslation: 'The Heights', numberOfAyahs: 206, revelationType: 'Meccan' },
  { number: 8, name: 'سُورَةُ ٱلْأَنْفَالِ', englishName: 'Al-Anfaal', englishNameTranslation: 'The Spoils of War', numberOfAyahs: 75, revelationType: 'Medinan' },
  { number: 9, name: 'سُورَةُ ٱلتَّوْبَةِ', englishName: 'At-Tawba', englishNameTranslation: 'Repentance', numberOfAyahs: 129, revelationType: 'Medinan' },
  { number: 10, name: 'سُورَةُ يُونُسَ', englishName: 'Yunus', englishNameTranslation: 'Jonah', numberOfAyahs: 109, revelationType: 'Meccan' },
];

const API = 'https://api.alquran.cloud/v1';

export default function HomeScreen() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  useEffect(() => {
    fetch(`${API}/surah`)
      .then(res => res.json())
      .then(data => {
        if (data.data && Array.isArray(data.data)) {
          setSurahs(data.data);
          setFilteredSurahs(data.data);
        } else {
          setSurahs(FALLBACK_SURAHS);
          setFilteredSurahs(FALLBACK_SURAHS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setSurahs(FALLBACK_SURAHS);
        setFilteredSurahs(FALLBACK_SURAHS);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSurahs(surahs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = surahs.filter(surah =>
        surah.englishName.toLowerCase().includes(query) ||
        surah.englishNameTranslation.toLowerCase().includes(query) ||
        surah.number.toString().includes(query)
      );
      setFilteredSurahs(filtered);
    }
  }, [searchQuery, surahs]);

  const renderSurah = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={[styles.surahCard, { backgroundColor: colors.backgroundSecondary }]}
      onPress={() => router.push(`/surah/${item.number}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.surahNumber, { backgroundColor: isDark ? '#1a3a4a' : '#e0f7fa' }]}>
        <ThemedText style={[styles.surahNumberText, { color: colors.tint }]}>{item.number}</ThemedText>
      </View>
      <View style={styles.surahInfo}>
        <ThemedText style={[styles.surahName, { color: colors.text }]}>{item.englishName}</ThemedText>
        <ThemedText style={[styles.surahTranslation, { color: colors.icon }]}>{item.englishNameTranslation}</ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.ayahCount, { color: colors.icon }]}>{item.numberOfAyahs} verses</ThemedText>
          <View style={[styles.dot, { backgroundColor: colors.icon }]} />
          <ThemedText style={[styles.revelationType, { color: colors.icon }]}>{item.revelationType}</ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} style={{ color: colors.icon }} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={[styles.loadingText, { color: colors.icon }]}>Loading Quran...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Al Quran</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>{surahs.length} Surahs</ThemedText>
        </View>
        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="search" size={18} style={{ color: colors.icon }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search surahs..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} style={{ color: colors.icon }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={filteredSurahs}
        keyExtractor={item => item.number.toString()}
        renderItem={renderSurah}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: colors.icon }]}>No surahs found</ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { marginBottom: 16 },
  headerTitle: { fontSize: 34, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 16, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, padding: 0 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  surahCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, marginBottom: 8, borderRadius: 16 },
  surahNumber: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  surahNumberText: { fontSize: 14, fontWeight: '600' },
  surahInfo: { flex: 1, marginLeft: 12 },
  surahName: { fontSize: 17, fontWeight: '600' },
  surahTranslation: { fontSize: 14, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ayahCount: { fontSize: 12 },
  dot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 8 },
  revelationType: { fontSize: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16 },
});