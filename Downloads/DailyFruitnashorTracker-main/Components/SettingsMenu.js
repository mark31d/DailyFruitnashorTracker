/* ------------------------------------------------------------------
   Components/SettingsMenu.js
   ▸ градиент-только-бордер + кастомный зелёно/красный Switch
------------------------------------------------------------------ */

import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  View,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, LinearGradient as Grad, Stop, Rect } from 'react-native-svg';

const BG = require('../assets/background.png');

/* размеры */
const HEIGHT = 54;
const BORDER = 2;
const RADIUS = HEIGHT / 2;

/* размеры кастомного свитча (как в FruitMenu) */
const SWITCH_W = 66;
const SWITCH_H = 30;
const THUMB_W  = 36;

/* ─── кастомный toggle ─────────────────────────────────────────── */
function CustomSwitch({ value, onValueChange }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const translateX = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, SWITCH_W - THUMB_W - 4], // 4px = 2*padding
  });

  return (
    <TouchableWithoutFeedback onPress={() => onValueChange(!value)}>
      <View style={styles.switchTrack}>
        <Animated.View
          style={[
            styles.switchThumb,
            {
              transform: [{ translateX }],
              backgroundColor: value ? '#32DC46' : '#D40A07',
            },
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

/* ─── экран настроек ───────────────────────────────────────────── */
export default function SettingsMenu() {
  const nav = useNavigation();
  const [notif, setNotif] = useState(true);

  /* строка-пункт с градиентной рамкой */
  const Row = ({ children, onPress }) => (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowWrap,
        pressed && onPress && { opacity: 0.85 },
      ]}
    >
      {/* SVG-рамка */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Grad id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0" stopColor="#360102" />
            <Stop offset="1" stopColor="#E4A1A1" />
          </Grad>
        </Defs>
        <Rect
          x={BORDER}
          y={BORDER}
          width="99%"
          height="95%"
          rx={RADIUS - BORDER}
          ry={RADIUS - BORDER}
          stroke="url(#g)"
          strokeWidth={BORDER}
          fill="none"
        />
      </Svg>

      <View style={styles.content}>{children}</View>
    </Pressable>
  );

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>SETTINGS</Text>

        {/* Notifications с кастомным свитчем */}
        <Row>
          <Text style={styles.label}>Notifications</Text>
          <CustomSwitch value={notif} onValueChange={setNotif} />
        </Row>

        {/* Daily Goal */}
        <Row onPress={() => nav.navigate('DailyGoal')}>
          <Text style={styles.label}>Daily Goal</Text>
        </Row>

        {/* Information */}
        <Row onPress={() => nav.navigate('InfoScreen')}>
          <Text style={styles.label}>Information</Text>
        </Row>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─── стили ────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, padding: 10 },
  safe: { flex: 1, paddingHorizontal: 18 , marginTop:60,},

  title: {
    fontFamily: 'Amagro-Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 12,
  },

  rowWrap: {
    height: HEIGHT,
    borderRadius: RADIUS,
    marginBottom: 16,
  },

  content: {
    flex: 1,
    borderRadius: RADIUS - BORDER,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Actay-Regular',
  },

  /* кастомный switch */
  switchTrack: {
    width: SWITCH_W,
    height: SWITCH_H,
    borderRadius: SWITCH_H / 2,
    backgroundColor: '#fff',
    padding: 2,
  },
  switchThumb: {
    width: THUMB_W,
    height: SWITCH_H - 4,
    borderRadius: (SWITCH_H - 4) / 2,
  },
});
