// Components/SmoothieFavs.js

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../Components/FavoritesContext';  // ← pull in your context

// assets
const BG      = require('../assets/background.png');
const BACK    = require('../assets/back.png');
const HEART_F = require('../assets/heart_filled.png');

const { width } = Dimensions.get('window');
const CARD_W    = (width - 54) / 2; // 18 + 18 padding + 12 gap

// your same SMOOTHIES array (or import it from a shared file)
const SMOOTHIES = [
    {
      id: 'banana',
      name: 'Banana Booster',
      img: require('../assets/smoothies/banana.png'),
      desc: 'Classic breakfast in a glass! Banana, oatmeal and honey are a source of energy and satiety.',
      recipe: 'Banana + oatmeal + milk + honey',
      category: 'For breakfast',
      type: 'Fruit',
    },
    {
      id: 'watermelon',
      name: 'Watermelon Freshness',
      img: require('../assets/smoothies/watermelon.png'),
      desc: 'Perfect in the heat! Watermelon, mint and lime – quenches thirst and refreshes.',
      recipe: 'Watermelon + mint + lime',
      category: 'Refreshing',
      type: 'Fruit',
    },
    {
      id: 'mango',
      name: 'Mango Protein',
      img: require('../assets/smoothies/mango.png'),
      desc: 'For active people! Mango, oatmeal and protein – energizes and restores muscles.',
      recipe: 'Mango + oatmeal + coconut milk + protein',
      category: 'Satisfying',
      type: 'Fruit',
    },
    {
      id: 'berry',
      name: 'Berry Morning',
      img: require('../assets/smoothies/berry.png'),
      desc: 'Bright and delicious! Berries, yogurt and chia seeds are a boost of antioxidants and good mood.',
      recipe: 'Berries + yogurt + chia seeds',
      category: 'For breakfast',
      type: 'Fruit',
    },
    {
      id: 'melon',
      name: 'Melon Zen',
      img: require('../assets/smoothies/melon.png'),
      desc: 'Exotic taste! Melon, cucumber and coconut water – refreshes and saturates.',
      recipe: 'Melon + cucumber + ginger + coconut water',
      category: 'Refreshing',
      type: 'Fruit',
    },
    {
      id: 'carrot',
      name: 'Carrot Boom',
      img: require('../assets/smoothies/carrot.png'),
      desc: 'Improves complexion! Carrot, orange and ginger – charge with vitamins and cleanse the body.',
      recipe: 'Carrot + orange + ginger + turmeric',
      category: 'Satisfying',
      type: 'Vegetable',
    },
    {
      id: 'cleansing',
      name: 'Green Cleansing',
      img: require('../assets/smoothies/cleansing.png'),
      desc: 'Feel the lightness! Celery, apple and cucumber – removes toxins and improves digestion.',
      recipe: 'Celery + apple + cucumber + lemon + ginger',
      category: 'Detox',
      type: 'Vegetable',
    },
    {
      id: 'green',
      name: 'Green Superfood',
      img: require('../assets/smoothies/green.png'),
      desc: 'A full meal! Avocado, banana and spinach – nourishes and nourishes.',
      recipe: 'Avocado + banana + spinach + almond milk',
      category: 'Detox',
      type: 'Green',
    },
  ];
export default function SmoothieFavs() {
  const nav = useNavigation();
  const { favs } = useFavorites();   // ← get favs directly from context

  // build a list of only the favorited smoothies
  const data = useMemo(
    () => SMOOTHIES.filter(s => favs[s.id]),
    [favs]
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => nav.navigate('SmoothieCard', item)}
    >
      <Image source={item.img} style={styles.cardImg} />
      <Text style={styles.cardLabel}>{item.name}</Text>
      <TouchableOpacity
        style={styles.heartOverlay}
        onPress={() => toggle(item.id)}   // убираем из избранного
      >
        <Image source={HEART_F} style={styles.heart} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <Image source={BACK} style={styles.backImg} />
          </TouchableOpacity>
          <Text style={styles.title}>FAVORITE SMOOTHIES</Text>
        </View>

        {data.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No favorites yet</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={i => i.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  backBtn: { padding: 6 },
  backImg: { width: 40, height: 40, tintColor: '#fff', resizeMode: 'contain', },
  title: {
    flex: 1,
    fontFamily: 'Amagro-Bold',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    left:-10,
  },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontFamily: 'Actay-Regular', fontSize: 18 },

  row: { justifyContent: 'space-between',padding:15,},
  card: {
    width: CARD_W,
    height: CARD_W,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImg: { width: '100%', height: '100%' },
  cardLabel: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    color: '#fff',
    fontFamily: 'Actay-Regular',
    fontSize: 14,
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  heartOverlay: { position: 'absolute', top: 6, right: 6 },
  heart: { width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain' },
});
