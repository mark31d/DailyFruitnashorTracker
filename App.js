// App.js
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { createStackNavigator }     from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider }         from 'react-native-safe-area-context';

// компоненты
import Loader        from './Components/Loader';
import CustomTabs    from './Components/CustomTabBar';

import FruitMenu     from './Components/FruitMenu';
import TrackerHome   from './Components/TrackerHome';
import StatsPicker   from './Components/StatsPicker';
import SmoothieIdeas from './Components/SmoothieIdeas';
import SettingsMenu  from './Components/SettingsMenu';

import FruitDetails  from './Components/FruitDetails';
import VitaminSeven  from './Components/VitaminSeven';
import FruitLog      from './Components/FruitLog';
import WaterLog      from './Components/WaterLog';
import StatsScreen   from './Components/StatsScreen';
import GamePlay      from './Components/GamePlay';

import SmoothieFavs  from './Components/SmoothieFavs';
import SmoothieCard  from './Components/SmoothieCard';
import DailyGoal     from './Components/DailyGoal';
import InfoScreen    from './Components/InfoScreen';
import { TriedProvider } from './Components/TriedContext';
import DataProvider from './Components/DataProvider';
import { FavoritesProvider } from './Components/FavoritesContext';
const RootStack = createStackNavigator();
const Tab       = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabs {...props} />}
    >
      <Tab.Screen name="Fruits"   component={FruitMenu} />
      <Tab.Screen name="Tracker"  component={TrackerHome} />
      <Tab.Screen name="Stats"    component={StatsPicker} />
      <Tab.Screen name="GamePlay" component={GamePlay} />

      <Tab.Screen name="Smoothie" component={SmoothieIdeas} />
      <Tab.Screen name="Settings" component={SettingsMenu} />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000',
    card:       '#000',
  },
};

export default function App() {
  const [booted, setBooted] = useState(false);

  // через 3.3с переключаемся с Loader на основное приложение
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 3300);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
       <TriedProvider>
       <DataProvider>
       <FavoritesProvider>
      <NavigationContainer theme={navTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!booted ? (
            // пока не booted — показываем Loader
            <RootStack.Screen
              name="Loader"
              children={() => <Loader onDone={() => setBooted(true)} />}
            />
          ) : (
            // после booted — основной стек
            <>
              <RootStack.Screen name="MainTabs"     component={MainTabs} />
              <RootStack.Screen name="FruitDetails" component={FruitDetails} />
              <RootStack.Screen name="VitaminSeven" component={VitaminSeven} />
              <RootStack.Screen name="FruitLog"     component={FruitLog} />
              <RootStack.Screen name="WaterLog"     component={WaterLog} />
              <RootStack.Screen name="StatsScreen"  component={StatsScreen} />
              <RootStack.Screen name="GamePlay"     component={GamePlay} />
 
              <RootStack.Screen name="SmoothieFavs" component={SmoothieFavs} />
              <RootStack.Screen name="SmoothieCard" component={SmoothieCard} />
              <RootStack.Screen name="DailyGoal"    component={DailyGoal} />
              <RootStack.Screen name="InfoScreen"   component={InfoScreen} />
            </>
          )}
        </RootStack.Navigator>
        
      </NavigationContainer>
      </FavoritesProvider>
      </DataProvider>
      </TriedProvider>
    </SafeAreaProvider>
  );
}
