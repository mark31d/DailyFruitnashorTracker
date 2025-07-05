/* ------------------------------------------------------------------
   Components/StatsScreen.js  ·  v10 — water dynamic thresholds + wider bars
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

/* ── агрегируем данные ───────────────────────────────────────── */
function collect(days, period, mode, date) {
  const isFruit = mode === 'Fruit';

  if (period === 'Day') {
    const rec     = days[toISO(date)] ?? { fruitLog: [], water: [] };
    const counter = {};

    if (isFruit && rec.fruitLog) {
      rec.fruitLog.forEach(({ ts }) => {
        const h = new Date(ts).getHours();
        counter[h] = (counter[h] || 0) + 1;
      });
    } else if (!isFruit) {
      rec.water
        .filter(w => w.drink === 'Water')
        .forEach(w => {
          const h = new Date(w.ts).getHours();
          counter[h] = (counter[h] || 0) + w.ml;
        });
    }

    if (!Object.keys(counter).length) {
      return {
        labels: ['12 AM','4 AM','8 AM','12 PM','4 PM','8 PM'],
        values: Array(6).fill(0),
      };
    }

    const hrs = Object.keys(counter).map(Number).sort((a, b) => a - b);
    return {
      labels: hrs.map(hourLabel),
      values: hrs.map(h => counter[h]),
    };
  }

  if (period === 'Week') {
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const values = labels.map((_, i) => {
      const d   = new Date(monday);
      d.setDate(monday.getDate() + i);
      const rec = days[toISO(d)] ?? { fruit: {}, water: [] };
      return isFruit
        ? Object.values(rec.fruit).reduce((s, v) => s + v, 0)
        : rec.water.filter(w => w.drink === 'Water').reduce((s, w) => s + w.ml, 0);
    });
    return { labels, values };
  }

  // Month
  const y = date.getFullYear(), m = date.getMonth();
  const chunks = [[1,8],[9,15],[16,22],[23,31]];
  const labels = chunks.map(([a, b]) => `${a}–${b}`);
  const values = chunks.map(([a, b]) => {
    let sum = 0;
    for (let d = a; d <= b; d++) {
      const key = `${y}-${pad(m + 1)}-${pad(d)}`;
      const rec = days[key] ?? { fruit: {}, water: [] };
      sum += isFruit
        ? Object.values(rec.fruit).reduce((s, v) => s + v, 0)
        : rec.water.filter(w => w.drink === 'Water').reduce((s, w) => s + w.ml, 0);
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
  const nav                   = useNavigation();
  const { params = {} }       = useRoute();
  const period                = params.period ?? 'Day';
  const [mode, setMode]       = useState('Fruit');

  const { days, currentDate } = useTracker();
  const refDate               = currentDate ? new Date(currentDate) : new Date();

  // получаем метки и сырые значения
  const { labels, values } = useMemo(
    () => collect(days, period, mode, refDate),
    [days, period, mode, refDate],
  );

  // thresholds для воды: daily 200/500/1000, weekly *7, monthly *chunkLength
  const waterThresholds = useMemo(() => {
    if (mode !== 'Water') return [];
    if (period === 'Day') {
      return values.map(() => ({ r:200, y:500, g:1000 }));
    }
    if (period === 'Week') {
      const f = 7;
      return values.map(() => ({ r:200*f, y:500*f, g:1000*f }));
    }
    // Month: chunk lengths [8,7,7,9]
    const chunkSizes = [8,7,7,9];
    return chunkSizes.map(size => ({
      r: 200 * size,
      y: 500 * size,
      g:1000 * size,
    }));
  }, [mode, period, values]);

  // ширина столбцов
  const barPercentage = 0.7;

  // цвета по порогам: для фруктов — <=1 красный, <=3 жёлтый, иначе зелёный;
  // для воды — по динамическим thresholds
  const barColors = values.map((v, i) => {
    if (v === 0) return 'rgba(255,255,255,0.08)';

    if (mode === 'Water') {
      const { r, y } = waterThresholds[i];
      if (v <= r) return CLR_RED;
      if (v <= y) return CLR_YELLOW;
      return CLR_GREEN;
    }

    // Fruit
    if (v <= 1) return CLR_RED;
    if (v <= 3) return CLR_YELLOW;
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
          data={{
            labels,
            datasets: [{
              data: values,
              colors: barColors.map(c => () => c),
            }],
          }}
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
            color: () => '#fff',
            labelColor: () => '#fff',
            propsForBackgroundLines: { strokeWidth: 0 },
          }}
          style={[styles.chart, { backgroundColor: 'transparent' }]}
          showValuesOnTopOfBars
        />

        <Text style={styles.note}>
          {mode==='Fruit'
            ? 'Pieces of fruit per chosen period'
            : 'Millilitres of pure water'}
        </Text>

        <View style={styles.legendBox}>
          <Text style={styles.legendTitle}>Color scale:</Text>
          <Text style={[styles.legendLine,{color:CLR_GREEN}]}>
            Green is the norm
          </Text>
          <Text style={[styles.legendLine,{color:CLR_YELLOW}]}>
            Yellow is as good as possible
          </Text>
          <Text style={[styles.legendLine,{color:CLR_RED}]}>
            Red is urgent
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ── styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root:      { flex: 1 },
  safe:      { flex: 1, paddingHorizontal: 18 },
  backBtn:   { marginTop: 10, padding: 6 },
  backImg:   { width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain' },

  title: {
    fontFamily: 'Amagro-Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },

  tabs:      { flexDirection: 'row', marginBottom: 12, alignSelf: 'center' },
  tab:       {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
  },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  tabTxt:    {
    fontFamily: 'Actay-Regular',
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },

  chart:     { marginVertical: 8 },

  note: {
    marginTop: 12,
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Actay-Regular',
  },

  legendBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  legendTitle: {
    fontFamily: 'Actay-Regular',
    fontSize: 16,
    color: '#fff',
    marginBottom: 6,
  },
  legendLine: {
    fontFamily: 'Actay-Regular',
    fontSize: 15,
    lineHeight: 20,
  },
});
