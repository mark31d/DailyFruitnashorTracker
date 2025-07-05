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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TriedContext } from '../Components/TriedContext';

const { width } = Dimensions.get('window');
const IMAGE_H = width * 0.5;

const BG        = require('../assets/background.png');
const BACK_ICON = require('../assets/back.png');

// кастомный свич
function CustomSwitch({ value, onValueChange, style }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:        value ? 1 : 0,
      duration:       200,
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


const FRUITS = [
    {
      id: 'persimmon',
      name: 'Persimmon',
      img: require('../assets/fruits/persimmon.png'),
      description:
        'Persimmon is a sweet and juicy orange–colored fruit, especially popular in autumn and winter. There are tart and non-tart varieties. The tartness disappears after freezing or full ripening. The persimmon pulp has a delicate, honey-like taste.',
      properties: [
        'Source of vitamin A: Supports healthy eyesight and skin.',
        'Rich in antioxidants: Protects cells from free radical damage.',
        'Contains fiber: Improves digestion and helps control cholesterol levels.',
        'Source of potassium: Normalizes blood pressure.',
        'Strengthens the immune system: It contains vitamin C and other useful substances.',
      ],
    },
    {
      id: 'pomegranate',
      name: 'Pomegranate',
      img: require('../assets/fruits/pomegranate.png'),
      description:
        'Pomegranate is a fruit with a dense skin and lots of juicy grains inside. It has a sweet and sour taste.',
      properties: [
        'Rich in antioxidants (punicalagins): Protects against free radicals and inflammation.',
        'Contains vitamin C: Supports the immune system and skin health.',
        'Source of potassium: Normalizes blood pressure.',
        'Improves blood circulation: Promotes heart health.',
        'Contains iron: Helps prevent anemia.',
      ],
    },
    {
      id: 'melon',
      name: 'Melon',
      img: require('../assets/fruits/melon.png'),
      description:
        'Melon is a juicy and sweet summer fruit with tender flesh and refreshing taste.',
      properties: [
        'Source of vitamin C: Strengthens the immune system.',
        'Contains potassium: Important for heart and muscle health.',
        'Rich in antioxidants: Protects cells from damage.',
        'Fiber source: Improves digestion.',
        'Contains Vitamin A: Supports healthy eyesight and skin.',
      ],
    },
    {
      id: 'grapefruit',
      name: 'Grapefruit',
      img: require('../assets/fruits/grapefruit.png'),
      description:
        'Grapefruit is a citrus fruit with a sweet and sour taste and a refreshing aroma.',
      properties: [
        'Source of vitamin C: Strengthens the immune system.',
        'Contains antioxidants (lycopene, naringenin): Protects cells from damage.',
        'Helps to lower cholesterol levels: Due to the content of pectin.',
        'Supports heart health: Reduces the risk of cardiovascular diseases.',
        'Improves metabolism: Promotes weight loss.',
      ],
    },
    {
      id: 'orange',
      name: 'Orange',
      img: require('../assets/fruits/orange.png'),
      description:
        'Orange is a juicy and sweet citrus fruit rich in vitamin C.',
      properties: [
        'Excellent source of vitamin C: Strengthens the immune system and protects against colds.',
        'Contains antioxidants: Protects cells from damage.',
        'Improves skin condition: Thanks to vitamin C and antioxidants.',
        'Helps to lower cholesterol levels: Due to the content of pectin.',
        'Improves eyesight: Contains vitamin A.',
      ],
    },
    {
      id: 'apple',
      name: 'Apple',
      img: require('../assets/fruits/apple.png'),
      description:
        'The apple is one of the most popular and affordable fruits. There are many varieties with different flavors and textures.',
      properties: [
        'Rich in fiber: Helps to normalize digestion and control cholesterol levels.',
        'Contains vitamin C: Supports the immune system.',
        'Source of antioxidants (quercetin): Protects against free radicals.',
        'Helps to control weight: Thanks to fiber and low calorie content.',
        'Improves heart health: Reduces the risk of cardiovascular diseases.',
      ],
    },
    {
      id: 'banana',
      name: 'Banana',
      img: require('../assets/fruits/banana.png'),
      description:
        'Banana is a tropical fruit with a delicate flesh and sweet taste. It is convenient for snacking and is an excellent source of energy.',
      properties: [
        'Source of potassium: Important for heart and muscle health.',
        'Contains vitamin B6: Improves mood and supports the nervous system.',
        'Rich in fiber: Helps to normalize digestion.',
        'Source of magnesium: Helps to relax and improves sleep.',
        'Fast energy source: Suitable for athletes and active lifestyle.',
      ],
    },
  ];

export default function FruitDetails() {
  const { tried, setTried } = useContext(TriedContext);

  const route = useRoute();
  const nav   = useNavigation();
  const { fruitId } = route.params;
  const fruit = FRUITS.find(f => f.id === fruitId) || FRUITS[0];

  const value = !!tried[fruit.id];
  const toggle = v => {
    setTried(prev => ({ ...prev, [fruit.id]: v }));
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

        {/* Description & List */}
        <ScrollView style={styles.scroll}>
          <Text style={styles.description}>{fruit.description}</Text>
          <Text style={styles.subhead}>Useful properties:</Text>
          {fruit.properties.map((p, i) => (
            <Text key={i} style={styles.property}>• {p}</Text>
          ))}
        </ScrollView>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    root: {
             flex: 1,
             backgroundColor: '#611',
             paddingHorizontal: 18,  // ← добавили отступы со сторон
             paddingVertical: 16,    // ← и сверху/снизу
           },
           safe: {
             flex: 1,
             // убрали padding, чтобы не дублировать
           },
  header:         { position:'relative', justifyContent:'center', alignItems:'center', height:64, marginBottom:16 },
  title:          { fontFamily:'Amagro-Bold', fontSize:28, color:'#fff', lineHeight:34 },
  backBtn:        { position:'absolute', left:0, top:'50%', marginTop:-29, padding:8 },
  backImg:        { width:40, height:40, tintColor:'#fff', resizeMode:'contain' },
  imgWrap:        { width:'100%', height:IMAGE_H, borderRadius:14, overflow:'hidden', marginBottom:16 },
  image:          { width:'100%', height:'100%' },
  toggle:         { position:'absolute', bottom:12, right:16 },
  scroll:         { flex:1, paddingBottom:24 },
  description:    { color:'#fff', fontSize:14, lineHeight:20, marginBottom:16 , textAlign:  'center',
   },
  subhead:        { color:'#fff', fontSize:18, fontFamily:'Amagro-Bold', marginBottom:12 },
  property:       { color:'#fff', fontSize:14, lineHeight:20, marginBottom:8, paddingLeft:8 },
  switchTrack:    { width:66, height:30, borderRadius:15, backgroundColor:'#fff', padding:2 },
  switchThumb:    { width:36, height:26, borderRadius:13 },
});


