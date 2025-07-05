/* ------------------------------------------------------------------
   Components/WaterLog.js
   Учёт напитков + собственный Drop-down DrinkSelect
   • Кувшин заполняется ТОЛЬКО объёмом «Water»
   • Все записи сохраняются и в AsyncStorage, и в DataProvider
------------------------------------------------------------------- */
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTracker } from './DataProvider';

/* ─── размеры ─────────────────────────────────────────────────── */
const { width } = Dimensions.get('window');
const PITCHER_W = width * 0.58;

/* ─── ресурсы ─────────────────────────────────────────────────── */
const BG        = require('../assets/background.png');
const BACK      = require('../assets/back.png');
const ARROW_DWN = require('../assets/arrow_down.png');
const JUG = [
  require('../assets/jug_0.png'),
  require('../assets/jug_1.png'),
  require('../assets/jug_2.png'),
  require('../assets/jug_3.png'),
  require('../assets/jug_4.png'),
];

/* ─── константы ───────────────────────────────────────────────── */
const DRINKS    = ['Water', 'Juice', 'Lemonade', 'Soda', 'Mors'];
const TARGET_ML = 3000;            // дневная цель

/* ───────────────────────────────────────────────────────────────
   Выпадающий список напитков
─────────────────────────────────────────────────────────────── */
function DrinkSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(o => !o);
  const choose = d => {
    onChange(d);
    setOpen(false);
  };

  return (
    <View style={styles.dsWrap}>
      <TouchableOpacity
        style={styles.dsBtn}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <Text style={styles.dsTxt}>{value}</Text>
        <Image
          source={ARROW_DWN}
          style={[styles.dsImg, open && { transform: [{ rotate: '180deg' }] }]}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {DRINKS.map(d => (
            <TouchableOpacity
              key={d}
              style={styles.itemBtn}
              onPress={() => choose(d)}
              activeOpacity={0.8}
            >
              <Text style={styles.itemTxt}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

/* ───────────────────────────────────────────────────────────────
   Основной экран
─────────────────────────────────────────────────────────────── */
export default function WaterLog() {
  const nav             = useNavigation();
  const { params = {} } = useRoute();

  const today   = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dateKey = params.date ?? today;                  // ключ дня

  const storageKey = `waterlog-${dateKey}`;

  /* контекст */
  const { addDrink, setCurrentDate } = useTracker();

  /* локальное состояние */
  const [entries, setEntries] = useState([]);
  const [modal,   setModal]   = useState(false);
  const [drink,   setDrink]   = useState('Water');
  const [vol,     setVol]     = useState('');

  /* при монтировании прописываем дату в контекст */
  useEffect(() => { setCurrentDate(dateKey); }, [dateKey, setCurrentDate]);

  /* ── загрузка / сохранение ─────────────────────────────────── */
  useEffect(() => {
    AsyncStorage.getItem(storageKey).then(json => {
      if (json) { try { setEntries(JSON.parse(json)); } catch {} }
    });
  }, [storageKey]);

  useEffect(() => {
    AsyncStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, storageKey]);

  /* ── вычисления ────────────────────────────────────────────── */
  const total      = useMemo(
    () => entries.reduce((s, e) => s + e.ml, 0),
    [entries],
  );
  const waterTotal = useMemo(
    () => entries.filter(e => e.drink === 'Water')
                 .reduce((s, e) => s + e.ml, 0),
    [entries],
  );
  const jugLevel = Math.min(4, Math.floor((waterTotal / TARGET_ML) * 4));
  const lastDrink = entries.at(-1)?.drink ?? 'water';

  /* ── добавить запись ───────────────────────────────────────── */
  const volML       = parseInt(vol, 10) || 0;
  const disabledAdd = volML === 0;

  const addEntry = () => {
    const ts     = Date.now();
     const record = { id: ts.toString(), drink, ml: volML, ts };
    

    // 1) локально
    setEntries(prev => [...prev, record]);      // ← локальный список
    addDrink(dateKey, drink, volML, ts);  

    // 2) в общий контекст
    addDrink(dateKey, drink, volML);

    // 3) сброс формы и закрытие
    setDrink('Water');
    setVol('');
    setModal(false);
  };

  /* ── UI ─────────────────────────────────────────────────────── */
  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView>
          {/* ← back */}
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <Image source={BACK} style={styles.backImg} />
          </TouchableOpacity>

          {/* заголовок и кувшин */}
          <Text style={styles.title}>WATER</Text>
          <Text style={styles.target}>Target: 3 liters</Text>

          <Image source={JUG[jugLevel]} style={styles.jug} />

          {/* итог */}
          <Text style={styles.total}>
            I drank some {lastDrink.toLowerCase()}: {total} ml
          </Text>

          {/* список записей */}
          {entries.map(e => (
            <View key={e.id} style={styles.row}>
              <Text style={styles.cellDrink}>{e.drink}</Text>
              <Text style={styles.cellVol}>{e.ml} ml</Text>
            </View>
          ))}
        </SafeAreaView>
      </ScrollView>

      {/* кнопка «+» */}
      <TouchableOpacity onPress={() => setModal(true)} style={styles.plusBtn}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>

      {/* ── модалка «Add a drink» ───────────────────────────────── */}
      <Modal visible={modal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add a drink</Text>

            {/* drink + volume */}
            <View style={styles.selectRow}>
              <DrinkSelect value={drink} onChange={setDrink} />
              <View style={styles.inputWrap}>
                <TextInput
                  value={vol}
                  onChangeText={setVol}
                  placeholder="ml"
                  placeholderTextColor="#aaa"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>

            {/* кнопка Add */}
            <TouchableOpacity
              onPress={addEntry}
              style={[styles.addBtn, disabledAdd && { opacity: 0.5 }]}
              disabled={disabledAdd}
            >
              <Text style={styles.addTxt}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

/* ─── стили ───────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root:{ flex:1 },
  scroll:{ paddingHorizontal:18, paddingTop:10, paddingBottom:140 },

  backBtn:{ marginTop:10, padding:10, zIndex:1, marginBottom:-52 },
  backImg:{ width:40, height:40, tintColor:'#fff', resizeMode:'contain' },

  title:{ fontFamily:'Amagro-Bold', fontSize:28, color:'#fff', textAlign:'center', marginTop:4 },
  target:{ fontFamily:'Actay-Regular', fontSize:16, color:'#fff', textAlign:'center', marginBottom:8 },

  jug:{ width:PITCHER_W, height:PITCHER_W*1.1, alignSelf:'center', resizeMode:'contain', marginVertical:6 },

  total:{ fontFamily:'Actay-Regular', color:'#fff', fontSize:18, marginVertical:10 },
  row:{ flexDirection:'row', marginBottom:3 },
  cellDrink:{ width:80, color:'#fff', fontFamily:'Actay-Regular', fontSize:15 },
  cellVol:{ color:'#fff', fontFamily:'Actay-Regular', fontSize:15 },

  plusBtn:{ position:'absolute', bottom:20, alignSelf:'center' },
  plus:{ fontSize:48, color:'#fff', fontFamily:'Amagro-Bold' },

  /* ── модалка ──────────────────────────────────────────────── */
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', alignItems:'center' },

  modalBox:{
    width: width*0.8,
    backgroundColor:'rgba(0,0,0,0.85)',
    borderRadius:18,
    paddingVertical:18,
    paddingHorizontal:14,
    borderWidth:1,
    borderColor:'#fff',
  },
  modalTitle:{ fontFamily:'Actay-Regular', fontSize:20, color:'#fff', textAlign:'center', marginBottom:12 },

  selectRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom:16 },

  /* DrinkSelect */
  dsWrap:{ flex:1, position:'relative', marginRight:10 },
  dsBtn:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'rgba(255,255,255,0.2)',
    borderRadius:20,
    height:34,
    paddingHorizontal:12,
  },
  dsTxt:{ flex:1, color:'#fff', fontSize:16, fontFamily:'Actay-Regular' },
  dsImg:{ width:12, height:12, tintColor:'#fff' },

  dropdown:{
    position:'absolute',
    top:48, left:0, right:0,
    backgroundColor:'rgba(0,0,0,0.9)',
    borderRadius:20,
    paddingVertical:4,
    zIndex:10,
  },
  itemBtn:{ paddingVertical:6, paddingHorizontal:12 },
  itemTxt:{ color:'#fff', fontSize:16, fontFamily:'Actay-Regular' },

  /* объём */
  inputWrap:{
    backgroundColor:'rgba(255,255,255,0.2)',
    borderRadius:20,
    justifyContent:'center',
    paddingHorizontal:8,
    width:100,
    height:34,
  },
  input:{ height:44, color:'#fff', fontFamily:'Actay-Regular', fontSize:16 },

  /* Add */
  addBtn:{
    alignSelf:'center',
    paddingHorizontal:24,
    paddingVertical:8,
    backgroundColor:'rgba(255,255,255,0.12)',
    borderRadius:20,
  },
  addTxt:{ color:'#fff', fontFamily:'Actay-Regular', fontSize:16 },
});
