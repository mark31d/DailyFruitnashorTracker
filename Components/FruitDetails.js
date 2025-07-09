import React, { useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Animated,
  TouchableWithoutFeedback,
  Linking,                    // ← stays
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TriedContext } from '../Components/TriedContext';

const { width } = Dimensions.get('window');
const IMAGE_H  = width * 0.5;

const BG        = require('../assets/background.png');
const BACK_ICON = require('../assets/back.png');

/* ───────── custom switch ───────── */
function CustomSwitch({ value, onValueChange, style }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         value ? 1 : 0,
      duration:        200,
      useNativeDriver: false,
    }).start();
  }, [value]);

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

/* ───────── fruit data ───────── */
const FRUITS = [
  {
    id: 'persimmon',
    name: 'Persimmon',
    img: require('../assets/fruits/persimmon.png'),
    description:
      'Persimmon is a sweet and juicy orange–colored fruit, especially popular in autumn and winter. There are tart and non-tart varieties. The tartness disappears after freezing or full ripening. The persimmon pulp has a delicate, honey-like taste.',
    properties: [
      'Source of vitamin A: Supports healthy eyesight and skin.',
      'Rich in antioxidants: Protects cells from free-radical damage.',
      'Contains fiber: Improves digestion and helps control cholesterol levels.',
      'Source of potassium: Helps normalise blood pressure.',
      'Strengthens the immune system: Contains vitamin C and other nutrients.',
    ],
    source: 'https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=Persimmon',
  },
  {
    id: 'pomegranate',
    name: 'Pomegranate',
    img: require('../assets/fruits/pomegranate.png'),
    description:
      'Pomegranate is a fruit with a dense skin and many juicy arils inside. It has a sweet-and-tart flavour.',
    properties: [
      'Rich in antioxidants (punicalagins): Protects against oxidative stress.',
      'Contains vitamin C: Supports immunity and skin health.',
      'Potassium source: Aids blood-pressure regulation.',
      'Improves blood circulation: Promotes heart health.',
      'Provides iron: Helps prevent anaemia.',
    ],
    source: 'https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=Pomegranate',
  },
  {
    id: 'melon',
    name: 'Melon',
    img: require('../assets/fruits/melon.png'),
    description:
      'Melon is a juicy, sweet summer fruit with tender flesh and refreshing taste.',
    properties: [
      'Source of vitamin C: Supports immune function.',
      'Contains potassium: Important for heart and muscle function.',
      'Rich in antioxidants: Helps protect cells.',
      'Provides fibre: Supports digestion.',
      'Contains vitamin A: Beneficial for vision and skin.',
    ],
    source: 'https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=Melon',
  },
  {
    id: 'grapefruit',
    name: 'Grapefruit',
    img: require('../assets/fruits/grapefruit.png'),
    description:
      'Grapefruit is a citrus fruit with a distinct sweet-and-tart flavour and refreshing aroma.',
    properties: [
      'High in vitamin C: Boosts immune defence.',
      'Contains antioxidants (lycopene, naringenin): Protects cells.',
      'Pectin content may help lower cholesterol.',
      'Supports heart health: Reduces cardiovascular risk.',
      'May aid metabolism: Linked to weight-management benefits.',
    ],
    source: 'https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=Grapefruit',
  },
  {
    id: 'orange',
    name: 'Orange',
    img: require('../assets/fruits/orange.png'),
    description:
      'Orange is a juicy, sweet citrus fruit renowned for its vitamin C content.',
    properties: [
      'Excellent vitamin C source: Strengthens immunity.',
      'Contains antioxidants: Helps counteract free-radical damage.',
      'Improves skin appearance: Thanks to vitamin C and flavonoids.',
      'Pectin may assist in lowering cholesterol.',
      'Provides vitamin A: Contributes to eye health.',
    ],
    source: 'https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=Orange',
  },
  {
    id: 'apple',
    name: 'Apple',
    img: require('../assets/fruits/apple.png'),
    description:
      'Apple is one of the most popular fruits worldwide, available in many varieties and flavours.',
    properties: [
      'Rich in fibre: Supports digestion and cholesterol control.',
      'Contains vitamin C: Supports immune system.',
      'Provides antioxidants (quercetin): Neutralises free radicals.',
      'Low calorie, high fibre: Aids weight control.',
      'May benefit heart health: Linked to lower cardiovascular risk.',
    ],
    source: 'https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=Apple',
  },
  {
    id: 'banana',
    name: 'Banana',
    img: require('../assets/fruits/banana.png'),
    description:
      'Banana is a convenient, energy-dense tropical fruit with a naturally sweet taste.',
    properties: [
      'Excellent potassium source: Supports heart and muscle function.',
      'Contains vitamin B6: Helps mood regulation and nervous-system health.',
      'Rich in fibre: Promotes digestive regularity.',
      'Provides magnesium: May aid relaxation and sleep.',
      'Quick energy: Favoured by athletes and active individuals.',
    ],
    source: 'https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=Banana',
  },
];

/* ───────── main component ───────── */
export default function FruitDetails() {
  const { tried, setTried } = useContext(TriedContext);

  const route = useRoute();
  const nav   = useNavigation();
  const { fruitId } = route.params;
  const fruit = FRUITS.find(f => f.id === fruitId) || FRUITS[0];

  const value  = !!tried[fruit.id];
  const toggle = v => setTried(prev => ({ ...prev, [fruit.id]: v }));

  const openSource = () => {
    if (fruit.source) {
      Linking.openURL(fruit.source).catch(err =>
        console.warn('Cannot open URL:', err),
      );
    }
  };

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{fruit.name.toUpperCase()}</Text>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <Image source={BACK_ICON} style={styles.backImg} />
          </TouchableOpacity>
        </View>

        {/* Image + Switch */}
        <View style={styles.imgWrap}>
          <Image source={fruit.img} style={styles.image} />
          <CustomSwitch
            value={value}
            onValueChange={toggle}
            style={styles.toggle}
          />
        </View>

        {/* Details */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 32 }}>
          <Text style={styles.description}>{fruit.description}</Text>
          <Text style={styles.subhead}>Useful properties:</Text>
          {fruit.properties.map((p, i) => (
            <Text key={i} style={styles.property}>• {p}</Text>
          ))}

          {/* Official source button */}
          <TouchableOpacity style={styles.sourceBtn} onPress={openSource}>
            <Text style={styles.sourceTxt}>Resource</Text>
          </TouchableOpacity>
        </ScrollView>

      </SafeAreaView>
    </ImageBackground>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  root:        { flex:1, backgroundColor:'#611', paddingHorizontal:18, paddingVertical:16 },
  safe:        { flex:1 },
  header:      { position:'relative', justifyContent:'center', alignItems:'center', height:64, marginBottom:16 },
  title:       { fontFamily:'Amagro-Bold', fontSize:28, color:'#fff', lineHeight:34 },
  backBtn:     { position:'absolute', left:0, top:'50%', marginTop:-29, padding:8 },
  backImg:     { width:40, height:40, tintColor:'#fff', resizeMode:'contain' },
  imgWrap:     { width:'100%', height:IMAGE_H, borderRadius:14, overflow:'hidden', marginBottom:16 },
  image:       { width:'100%', height:'100%' },
  toggle:      { position:'absolute', bottom:12, right:16 },

  scroll:      { flex:1 },
  description: { color:'#fff', fontSize:14, lineHeight:20, marginBottom:16, textAlign:'center' },
  subhead:     { color:'#fff', fontSize:18, fontFamily:'Amagro-Bold', marginBottom:12 },
  property:    { color:'#fff', fontSize:14, lineHeight:20, marginBottom:8, paddingLeft:8 },

  switchTrack: { width:66, height:30, borderRadius:15, backgroundColor:'#fff', padding:2 },
  switchThumb: { width:36, height:26, borderRadius:13 },

  sourceBtn:   {
    marginTop:24,
    alignSelf:'center',
    backgroundColor:'#FFF',
    paddingVertical:20,
    paddingHorizontal:25,
    borderRadius:12,
  },
  sourceTxt:   { fontSize:25, fontFamily:'Amagro-Bold', color:'#611' },
});
