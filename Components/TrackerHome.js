/* ------------------------------------------------------------------
   Components/TrackerHome.js
   ▸ свободная навигация по месяцам и годам (стрелки + picker)
   ▸ локальный state date + синхронизация с DataProvider
------------------------------------------------------------------ */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  SafeAreaView, ImageBackground, Modal, Dimensions, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { useTracker } from './DataProvider';

/* ─ assets ─ */
const BG          = require('../assets/background.png');
const ICON_CAL    = require('../assets/calendar.png');
const ARROW_LEFT  = require('../assets/arrow_left2.png');
const ARROW_RIGHT = require('../assets/arrow_right.png');

/* ─ helpers ─ */
const fmt = (d) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
};
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 150 }, (_, i) => THIS_YEAR - 100 + i);

export default function TrackerHome() {
  const nav = useNavigation();
  const { currentDate, setCurrentDate } = useTracker();

  /* ───────────────────── локальный Date ───────────────────── */
  const [date, setDate] = useState(
    currentDate ? new Date(currentDate) : new Date()
  );

  /* держим контекст в синхроне (если пришли с другого экрана) */
  useEffect(() => {
    if (currentDate) {
      const d = new Date(currentDate);
      if (!isNaN(d) && d.toISOString().slice(0,10) !== date.toISOString().slice(0,10)) {
        setDate(d);
      }
    }
  }, [currentDate]);

  const sync = (d) => {
    setDate(d);                                // локально
    setCurrentDate(d.toISOString().slice(0,10)); // в контексте
  };

  /* ─ UI состояния ─ */
  const [showCal,    setShowCal]    = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [tempYear,   setTempYear]   = useState(date.getFullYear());

  /* ─ логика стрелок ─ */
  const shiftMonth = (dir) => {
    const d = new Date(date);
    d.setDate(1);
    d.setMonth(d.getMonth() + dir);
    sync(d);
  };

  /* ─ выбор года ─ */
  const openYearPicker  = () => { setTempYear(date.getFullYear()); setShowPicker(true); };
  const closeYearPicker = () => setShowPicker(false);
  const confirmYear     = () => {
    const d = new Date(date);
    d.setDate(1);
    d.setFullYear(tempYear);
    sync(d);
    closeYearPicker();
  };

  /* ключ для «жёсткого» перерендера календаря при смене месяца */
  const calKey = date.toISOString().slice(0, 7); // YYYY-MM

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <Text style={styles.title}>
            ACCOUNTING FOR{'\n'}EATEN FRUITS AND WATER
          </Text>

          {/* текущая дата */}
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setShowCal(v => !v)}
          >
            <Text style={styles.dateLabel}>{fmt(date)}</Text>
            <Image source={ICON_CAL} style={styles.dateIcon}/>
          </TouchableOpacity>

          {/* календарь */}
          {showCal && (
            <View style={styles.calendarWrap}>
              <Calendar
                key={calKey}
                current={date.toISOString().slice(0,10)}
                onDayPress={d => sync(new Date(d.dateString))}
                firstDay={1}
                hideExtraDays={false}
                hideArrows={true}
                enableSwipeMonths={true}
                renderHeader={dateObj => {
                  const d = new Date(dateObj);
                  return (
                    <View style={styles.headRow}>
                      <View style={styles.labelBlock}>
                        <Text style={styles.monthYear}>
                          {MONTHS[d.getMonth()]} {d.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={openYearPicker} hitSlop={HIT}>
                          <Image source={ARROW_RIGHT} style={styles.yearArrow}/>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.monthBlock}>
                        <TouchableOpacity onPress={() => shiftMonth(-1)} hitSlop={HIT}>
                          <Image source={ARROW_LEFT} style={styles.monArrow}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => shiftMonth(1)}  hitSlop={HIT}>
                          <Image source={ARROW_RIGHT} style={styles.monArrow}/>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
                theme={{
                  calendarBackground:         'transparent',
                  textSectionTitleColor:      '#888',
                  monthTextColor:             '#7A0202',
                  selectedDayBackgroundColor: '#7A0202',
                  selectedDayTextColor:       '#fff',
                  todayTextColor:             '#7A0202',
                  dayTextColor:               '#000',
                  textDayHeaderFontSize:      14,
                  textMonthFontSize:          16,
                }}
                style={styles.calendar}
                markedDates={{
                  [date.toISOString().slice(0,10)]: {
                    selected: true,
                    selectedColor: '#7A0202',
                  },
                }}
              />
            </View>
          )}

          {/* выбор года */}
          {showPicker && (
            <Modal transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={tempYear}
                    onValueChange={setTempYear}
                    itemStyle={styles.itemStyle}
                  >
                    {YEARS.map(y => (
                      <Picker.Item key={y} label={String(y)} value={y}/>
                    ))}
                  </Picker>
                  <View style={styles.modalBtns}>
                    <TouchableOpacity onPress={closeYearPicker} style={styles.modalBtn}>
                      <Text style={styles.modalBtnTxt}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmYear}    style={styles.modalBtn}>
                      <Text style={styles.modalBtnTxt}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {/* переход к логам */}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => nav.navigate('FruitLog', { date: date.toISOString().slice(0,10) })}
          >
            <Text style={styles.btnTxt}>Fruit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => nav.navigate('WaterLog', { date: date.toISOString().slice(0,10) })}
          >
            <Text style={styles.btnTxt}>Water</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─ constants & styles ─ */
const HIT   = { top: 8, bottom: 8, left: 8, right: 8 };
const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  root:{ flex:1, padding:12 },
  safe:{ flex:1 },
  scrollContent:{ paddingHorizontal:18, paddingTop:30, paddingBottom:20 },

  title:{
    fontFamily:'Amagro-Bold',
    fontSize:30,
    lineHeight:32,
    color:'#fff',
    textAlign:'center',
    marginBottom:20,
  },

  dateRow:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    backgroundColor:'rgba(255,255,255,0.15)',
    borderRadius:20,
    paddingHorizontal:14,
    paddingVertical:11,
    marginBottom:12,
  },
  dateLabel:{ color:'#fff', fontFamily:'Amagro-Bold', fontSize:16 },
  dateIcon:{ width:24, height:24, tintColor:'#fff', resizeMode:'contain' },

  calendarWrap:{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:20, padding:10, marginBottom:20 },
  calendar:{ borderRadius:20 },

  headRow:{ position:'relative', flexDirection:'row', alignItems:'center', paddingHorizontal:6, marginBottom:6 },
  labelBlock:{ flexDirection:'row', alignItems:'center', paddingRight:90 },
  monthYear:{ color:'#7A0202', fontFamily:'Amagro-Bold', fontSize:18, marginRight:8 },
  yearArrow:{ width:42, height:42, tintColor:'#7A0202', resizeMode:'contain' },

  monthBlock:{ position:'absolute', right:0, flexDirection:'row', alignItems:'center' },
  monArrow:{ width:42, height:42, tintColor:'#7A0202', resizeMode:'contain', marginLeft:14 },

  btn:{ borderWidth:1, borderColor:'#fff', borderRadius:8, backgroundColor:'rgba(255,255,255,0.15)', paddingVertical:12, alignItems:'center', marginBottom:12 },
  btnTxt:{ color:'#fff', fontFamily:'Amagro-Bold', fontSize:16 },

  modalOverlay:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.45)' },
  pickerBox:{ width:WIDTH*0.85, backgroundColor:'#fff', borderRadius:16, paddingVertical:10 },
  itemStyle:{ fontSize:24, color:'#000' },

  modalBtns:{ flexDirection:'row', justifyContent:'space-between', paddingHorizontal:24, paddingVertical:12 },
  modalBtn:{ padding:8 },
  modalBtnTxt:{ color:'#B31E1E', fontSize:16, fontFamily:'Amagro-Bold' },
});
