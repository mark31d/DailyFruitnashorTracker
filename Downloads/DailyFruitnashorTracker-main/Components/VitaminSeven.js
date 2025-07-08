// Components/VitaminSeven.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BG   = require('../assets/background.png');
const BACK = require('../assets/back.png');



const VITAMINS = [
    {
      id:   'vitaminD',
      name: 'VITAMIN D ("SUN VITAMIN")',
      fields: [
        {
          label: 'Short description:',
          value: 'Important for bone health, immunity, and mood.',
        },
        {
          label: 'Why is it needed?:',
          value:
            'Strengthens bones, regulates calcium and phosphorus levels, supports the immune system, improves mood.',
        },
        {
          label: 'Signs of deficiency:',
          value:
            'Fatigue, weakness, bone pain, frequent infections, depression.',
        },
        {
          label: 'Where to look?:',
          value:
            'Sunlight (15–20 min/day depending on skin color and season), oily fish (salmon, tuna, mackerel), egg yolk.',
        },
      ],
    },
    {
      id:   'vitaminC',
      name: 'VITAMIN C ("IMMUNE BOOSTER")',
      fields: [
        {
          label: 'Short description:',
          value:
            'A powerful antioxidant that supports the immune system and skin health.',
        },
        {
          label: 'Why is it needed?:',
          value:
            'Strengthens the immune system, protects cells from damage, promotes collagen production, improves iron absorption.',
        },
        {
          label: 'Signs of deficiency:',
          value:
            'Frequent colds, bleeding gums, slow wound healing, fatigue, dry skin.',
        },
        {
          label: 'Where to look?:',
          value:
            'Citrus fruits (oranges, lemons, grapefruits), berries (strawberries, blueberries, raspberries), peppers, broccoli, kiwi.',
        },
      ],
    },
    {
      id:   'vitaminB12',
      name: 'VITAMIN B12 ("ENERGY AND NERVES")',
      fields: [
        {
          label: 'Short description:',
          value:
            'Essential for the health of the nervous system, blood production and energy.',
        },
        {
          label: 'Why is it needed?:',
          value:
            'Supports the nervous system, participates in the formation of red blood cells, helps to absorb energy from food.',
        },
        {
          label: 'Signs of deficiency:',
          value:
            'Fatigue, weakness, numbness in the extremities, memory problems, anemia.',
        },
        {
          label: 'Where to look?:',
          value:
            'Animal products (meat, fish, poultry, eggs, dairy), fortified foods (vegetable milk, cereals).',
        },
      ],
    },
    {
      id:   'vitaminA',
      name: 'VITAMIN A ("VISION AND SKIN")',
      fields: [
        {
          label: 'Short description:',
          value:
            'Important for vision, skin health and immunity.',
        },
        {
          label: 'Why is it needed?:',
          value:
            'Improves vision in low light, supports healthy skin and mucous membranes, strengthens immunity.',
        },
        {
          label: 'Signs of deficiency:',
          value:
            'Dry eyes, night blindness, dry skin, frequent infections.',
        },
        {
          label: 'Where to look?:',
          value:
            'Retinol: liver, fish oil, egg yolk, dairy; Carotenoids: carrots, pumpkin, sweet potatoes, spinach, kale.',
        },
      ],
    },
    {
      id:   'vitaminE',
      name: 'VITAMIN E ("CELL PROTECTOR")',
      fields: [
        {
          label: 'Short description:',
          value:
            'A powerful antioxidant that protects cells from damage.',
        },
        {
          label: 'Why is it needed?:',
          value:
            'Protects cells from free radicals, supports heart and vessel health, slows aging.',
        },
        {
          label: 'Signs of deficiency:',
          value:
            'Muscle weakness, vision problems, decreased immunity (rare).',
        },
        {
          label: 'Where to look?:',
          value:
            'Vegetable oils (sunflower, olive, almond), nuts & seeds, green leafy vegetables, avocado.',
        },
      ],
    },
    {
      id:   'vitaminK2',
      name: 'VITAMIN K2 ("STRONG BONES & HEALTHY HEART")',
      fields: [
        {
          label: 'Short description:',
          value:
            'Important for bone health and proper blood clotting.',
        },
        {
          label: 'Why is it needed?:',
          value:
            'Directs calcium into bones, prevents calcification of soft tissues, supports clotting.',
        },
        {
          label: 'Signs of deficiency:',
          value:
            'Mild bleeding, bone issues (rare).',
        },
        {
          label: 'Where to look?:',
          value:
            'Natto (fermented soybeans), hard cheeses, egg yolk, liver.',
        },
      ],
    },
    {
      id:   'vitaminB9',
      name: 'VITAMIN B9 (FOLIC ACID) "FOR EXPECTANT MOTHERS"',
      fields: [
        {
          label: 'Short description:',
          value:
            'Crucial during pregnancy for fetal development.',
        },
        {
          label: 'Why is it needed?:',
          value:
            'Supports fetal neural tube formation, blood cell production, cell growth & division.',
        },
        {
          label: 'Signs of deficiency:',
          value:
            'Anemia, fatigue, weakness, digestive problems.',
        },
        {
          label: 'Where to look?:',
          value:
            'Leafy greens, legumes, citrus fruits, avocados, fortified cereals & bread.',
        },
      ],
    },
  ];

export default function VitaminSeven() {
  const nav = useNavigation();

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            {/* Заголовок по центру */}
            <Text style={styles.heading}>
              THE VITAMIN{'\n'}SEVEN
            </Text>

            {/* Кнопка «назад», абсолютное позиционирование */}
            <TouchableOpacity
              onPress={() => nav.goBack()}
              style={styles.backBtn}
            >
              <Image source={BACK} style={styles.backImg} />
            </TouchableOpacity>
          </View>

          {/* Вводный текст */}
          <Text style={styles.intro}>
            "Your body needs vitamins every day! We have compiled a list of
            the 7 most necessary things to keep every cell healthy and happy.
            Tips on selection, dosage and compatibility inside!"
          </Text>

          {/* Список витаминов */}
          {VITAMINS.map(vit => (
            <View key={vit.id} style={styles.vitBlock}>
              <Text style={styles.vitName}>{vit.name}</Text>
              {vit.fields.map((field, i) => (
                <View key={i} style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>{field.value}</Text>
                </View>
              ))}
            </View>
          ))}

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: '#611',
  },
  safe: {
    flex: 1,marginTop:60,
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical:   16,
    paddingBottom:     80,
  },

  /* Header */
  header: {
    justifyContent: 'center',     // центрируем контент по вертикали
    alignItems:     'center',     // центрируем заголовок по горизонтали
    marginBottom:   24,
    position:       'relative',   // чтобы вложенный backBtn с absolute работал
  },

  heading: {
    fontFamily: 'Amagro-Bold',
    fontSize:   28,
    color:      '#fff',
    textAlign:  'center',
    lineHeight: 34,
  },

  backBtn: {
    position:   'absolute',
    left:       18,
    top:        '50%',
    marginTop: -14,               // половина высоты backImg (28px) для точной центровки
    padding:    4,                // чуть большая зона касания
  },
  backImg: {
    width:     40,
    height:     40,
    tintColor:  '#fff',
    resizeMode: 'contain',
    marginTop:-25,
    left:-20,
  },

  /* Intro */
  intro: {
    color:        '#fff',
    fontSize:     14,
    lineHeight:   20,
    textAlign:    'center',
    marginBottom: 24,
  },

  /* Vitamin blocks */
  vitBlock: {
    marginBottom: 32,
  },
  vitName: {
    fontFamily:   'Amagro-Bold',
    fontSize:     20,
    color:        '#fff',
    marginBottom: 12,
  },

  /* Field rows */
  fieldRow: {
    flexDirection: 'row',
    marginBottom:  14,
  },
  fieldLabel: {
    fontFamily: 'Amagro-Bold',
    color:      '#fff',
    fontSize:   14,
    width:      140,
  },
  fieldValue: {
    flex:       1,
    color:      '#fff',
    fontSize:   14,
    lineHeight: 20,
  },
});



