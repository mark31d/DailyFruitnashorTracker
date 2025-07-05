/* ------------------------------------------------------------------
   Components/StatsPicker.js   — финальная версия
------------------------------------------------------------------ */
import React from 'react';
import {
  View, Text, StyleSheet, Pressable,
  ImageBackground, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const BG = require('../assets/background.png');
const PERIODS = ['Day', 'Week', 'Month'];

export default function StatsPicker() {
  const nav = useNavigation();

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>
          FRUIT ACTIVITY{'\n'}STATISTICS
        </Text>

        {PERIODS.map((p, i) => (
          <View key={p} style={styles.btnWrapper}>
            {/* градиентная рамка */}
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id={`grad${i}`} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%"   stopColor="#FFFFFF"   />
                  <Stop offset="70%"  stopColor="#FFFFFF55" />
                  <Stop offset="100%" stopColor="#66666605" />
                </LinearGradient>
              </Defs>
              <Rect
                x="1"
                y="1"
                width="99%"          /* ← valid для react-native-svg */
                height="97%"
                rx="6"
                ry="6"
                fill="none"
                stroke={`url(#grad${i})`}
                strokeWidth="2"
              />
            </Svg>

            {/* кнопка */}
            <Pressable
              onPress={() => nav.navigate('StatsScreen', { period: p })}
              style={({ pressed }) => [
                styles.btnInner,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.btnTxt}>{p}</Text>
            </Pressable>
          </View>
        ))}
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─── styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 ,  padding:10,},

  safe: {
    flex: 1,
    paddingHorizontal: 24,  // рамки не «режутся»
    paddingTop: 60,
  },

  title: {
    fontFamily: 'Amagro-Bold',
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 40,
    marginTop:40,
  },

  btnWrapper: {
    marginVertical: 14,
    borderRadius: 6,
    overflow: 'visible',
    
  },

  btnInner: {
    
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  btnPressed: {
    backgroundColor: 'rgba(255,255,255,0.20)', // пелена во время press
  },

  btnTxt: {
    fontFamily: 'Actay-Regular',
    fontSize: 20,
    color: '#fff',
  },
});
