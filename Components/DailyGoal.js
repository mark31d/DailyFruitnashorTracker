/* ------------------------------------------------------------------
   Components/DailyGoal.js  –  полноэкранная карточка «Daily Goal»
   ▸ собственные выпадающие списки с градиентной рамкой
   ▸ без position:absolute – верстка больше не перекрывается
   ▸ все padding’и сведены к минимуму (по просьбе «убрать padding»)
------------------------------------------------------------------ */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Pressable,
} from 'react-native';
import Svg, { Defs, LinearGradient as Grad, Stop, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const BG     = require('../assets/background.png');
const BACK   = require('../assets/back.png');
const CHEV   = require('../assets/arrow_down.png');
const BACK_L = require('../assets/arrow_left.png');

const { width } = Dimensions.get('window');

const FRUIT_UNITS = ['Pieces', 'Portions'];
const WATER_UNITS = ['Liters', 'Milliliters', 'Glasses'];

/* — градиентная рамка-контейнер — */
const GradientBorder = ({ style, children }) => (
  <View style={style}>
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <Grad id="gradBorder" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffffaa" />
          <Stop offset="1" stopColor="#6666661A" />
        </Grad>
      </Defs>
      <Rect
        x="0.5"
        y="0.5"
        width="99%"
        height="98%"
        rx="18"
        ry="18"
        fill="none"
        stroke="url(#gradBorder)"
        strokeWidth="2"
      />
    </Svg>
    {children}
  </View>
);

/* — кастомный Select — */
function Select({ value, options, onSelect, style }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={style}>
      {/* кнопка селекта */}
      <GradientBorder style={styles.selBtnWrap}>
        <Pressable
          style={styles.selBtn}
          onPress={() => setOpen(o => !o)}
        >
          <Text style={styles.selBtnText}>{value}</Text>
          <Image
            source={CHEV}
            style={[styles.chev, open && { transform: [{ rotate: '180deg' }] }]}
          />
        </Pressable>
      </GradientBorder>

      {/* список опций */}
      {open && (
        <GradientBorder style={styles.selListWrap}>
          <View style={styles.selList}>

            {/* стрелка «‹» закрыть */}
            <Pressable
              style={styles.backArrowWrap}
              onPress={() => setOpen(false)}
            >
              <Image source={BACK_L} style={styles.backArrow} />
            </Pressable>

            {options.map(opt => (
              <Pressable
                key={opt}
                style={styles.selItem}
                onPress={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
              >
                <Text style={styles.selItemText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </GradientBorder>
      )}
    </View>
  );
}

export default function DailyGoal() {
  const nav = useNavigation();

  const [fruitCount, setFruitCount] = useState('5');
  const [fruitUnit,  setFruitUnit]  = useState(FRUIT_UNITS[0]);
  const [waterAmount,setWaterAmount]= useState('3');
  const [waterUnit,  setWaterUnit]  = useState(WATER_UNITS[0]);

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>

        {/* back */}
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Image source={BACK} style={styles.backImg} />
        </TouchableOpacity>

        <Text style={styles.title}>DAILY GOAL</Text>

        {/* ─── FRUITS ─── */}
        <Text style={styles.sectionHeader}>FRUITS</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Number of fruits per day</Text>
          <TextInput
            style={styles.qtyInput}
            value={fruitCount}
            onChangeText={setFruitCount}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Units of measurement</Text>
          <Select
            value={fruitUnit}
            options={FRUIT_UNITS}
            onSelect={setFruitUnit}
            style={styles.selectBox}
          />
        </View>

        {/* ─── WATER ─── */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>WATER</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Amount of water per day</Text>
          <TextInput
            style={styles.qtyInput}
            value={waterAmount}
            onChangeText={setWaterAmount}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Units of measurement</Text>
          <Select
            value={waterUnit}
            options={WATER_UNITS}
            onSelect={setWaterUnit}
            style={styles.selectBox}
          />
        </View>

        <Text style={styles.note}>
          Remember that the optimal amount of fruit and water depends on your individual needs. Consult your doctor.
        </Text>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─── стили ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1  , padding:10,},
  /* padding убран по требованиям */
  safe: { flex: 1 },

  backBtn: { marginTop: 10 , zIndex:1, },
  backImg: { width: 40, height: 40, tintColor: '#fff', resizeMode: 'contain' , marginBottom:-39, },

  title: {
    fontFamily: 'Amagro-Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },

  sectionHeader: {
    fontFamily: 'Amagro-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
  },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 18, // даём чуть отступов от краёв
  },
  fieldLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Actay-Regular',
  },

  /* pill-input */
  qtyInput: {
    width: 60,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'Actay-Regular',
    fontSize: 16,
  },

  /* select */
  selectBox: { width: width * 0.45 },

  selBtnWrap: { height: 36, borderRadius: 18 },
  selBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  selBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Actay-Regular' },
  chev: { width: 16, height: 16, tintColor: '#fff', resizeMode: 'contain' },

  selListWrap: { marginTop: 6, borderRadius: 18 },
  selList: { paddingVertical: 10, paddingHorizontal: 14 },
  backArrowWrap: { alignSelf: 'flex-end', padding: 4 },
  backArrow: { width: 14, height: 14, tintColor: '#fff', resizeMode: 'contain' },

  selItem: { paddingVertical: 8 },
  selItemText: { color: '#fff', fontSize: 16, fontFamily: 'Actay-Regular' },

  note: {
    marginTop: 30,
    color: '#fff',
    fontFamily: 'Actay-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 18,
  },
});
