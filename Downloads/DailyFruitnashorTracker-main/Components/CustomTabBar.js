// Components/CustomTabBar.js

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

const { width } = Dimensions.get('window');

const BAR_H        = 64;
const BORDER_W     =2;
const PILL_WIDTH   = width - 24;
const RADIUS_FULL  = (BAR_H + BORDER_W * 2) / 2;
const RADIUS_INNER = BAR_H / 2;

// Обычные иконки
const ICONS = {
  Fruits:   require('../assets/book.png'),
  Tracker:  require('../assets/calculator.png'),
  Stats:    require('../assets/chart.png'),
  GamePlay: require('../assets/game.png'),
  Smoothie: require('../assets/idea.png'),
  Settings: require('../assets/gear.png'),
};

// Активные иконки (_active.png)
const ICONS_ACTIVE = {
  Fruits:   require('../assets/book_active.png'),
  Tracker:  require('../assets/calculator_active.png'),
  Stats:    require('../assets/chart_active.png'),
  GamePlay: require('../assets/game_active.png'),
  Smoothie: require('../assets/idea_active.png'),
  Settings: require('../assets/gear_a.png'),
};

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + 8 }]}>
      {/* Градиентная капсула */}
      <Svg
        width={PILL_WIDTH}
        height={BAR_H + BORDER_W * 2}
        style={styles.svgCapsule}
      >
        <Defs>
          {/* Горизонтальный градиент обводки */}
          <SvgLinearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#D5D5D5" stopOpacity="0" />
          </SvgLinearGradient>
          {/* Радиальный градиент фона */}
          <RadialGradient id="pillGrad" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <Stop offset="0%"   stopColor="#1E1E1E" />
            <Stop offset="100%" stopColor="#8B0000" />
          </RadialGradient>
        </Defs>
        {/* Рамка-капсула */}
        <Rect
          x={0}
          y={0}
          width={PILL_WIDTH}
          height={BAR_H + BORDER_W * 2}
          rx={RADIUS_FULL}
          fill="none"
          stroke="url(#borderGrad)"
          strokeWidth={BORDER_W}
        />
        {/* Внутренняя заливка */}
        <Rect
          x={BORDER_W}
          y={BORDER_W}
          width={PILL_WIDTH - BORDER_W * 2}
          height={BAR_H}
          rx={RADIUS_INNER}
          fill="url(#pillGrad)"
        />
      </Svg>

      {/* Иконки */}
      <View style={styles.iconsRow}>
        {state.routes.map((route, i) => {
          if (!ICONS[route.name]) return null;
          const focused = i === state.index;
          const src = focused
            ? ICONS_ACTIVE[route.name]
            : ICONS[route.name];
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.btn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(route.name)}
            >
              <Image
                source={src}
                style={[
                  styles.icon,
                  focused && styles.iconActive,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position:   'absolute',
    left:       0,
    right:      0,
    bottom:     0,
    alignItems: 'center',
  },
  svgCapsule: {
    overflow: 'visible',
  },
  iconsRow: {
    position:      'absolute',
    left:          15,
    top:           BORDER_W,
    width:         PILL_WIDTH - BORDER_W * 2,
    height:        BAR_H,
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'space-around',

  },
  btn: {
    paddingHorizontal: 12,
  },
  icon: {
    width:       28,
    height:      28,
    resizeMode: 'contain',
  },
  iconActive: {
    transform: [{ scale: 1.7 }],  // активная иконка растёт внутри той же 28×28 области
  },
});
