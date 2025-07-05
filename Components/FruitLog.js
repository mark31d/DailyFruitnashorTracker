/* ------------------------------------------------------------------
   Components/FruitLog.js     ⟦работает с DataProvider⟧
------------------------------------------------------------------ */
import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  FlatList, Dimensions, SafeAreaView, ImageBackground,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTracker } from './DataProvider';              // ← NEW

const { width } = Dimensions.get('window');
const CARD_H = width * 0.45;

/* ресурсы */
const BG   = require('../assets/background.png');
const BACK = require('../assets/back.png');
const BOWL = [
  require('../assets/bowl_0.png'),
  require('../assets/bowl_1.png'),
  require('../assets/bowl_2.png'),
  require('../assets/bowl_3.png'),
];

/* справочник фруктов */
const FRUITS = [
  { id: 'persimmon',   name: 'Persimmon',   img: require('../assets/fruits/persimmon.png') },
  { id: 'pomegranate', name: 'Pomegranate', img: require('../assets/fruits/pomegranate.png') },
  { id: 'melon',       name: 'Melon',       img: require('../assets/fruits/melon.png') },
  { id: 'grapefruit',  name: 'Grapefruit',  img: require('../assets/fruits/grapefruit.png') },
  { id: 'orange',      name: 'Orange',      img: require('../assets/fruits/orange.png') },
  { id: 'banana',      name: 'Banana',      img: require('../assets/fruits/banana.png') },
  { id: 'apple',       name: 'Apple',       img: require('../assets/fruits/apple.png') },
];

const GOAL = 7;          // полный «салат» = 7 шт

export default function FruitLog() {
  const { params }               = useRoute();          // { date: 'YYYY-MM-DD' }
  const dateKey                   = params?.date;
  const nav                       = useNavigation();

  const { days, addFruit, setCurrentDate } = useTracker();

  /* — при монтировании сохраняем текущую дату в контексте — */
  useEffect(() => { setCurrentDate(dateKey); }, [dateKey, setCurrentDate]);

  /* текущее количество берём из хранилища; дополняем нулями */
  const [counts, setCounts] = useState(() => ({
    ...FRUITS.reduce((acc, f) => ({ ...acc, [f.id]: 0 }), {}),
    ...((days[dateKey]?.fruit) || {}),
  }));

  /* сколько всего съели */
  const total = useMemo(
    () => Object.values(counts).reduce((s, n) => s + n, 0),
    [counts]
  );
  const bowlLevel = Math.min(3, Math.floor((total / GOAL) * 3 + 1e-4));

  /* + / – фрукт */
  const change = (id, diff) =>
    setCounts(prev => {
      const next = Math.max(0, (prev[id] ?? 0) + diff);
      addFruit(dateKey, id, diff);          // ← запись в контекст
      return { ...prev, [id]: next };
    });

  /* карточка фрукта */
  const renderItem = ({ item }) => {
    const n = counts[item.id] ?? 0;
    return (
      <View style={styles.card}>
        <Image source={item.img} style={styles.cardImg} />
        <Text style={styles.cardLabel}>{item.name}</Text>

        <View style={styles.counterBox}>
          <TouchableOpacity onPress={() => change(item.id, -1)}>
            <Text style={styles.counterSign}>−</Text>
          </TouchableOpacity>

          <Text style={styles.counterNum}>{n}</Text>

          <TouchableOpacity onPress={() => change(item.id, +1)}>
            <Text style={styles.counterSign}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* ← back */}
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Image source={BACK} style={styles.backImg} />
        </TouchableOpacity>

        <Text style={styles.title}>FRUIT</Text>
        <Image source={BOWL[bowlLevel]} style={styles.bowl} />

        <FlatList
          data={FRUITS}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─── стили ──────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },

  backBtn: { marginTop: 10, padding: 10, zIndex: 1 },
  backImg: { width: 40, height: 40, tintColor: '#fff', resizeMode: 'contain' },

  title: {
    fontFamily: 'Amagro-Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 6,
    marginTop: -50,
  },

  bowl: {
    width: width * 0.65,
    height: width * 0.45,
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'contain',
  },

  /* карточка фрукта */
  card: {
    height: CARD_H,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    marginHorizontal: 10,
  },
  cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardLabel: {
    position: 'absolute',
    top: 12, left: 12,
    color: '#fff',
    fontFamily: 'Actay-Regular',
    fontSize: 16,
    textShadowColor: '#000',
    textShadowRadius: 4,
  },

  /* счётчик +/– */
  counterBox: {
    position: 'absolute',
    bottom: 12, right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  counterSign: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Amagro-Bold',
    width: 24,
    textAlign: 'center',
  },
  counterNum: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Amagro-Bold',
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
});