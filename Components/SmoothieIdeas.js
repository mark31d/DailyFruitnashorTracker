/* ------------------------------------------------------------------
   Components/SmoothieIdeas.js  – полный файл без сокращений
   ▸ фильтры показывают ТОЛЬКО реальные варианты
   ▸ меню “Тип / Вкус” теперь двухуровневое: Fruit → Banana / Mango …
   ▸ ширина выпадашки совпадает с шириной кнопки
------------------------------------------------------------------ */

import React, { useState, useMemo } from 'react';
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
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../Components/FavoritesContext';

/* ─── assets ────────────────────────────────────────────────────── */
const BG         = require('../assets/background.png');
const HEART      = require('../assets/heart_outline.png');
const HEART_F    = require('../assets/heart_filled.png');
const CHEVRON    = require('../assets/arrow_down.png');
const BACK_ARROW = require('../assets/arrow_left.png'); // «‹» в под-меню

/* ─── layout helpers ────────────────────────────────────────────── */
const { width } = Dimensions.get('window');
const H_PAD  = 18;
const GAP    = 8;
const CARD_W = (width - H_PAD * 2 - GAP) / 2;

/* ─── база из 8 смузи ───────────────────────────────────────────── */
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

/* ─── “верхние” типы ────────────────────────────────────────────── */
const TOP_TYPES = ['Fruit', 'Vegetable', 'Green'];

/* ─── элемент выпадашки ─────────────────────────────────────────── */
const DDItem = ({ label, onPress }) => (
  <Pressable style={styles.ddItem} onPress={onPress}>
    <Text style={styles.ddItemTxt}>{label}</Text>
  </Pressable>
);

/* ─── основной компонент ───────────────────────────────────────── */
export default function SmoothieIdeas() {
  const nav = useNavigation();
  const { favs, toggle } = useFavorites();

  /* — состояние фильтров — */
  const [cat,  setCat]  = useState('Smoothie');
  const [type, setType] = useState('Fruit');
  const [sub,  setSub]  = useState(null);

  /* — открытое меню: 'cat' | 'type' | null — */
  const [open, setOpen] = useState(null);

  /* — для двухуровневого меню типов — */
  const [showSubs,   setShowSubs]   = useState(false); // показываем flavours?
  const [parentTop,  setParentTop]  = useState('Fruit');

  /* ───── CAT-список (динамический) ────────────────────────────── */
  const CAT_OPTS = useMemo(() => {
    const cats = Array.from(new Set(SMOOTHIES.map(s => s.category)));
    return ['Smoothie', ...cats];
  }, []);

  /* ───── строим map: { Fruit:Set(flavour1, …) , Vegetable:Set(…) } */
  const TYPE_MAP = useMemo(() => {
    const byCat = cat === 'Smoothie'
      ? SMOOTHIES
      : SMOOTHIES.filter(s => s.category === cat);

    const map = {};
    byCat.forEach(s => {
      const top      = s.type;
      const flavour  = s.id.charAt(0).toUpperCase() + s.id.slice(1);
      if (!map[top]) map[top] = new Set();
      map[top].add(flavour);
    });
    return map;           // { Fruit:Set('Banana', 'Mango' …) … }
  }, [cat]);

  /* ───── фильтруем карточки под текущие выборы ───────────────── */
  const data = useMemo(() => {
    const byCat  = cat === 'Smoothie'
      ? SMOOTHIES
      : SMOOTHIES.filter(s => s.category === cat);

    const byType = byCat.filter(s => s.type === type);

    if (!sub || TOP_TYPES.includes(sub)) return byType;

    return byType.filter(s =>
      s.name.toLowerCase().includes(sub.toLowerCase())
    );
  }, [cat, type, sub]);

  /* ───── выпадающее меню как компонент ────────────────────────── */
  const DropdownMenu = ({ kind }) => {
    if (open !== kind) return null;

    /* —— меню категорий —— */
    if (kind === 'cat') {
      return (
        <View style={styles.menu}>
          {CAT_OPTS.map(o => (
            <DDItem
              key={o}
              label={o}
              onPress={() => {
                setCat(o);
                setType('Fruit');
                setSub(null);
                setShowSubs(false);
                setOpen(null);
              }}
            />
          ))}
        </View>
      );
    }

    /* —— меню типов / под-типов —— */
    const topList   = Object.keys(TYPE_MAP);             // Fruit/Vegetable/Green (динамич.)
    const subList   = Array.from(TYPE_MAP[parentTop] || []);
    const options   = showSubs ? subList : topList;

    return (
      <View style={styles.menu}>
        {showSubs && (
          <View style={styles.menuHeader}>
            <Text style={styles.headerTxt}>{parentTop}</Text>
            <TouchableOpacity onPress={() => setShowSubs(false)}>
              <Image source={BACK_ARROW} style={styles.backArrow}/>
            </TouchableOpacity>
          </View>
        )}

        {options.map(o => (
          <DDItem
            key={o}
            label={o}
            onPress={() => {
              if (!showSubs) {
                /* выбрали верхний уровень (Fruit …) */
                setParentTop(o);
                setType(o);
                setSub(null);
                /* если есть подтипы — раскрываем их */
                if (TYPE_MAP[o] && TYPE_MAP[o].size) {
                  setShowSubs(true);
                } else {
                  setOpen(null);
                }
              } else {
                /* выбрали конкретный вкус */
                setSub(o);
                setOpen(null);
              }
            }}
          />
        ))}
      </View>
    );
  };

  /* ───── карточка смузи ───────────────────────────────────────── */
  const Card = ({ item }) => {
    const fav = !!favs[item.id];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => nav.navigate('SmoothieCard', item)}
      >
        <Image source={item.img} style={styles.cardImg} />
        <Text style={styles.cardLabel}>{item.name}</Text>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => toggle(item.id)}
        >
          <Image source={fav ? HEART_F : HEART} style={styles.heart} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  /* ───── UI ───────────────────────────────────────────────────── */
  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>SMOOTHIE{'\n'}IDEAS</Text>

        {/* ——— фильтры ——— */}
        <View style={styles.filters}>

          {/* категория */}
          <View style={styles.ddWrap}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setOpen(open === 'cat' ? null : 'cat')}
            >
              <Text style={styles.ddLabel}>{cat}</Text>
              <Image
                source={CHEVRON}
                style={[
                  styles.chevron,
                  open === 'cat' && { transform: [{ rotate: '180deg' }] },
                ]}
              />
            </TouchableOpacity>
            <DropdownMenu kind="cat" />
          </View>

          {/* тип / вкус */}
          <View style={styles.ddWrap}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                if (open === 'type') {
                  setOpen(null);
                } else {
                  setOpen('type');
                  setShowSubs(false); // всегда начинаем с верхнего уровня
                }
              }}
            >
              <Text style={styles.ddLabel}>{sub || type}</Text>
              <Image
                source={CHEVRON}
                style={[
                  styles.chevron,
                  open === 'type' && { transform: [{ rotate: '180deg' }] },
                ]}
              />
            </TouchableOpacity>
            <DropdownMenu kind="type" />
          </View>

          {/* избранное */}
          <TouchableOpacity
            style={styles.headerHeart}
            onPress={() => nav.navigate('SmoothieFavs')}
          >
            <Image source={HEART_F} style={styles.headerHeartImg} />
          </TouchableOpacity>
        </View>

        {/* ——— сетка карточек ——— */}
        <FlatList
          data={data}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={Card}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─── стили ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  bg:   { flex: 1 },
  safe: { flex: 1, paddingHorizontal: H_PAD ,  },

  title: {
    fontFamily: 'Amagro-Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 12,
  },

  /* — фильтры — */
  filters: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  ddWrap:  { flex: 1, position: 'relative' },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ddLabel: { color: '#fff', fontFamily: 'Actay-Regular', fontSize: 16 },
  chevron: { width: 25, height: 25, tintColor: '#fff' , resizeMode:'contain'},

  /* — меню — */
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    alignSelf: 'flex-start',
    minWidth: '100%',
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingVertical: 6,
    zIndex: 20,
  },
  ddItem:    { paddingVertical: 10, paddingHorizontal: 18 },
  ddItemTxt: { color: '#fff', fontFamily: 'Actay-Regular', fontSize: 18 },

  /* — под-заголовок под-меню — */
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 4,
  },
  headerTxt: { color: '#fff', fontFamily: 'Actay-Regular', fontSize: 18 },
  backArrow: { width: 16, height: 16, tintColor: '#fff', resizeMode: 'contain' },

  /* — сердечко в шапке — */
  headerHeart:    { padding: 8 },
  headerHeartImg: { width: 28, height: 28, tintColor: '#fff' },

  /* — сетка карточек — */
  row:  { justifyContent: 'space-between', padding:15, },
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
    right: 6,
    color: '#fff',
    fontFamily: 'Actay-Regular',
    fontSize: 14,
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  heartBtn: { position: 'absolute', top: 6, right: 6 },
  heart:    { width: 24, height: 24, tintColor: '#fff' },
});
