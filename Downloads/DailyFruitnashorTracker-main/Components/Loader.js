/* ------------------------------------------------------------------
   Components/Loader.js
   Фон + логотип + текст с Amagro-Bold
   Эффект «blur → clear» для фона, «fade-in» для текста и логотипа
   Центрирование и трёхстрочное название, лого под размер экрана
------------------------------------------------------------------- */
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ImageBackground,
  Image,
  Text,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
// 1) фон (чёткий)
const BG   = require('../assets/splash_bg.png');
// 2) логотип (семёрка + фрукты)
const LOGO = require('../assets/splash_logo.png');

export default function Loader({ onDone = () => {} }) {
  const blurOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(500), // пауза на размытую картинку
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(600),
    ]).start(onDone);
  }, [blurOpacity, logoOpacity, textOpacity, onDone]);

  return (
    <View style={styles.container}>
      {/* 1. Чёткий фон */}
      <ImageBackground source={BG} style={styles.fullscreen} />

      {/* 2. Размытую копию сводим (opacity 1→0) */}
      <Animated.Image
        source={BG}
        style={[styles.fullscreen, styles.absolute, { opacity: blurOpacity }]}
        blurRadius={12}
      />

      {/* 3+4. Центрированный блок с текстом и лого */}
      <View style={styles.centerBlock}>
        <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
          DAILY{'\n'}
          FRUITNASHOR{'\n'}
          TRACKER
        </Animated.Text>
        <Animated.Image
          source={LOGO}
          style={[styles.logo, { opacity: logoOpacity }]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#000' },
  fullscreen: { width, height },
  absolute:   { position: 'absolute', top: 0, left: 0 },

  // Центрируем по горизонтали и вертикали,
  // добавляем паддинг, чтобы на узких экранах текст не упирался в «крышу»
  centerBlock: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.05,
  },

  title: {
    textAlign: 'center',
    fontFamily: 'Amagro-Bold',
    fontSize: 48,
    lineHeight: 60,
    color: '#fff',
    marginBottom: 16,
  },

  logo: {
    // Ширина — 70% экрана, но высота не больше 25% экрана
    width: width * 0.9,
    maxHeight: height * 0.25,
  },
});
