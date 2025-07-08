/* ------------------------------------------------------------------
   Components/SmoothieCard.js – полноэкранная карточка смузи
   ▸ сердечко синхронизировано с глобальным FavoritesContext
------------------------------------------------------------------ */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFavorites }            from '../Components/FavoritesContext';

/* — assets — */
const BG      = require('../assets/background.png');
const BACK    = require('../assets/back.png');
const HEART   = require('../assets/heart_outline.png');
const HEART_F = require('../assets/heart_filled.png');

/* — helpers — */
const { width } = Dimensions.get('window');

export default function SmoothieCard() {
  const nav        = useNavigation();
  const { params } = useRoute();           // передаём весь item из SmoothieIdeas/Favs
  const { id, name, img, desc, recipe } = params;

  const { favs, toggle } = useFavorites();
  const fav = !!favs[id];                  // актуальное состояние избранного

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* ─ Header ─ */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <Image source={BACK} style={styles.backImg} />
          </TouchableOpacity>

          <Text style={styles.title}>{name.toUpperCase()}</Text>

          <TouchableOpacity
            onPress={() => toggle(id)}
            style={styles.heartBtn}
          >
            <Image
              source={fav ? HEART_F : HEART}
              style={styles.heart}
            />
          </TouchableOpacity>
        </View>

        {/* ─ Smoothie image ─ */}
        <Image source={img} style={styles.image} />

        {/* ─ Description ─ */}
        <Text style={styles.desc}>{desc}</Text>

        {/* ─ Recipe ─ */}
        <Text style={styles.recipeLabel}>Recipe:</Text>
        <Text style={styles.recipe}>{recipe}</Text>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─ styles ─ */
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 , marginTop:60,},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backBtn: { padding: 6 },
  backImg: {
    width: 40,
    height: 40,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  title: {
    flex: 1,
    fontFamily: 'Amagro-Bold',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  heartBtn: { padding: 6 },
  heart: {
    width: 38,
    height: 38,
    tintColor: '#fff',
    resizeMode: 'contain',
    left:-10,
    top:-2,
  },

  image: {
    width: width * 0.8,
    height: width * 0.8,
    alignSelf: 'center',
    borderRadius: 12,
    marginVertical: 16,
    resizeMode: 'cover',
  },

  desc: {
    color: '#fff',
    fontFamily: 'Actay-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 14,
  },
  recipeLabel: {
    marginLeft:10,
    color: '#fff',
    fontFamily: 'Amagro-Bold',
    fontSize: 18,
    marginBottom: 6,
  },
  recipe: {
    marginLeft:10,
    color: '#fff',
    fontFamily: 'Actay-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
});
