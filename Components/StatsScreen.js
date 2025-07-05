/* ------------------------------------------------------------------
   Components/StatsScreen.js  ·  v14 — fix “undefined” mostFreq & achievements
------------------------------------------------------------------ */
import React, { useState, useMemo } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTracker } from './DataProvider';

const BG   = require('../assets/background.png');
const BACK = require('../assets/back.png');
const { width } = Dimensions.get('window');
const CHART_W   = width - 48;
const CHART_H   = 260;

/* ── helpers ─────────────────────────────────────────────────── */
const toISO     = d => d.toISOString().slice(0, 10);
const pad       = n => n.toString().padStart(2, '0');
const hourLabel = h => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;

/* ── aggregate data ───────────────────────────────────────────── */
function collect(days, period, mode, date) {
  const isFruit = mode === 'Fruit';

  if (period === 'Day') {
    const rec     = days[toISO(date)] ?? { fruitLog: [], water: [] };
    const entries = isFruit
      ? (rec.fruitLog || [])
      : rec.water.filter(w => w.drink === 'Water');

    if (!entries.length) {
      const nowH = date.getHours();
      const minH = Math.max(0, nowH - 2);
      const maxH = Math.min(23, nowH + 2);
      const hrs  = [];
      for (let h = minH; h <= maxH; h++) hrs.push(h);
      return {
        labels: hrs.map(hourLabel),
        values: hrs.map(() => 0),
      };
    }

    const sorted    = entries.slice().sort((a, b) => new Date(a.ts) - new Date(b.ts));
    const bucketHrs = [];
    const counts    = {};
    let lastHour    = null;

    sorted.forEach(item => {
      const hr = new Date(item.ts).getHours();
      if (lastHour === null || hr - lastHour >= 1) {
        bucketHrs.push(hr);
        lastHour = hr;
      }
      counts[hr] = (counts[hr] || 0) + (isFruit ? 1 : item.ml);
    });

    let minH = bucketHrs[0] - 2;
    let maxH = bucketHrs[bucketHrs.length - 1] + 2;
    minH = Math.max(0, minH);
    maxH = Math.min(23, maxH);

    const hrs = [];
    for (let h = minH; h <= maxH; h++) hrs.push(h);

    return {
      labels: hrs.map(hourLabel),
      values: hrs.map(h => counts[h] || 0),
    };
  }

  // Week
  if (period === 'Week') {
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const values = labels.map((_, i) => {
      const d   = new Date(monday);
      d.setDate(monday.getDate() + i);
      const rec = days[toISO(d)] ?? { fruit: {}, water: [] };
      return mode === 'Fruit'
        ? Object.values(rec.fruit).reduce((s,v)=>s+v,0)
        : rec.water.filter(w=>w.drink==='Water').reduce((s,w)=>s+w.ml,0);
    });
    return { labels, values };
  }

  // Month
  const y = date.getFullYear(), m = date.getMonth();
  const chunks = [[1,8],[9,15],[16,22],[23,31]];
  const labels = chunks.map(([a,b])=>`${a}–${b}`);
  const values = chunks.map(([a,b])=>{
    let sum = 0;
    for (let d = a; d <= b; d++){
      const key = `${y}-${pad(m+1)}-${pad(d)}`;
      const rec = days[key] ?? { fruit: {}, water: [] };
      sum += mode === 'Fruit'
        ? Object.values(rec.fruit).reduce((s,v)=>s+v,0)
        : rec.water.filter(w=>w.drink==='Water').reduce((s,w)=>s+w.ml,0);
    }
    return sum;
  });
  return { labels, values };
}

/* ── palette ─────────────────────────────────────────────────── */
const CLR_RED    = '#FF0000';
const CLR_YELLOW = '#FFF600';
const CLR_GREEN  = '#32DC46';

/* ── component ───────────────────────────────────────────────── */
export default function StatsScreen() {
  const nav             = useNavigation();
  const { params = {} } = useRoute();
  const period          = params.period ?? 'Day';
  const [mode, setMode] = useState('Fruit');

  const { days, currentDate } = useTracker();
  const refDate               = currentDate ? new Date(currentDate) : new Date();

  // chart data
  const { labels, values } = useMemo(
    () => collect(days, period, mode, refDate),
    [days, period, mode, refDate],
  );

  /* ── compute mostFreq & achievements ──────────────────────── */
  let mostFreq = '—';
  let achievements = '';
  if (mode === 'Fruit') {
    const todayLog = days[toISO(refDate)]?.fruitLog ?? [];
    // count occurrences by id
    const counts = todayLog.reduce((acc, { id }) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    if (sorted.length) {
      mostFreq = sorted[0][0];
      // longest streak
      let maxStreak = 1, curStreak = 1, streakFruit = todayLog[0]?.id || '';
      for (let i = 1; i < todayLog.length; i++) {
        if (todayLog[i].id === todayLog[i-1].id) {
          curStreak++;
        } else {
          curStreak = 1;
        }
        if (curStreak > maxStreak) {
          maxStreak = curStreak;
          streakFruit = todayLog[i].id;
        }
      }
      achievements = `${maxStreak} ${streakFruit}${maxStreak>1?'s':''} in a row`;
    }
  }

  // bar appearance
  const barPercentage = 0.7;
  const barColors = values.map(v => {
    if (v === 0) return 'rgba(255,255,255,0.08)';
    if (v <= (mode==='Fruit'?1:100)) return CLR_RED;
    if (v <= (mode==='Fruit'?3:500)) return CLR_YELLOW;
    return CLR_GREEN;
  });

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={nav.goBack} style={styles.backBtn}>
          <Image source={BACK} style={styles.backImg}/>
        </TouchableOpacity>

        <Text style={styles.title}>{period.toUpperCase()}</Text>

        <View style={styles.tabs}>
          {['Fruit','Water'].map((t,i)=>(
            <TouchableOpacity
              key={t}
              style={[styles.tab, i&&{marginLeft:12}, mode===t&&styles.tabActive]}
              onPress={()=>setMode(t)}
            >
              <Text style={styles.tabTxt}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <BarChart
          data={{ labels, datasets:[{ data: values, colors: barColors.map(c=>()=>c) }] }}
          withCustomBarColorFromData
          flatColor
          width={CHART_W}
          height={CHART_H}
          fromZero
          withInnerLines={false}
          withHorizontalLabels={false}
          chartConfig={{
            backgroundGradientFrom: '#00000000',
            backgroundGradientTo:   '#00000000',
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity:   0,
            decimalPlaces: 0,
            barPercentage,
            barRadius: 6,
            color: ()=>'#fff',
            labelColor: ()=>'#fff',
            propsForBackgroundLines:{ strokeWidth:0 },
          }}
          style={[styles.chart,{ backgroundColor:'transparent' }]}
          showValuesOnTopOfBars
        />

        <Text style={styles.note}>
          {mode==='Fruit'
            ? 'Pieces of fruit per chosen period'
            : 'Millilitres of pure water'}
        </Text>

        {mode==='Fruit' && (
          <View style={styles.statsBlock}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>The most frequent fruit:</Text>
              <Text style={styles.statValue}>{mostFreq}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Achievements:</Text>
              <Text style={styles.statValue}>{achievements}</Text>
            </View>
          </View>
        )}

        <View style={styles.legendBox}>
          <Text style={styles.legendTitle}>Color scale:</Text>
          <Text style={[styles.legendLine,{color:CLR_GREEN}]}>Green is the norm</Text>
          <Text style={[styles.legendLine,{color:CLR_YELLOW}]}>Yellow is as good as possible</Text>
          <Text style={[styles.legendLine,{color:CLR_RED}]}>Red is urgent</Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 , padding:10,},
  safe:        { flex: 1, paddingHorizontal: 18 },
  backBtn:     { marginTop: 10, padding: 6 },
  backImg:     { width: 24, height: 24, tintColor:'#fff', resizeMode:'contain' },

  title: {
    fontFamily: 'Amagro-Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },

  tabs:      { flexDirection:'row', marginBottom:12, alignSelf:'center' },
  tab:       {
    flex:1,
    paddingVertical:6,
    borderWidth:1,
    borderColor:'rgba(255,255,255,0.4)',
    borderRadius:4,
  },
  tabActive:{ backgroundColor:'rgba(255,255,255,0.12)' },
  tabTxt:   {
    fontFamily:'Actay-Regular',
    fontSize:18,
    color:'#fff',
    textAlign:'center',
  },

  chart:     { marginVertical: 8 },

  note: {
    marginTop:12,
    color:'#fff',
    fontSize:15,
    textAlign:'center',
    fontFamily:'Actay-Regular',
  },

  statsBlock: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statLabel: {
    flex: 1,
    fontFamily: 'Actay-Regular',
    fontSize: 16,
    color: '#fff',
  },
  statValue: {
    fontFamily: 'Actay-Regular',
    fontSize: 20,
    color: '#fff',
  },

  legendBox: {
    marginTop:18,
    padding:14,
    borderRadius:20,
    backgroundColor:'rgba(255,255,255,0.08)',
  },
  legendTitle: {
    fontFamily:'Actay-Regular',
    fontSize:16,
    color:'#fff',
    marginBottom:6,
  },
  legendLine: {
    fontFamily:'Actay-Regular',
    fontSize:15,
    lineHeight:20,
  },
});
