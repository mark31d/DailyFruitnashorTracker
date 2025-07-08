// Components/FruitMenu.js

import React, { useState, useMemo, useRef, useEffect , useContext  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  ImageBackground,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';

const { width } = Dimensions.get('window');
const CARD_H = width * 0.55;

// фон
const BG = require('../assets/background.png');
// иконка «7»
const SEVEN = require('../assets/seven.png');
import { TriedContext } from '../Components/TriedContext';
// массив всех фруктов
const ALL_FRUITS = [
  { id: 'persimmon',   name: 'Persimmon',   img: require('../assets/fruits/persimmon.png'),   category: 'For immunity' },
  { id: 'pomegranate', name: 'Pomegranate', img: require('../assets/fruits/pomegranate.png'), category: 'For immunity' },
  { id: 'melon',       name: 'Melon',       img: require('../assets/fruits/melon.png'),       category: 'For energy' },
  { id: 'grapefruit',  name: 'Grapefruit',  img: require('../assets/fruits/grapefruit.png'),  category: 'For skin' },
  { id: 'orange',      name: 'Orange',      img: require('../assets/fruits/orange.png'),      category: 'For skin' },
  { id: 'banana',      name: 'Banana',      img: require('../assets/fruits/banana.png'),      category: 'For energy' },
  { id: 'apple',       name: 'Apple',       img: require('../assets/fruits/apple.png'),       category: 'For immunity' },
];

const FILTERS = ['For immunity', 'For skin', 'For energy'];

/**
 * Кастомный переключатель «перепробовал/не перепробовал»
 */
function CustomSwitch({ value, onValueChange, style }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:      value ? 1 : 0,
      duration:     200,
      useNativeDriver:false,
    }).start();
  }, [value, anim]);

  const translateX = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 26],
  });

  return (
    <TouchableWithoutFeedback onPress={() => onValueChange(!value)}>
      <View style={[styles.switchTrack, style]}>
        <Animated.View
          style={[
            styles.switchThumb,
            {
              transform:       [{ translateX }],
              backgroundColor: value ? '#32DC46' : '#D40A07',
            },
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function FruitMenu() {
  const nav = useNavigation();
  const { tried, setTried } = useContext(TriedContext);
  const [filter,  setFilter]  = useState(null);
  const [dayFruit] = useState(
    ALL_FRUITS[Math.floor(Math.random() * ALL_FRUITS.length)]
  );

  const data = useMemo(
    () => filter
      ? ALL_FRUITS.filter(f => f.category === filter)
      : ALL_FRUITS,
    [filter]
  );

  const renderItem = ({ item }) => {
    const isTried = !!tried[item.id];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => nav.navigate('FruitDetails', { fruitId: item.id })}
      >
        <Image source={item.img} style={styles.cardImg} />
        <Text style={styles.cardLabel}>{item.name}</Text>
        <CustomSwitch
          value={isTried}
          onValueChange={v =>
            setTried(prev => ({ ...prev, [item.id]: v }))
          }
          style={styles.cardSwitch}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          FRUIT MENU AND{'\n'}     ITS BENEFITS
        </Text>
        <TouchableOpacity
          onPress={() => nav.navigate('VitaminSeven')}
          activeOpacity={0.7}
          style={styles.sevenWrapper}
        >
          <Image source={SEVEN} style={styles.seven} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {FILTERS.map((cat, i) => (
          <View key={cat} style={styles.filterWrapper}>
            {/* Градиентная рамка */}
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <SvgLinearGradient id={`grad${i}`} x1="1" y1="0" x2="0" y2="0">
                  <Stop offset="0%"  stopColor="#FFFFFF"/>
                  <Stop offset="100%" stopColor="#6666661A"/>
                </SvgLinearGradient>
              </Defs>
              <Rect
                x="0.5"
                y="0.5"
                width="99.3%"
                height="99%"
                rx="6"
                ry="6"
                fill="none"
                stroke={`url(#grad${i})`}
                strokeWidth="2"
              />
            </Svg>
            {/* Кнопка внутри рамки */}
            <TouchableOpacity
              style={[
                styles.filterBtnInner,
                filter === cat && styles.filterBtnActive,
              ]}
              onPress={() => setFilter(f => f === cat ? null : cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterLabel,
                  filter === cat && styles.filterLabelActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Fruit of the day */}
      <View style={styles.dayRow}>
        <Text style={styles.dayLabel}>Fruit of the day:</Text>
        <View style={styles.dayChipWrapper}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgLinearGradient id="gradDay" x1="1" y1="0" x2="0" y2="0">
                <Stop offset="0%"  stopColor="#FFFFFF"/>
                <Stop offset="100%" stopColor="#6666661A"/>
              </SvgLinearGradient>
            </Defs>
            <Rect
              x="0.5"
              y="0.5"
              width="99%"
              height="98%"
              rx="6"
              ry="6"
              fill="none"
              stroke="url(#gradDay)"
              strokeWidth="1"
            />
          </Svg>
          <View style={styles.dayChipInner}>
            <Text style={styles.dayChipLabel}>{dayFruit.name}</Text>
          </View>
        </View>
      </View>

      {/* Tip */}
      <Text style={styles.tip}>
        "Drink orange juice and recharge with vitamin C!
        A great way to strengthen the immune system!"
      </Text>

      {/* Список фруктов */}
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex:             1,
    paddingHorizontal:18,
    paddingTop:       50,
  },

  /* Header */
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   24,
    marginTop:10,
  },
  title: {
    flex:        1,
    fontFamily:  'Amagro-Bold',
    fontSize:    30,
    color:       '#fff',
    lineHeight:  34,
    marginLeft:  10,
  },
  sevenWrapper: {
    padding:    8,
    marginTop: -20,
  },
  seven: {
    width:      40,
    height:     42,
    resizeMode: 'contain',
  },

  /* Filters */
  filtersRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    marginBottom:   16,
  },
  filterWrapper: {
    position:        'relative',
    marginHorizontal:11,
    borderRadius:    6,
    overflow:        'visible',
  },
  filterBtnInner: {
    height:            32,
    paddingHorizontal: 19,
    justifyContent:    'center',
    alignItems:        'center',
    borderRadius:      6,
  },
  filterBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:   6,
    marginHorizontal:-1,
  },
  filterLabel: {
    color:    '#fff',
    fontSize: 14,
  },
  filterLabelActive: {
    fontWeight: '600',
  },

  /* Fruit of the day */
  dayRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   20,
  },
  dayLabel: {
    color:       '#fff',
    marginRight: 8,
    fontSize:    16,
    fontFamily:  'Amagro-Bold',
  },
  dayChipWrapper: {
    position:     'relative',
    height:       32,
    borderRadius: 6,
    overflow:     'visible',
  },
  dayChipInner: {
    height:            32,
    paddingHorizontal: 16,
    justifyContent:    'center',
    alignItems:        'center',
    borderRadius:      6,
  },
  dayChipLabel: {
    color:    '#fff',
    fontSize: 16,
  },

  /* Tip */
  tip: {
    color:        '#fff',
    fontSize:     14,
    marginBottom: 16,
    lineHeight:   20,
    textAlign:    'center',
  },

  /* Card */
  card: {
    height:       CARD_H,
    borderRadius: 14,
    overflow:     'hidden',
    marginBottom: 14,
  },
  cardImg: {
    width:  '100%',
    height: '100%',
  },
  cardLabel: {
    position:         'absolute',
    top:              12,
    left:             16,
    color:            '#fff',
    fontSize:         18,
    fontFamily:       'Amagro-Bold',
    textShadowColor:  '#000',
    textShadowRadius: 6,
  },

  /* CustomSwitch */
  cardSwitch: {
    position: 'absolute',
    top:      12,
    right:    16,
  },
  switchTrack: {
    width:          66,
    height:         30,
    borderRadius:   15,
    backgroundColor:'#fff',
    padding:        2,
  },
  switchThumb: {
    width:        36,
    height:       26,
    borderRadius: 13,
  },
});
