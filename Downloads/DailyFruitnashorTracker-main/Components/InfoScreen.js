/* ------------------------------------------------------------------
   Components/InfoScreen.js
   ▸ стили оставлены «как есть»
   ▸ обе опции показывают Alert: «Функция будет добавлена позже»
------------------------------------------------------------------ */
import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ImageBackground,
  Alert,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient as Grad, Stop, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const BG   = require('../assets/background.png');
const BACK = require('../assets/back.png');

/* ─── Gradient-border wrapper ─── */
const GradientBorder = ({ children, style }) => (
  <View style={style}>
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <Grad id="g" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#360102" />
          <Stop offset="1" stopColor="#E4A1A1" />
        </Grad>
      </Defs>
      <Rect
        x="0.5" y="0.5"
        width="99%" height="98%"
        rx="24" ry="24"
        stroke="url(#g)" strokeWidth="2" fill="none"
      />
    </Svg>
    {children}
  </View>
);

export default function InfoScreen() {
  const nav = useNavigation();

  /* Alert-заглушка */
  const soon = (title) =>
    Alert.alert(title, 'This feature will be added in a future update.');

  /* универсальный пункт */
  const OptionRow = ({ label }) => (
    <GradientBorder style={styles.rowWrap}>
      <TouchableOpacity
        style={styles.rowInner}
        activeOpacity={0.8}
        onPress={() => soon(label)}
      >
        <Text style={styles.rowText}>{label}</Text>
      </TouchableOpacity>
    </GradientBorder>
  );

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* ← back */}
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Image source={BACK} style={styles.backImg} />
        </TouchableOpacity>

        <Text style={styles.title}>INFORMATION</Text>

        <OptionRow label="Privacy Policy and Terms of Use" />
        <OptionRow label='The “About the Developer” section' />
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─── styles: оставлены без изменений ─── */
const styles = StyleSheet.create({
  root:{ flex:1, padding:10 },
  safe:{ flex:1, paddingHorizontal:18 , marginTop:20,},

  backBtn:{ marginTop:20 , zIndex:1 },
  backImg:{
    width:40, height:40,
    tintColor:'#fff',
    resizeMode:'contain',
    marginBottom:-50, top:15, 
  },

  title:{
    fontFamily:'Amagro-Bold',
    fontSize:28,
    color:'#fff',
    textAlign:'center',
    marginVertical:20,
  },

  rowWrap:{
    height:54,
    borderRadius:27,
    marginBottom:16,
  },
  rowInner:{
    flex:1,
    borderRadius:25,
    alignItems:'center',
    justifyContent:'center',
  },
  rowText:{
    color:'#fff',
    fontSize:16,
    fontFamily:'Actay-Regular',
    textAlign:'center',
  },
});
