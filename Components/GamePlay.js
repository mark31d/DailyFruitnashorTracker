/* ------------------------------------------------------------------
   Components/GamePlay.js
   • клик-клик меняем соседей + каскад
   • выбранная клетка пульсирует
   • совпавшие фрукты съезжаются к центру и исчезают
   • поле всегда содержит хотя-бы один возможный ход
   • WIN: счёт ≥ 7  → модалка «GAME OVER» (seven.png)
   • LOSE: таймер = 0 → экран «YOU SCORED … / RECORD …» на фоне splash_bg
------------------------------------------------------------------ */
import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground, Dimensions,
  TouchableOpacity, Pressable, SafeAreaView, Animated, LayoutAnimation,
  Platform, UIManager,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

/* ─── assets ──────────────────────────────────────────────────── */
const BG        = require('../assets/splash_bg.png');
const PLAY_ICON = require('../assets/play_button.png');
const COLLAGE   = require('../assets/splash_logo.png');
const CAL_ICON  = require('../assets/calendar1.png');
const SEVEN_IMG = require('../assets/seven.png');
const FRUITS = [
  require('../assets/game/apple.png'),
  require('../assets/game/kiwi.png'),
  require('../assets/game/pomegranate.png'),
  require('../assets/game/banana.png'),
  require('../assets/game/lime.png'),
  require('../assets/game/grapefruit.png'),
];

/* ─── constants ──────────────────────────────────────────────── */
const { width } = Dimensions.get('window');
const GAP = 24, BORDER = 4;
const SIZE = Math.floor((width - GAP * 2 - BORDER * 2) / 6);
const GOAL_SCORE = 7;

const rand = n => Math.floor(Math.random() * n);
const uid  = () => Date.now().toString() + Math.random();

/* ─── board helpers ──────────────────────────────────────────── */
const genBoard = () => {
    const b = Array.from({ length: 6 }, () => new Array(6));
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        let kind;
        do {
          kind = rand(FRUITS.length);
          // не даём образоваться трём в ряд по горизонтали
          if (c >= 2 &&
              b[r][c-1].kind === kind &&
              b[r][c-2].kind === kind) continue;
          // и по вертикали
          if (r >= 2 &&
              b[r-1][c].kind === kind &&
              b[r-2][c].kind === kind) continue;
          break;
        } while (true);
  
        b[r][c] = { id: uid(), kind, row: r, col: c };
      }
    }
    return b;
  };
  

const matches = board => {
  const del = new Set();
  // горизонтали
  for (let r = 0; r < 6; r++) {
    let run = 1;
    for (let c = 1; c < 6; c++) {
      if (board[r][c].kind === board[r][c - 1].kind) run++;
      else { if (run >= 3) for (let k = 1; k <= run; k++) del.add(`${r},${c - k}`); run = 1; }
    }
    if (run >= 3) for (let k = 0; k < run; k++) del.add(`${r},${5 - k}`);
  }
  // вертикали
  for (let c = 0; c < 6; c++) {
    let run = 1;
    for (let r = 1; r < 6; r++) {
      if (board[r][c].kind === board[r - 1][c].kind) run++;
      else { if (run >= 3) for (let k = 1; k <= run; k++) del.add(`${r - k},${c}`); run = 1; }
    }
    if (run >= 3) for (let k = 0; k < run; k++) del.add(`${5 - k},${c}`);
  }
  return del;
};

const hasMove = board => {
  const swapMakesMatch = (r1,c1,r2,c2) => {
    const copy = board.map(row => row.slice());
    [copy[r1][c1].kind, copy[r2][c2].kind] =
      [copy[r2][c2].kind, copy[r1][c1].kind];
    return matches(copy).size > 0;
  };
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (c < 5 && swapMakesMatch(r,c,r,c+1)) return true;
      if (r < 5 && swapMakesMatch(r,c,r+1,c)) return true;
    }
  }
  return false;
};

const ensurePlayableBoard = () => {
    let board;
    do {
      board = genBoard();
      // генерим заново пока:
      // 1) есть готовые тройки → matches(board).size > 0
      // 2) нет ни одного возможного хода → !hasMove(board)
    } while (matches(board).size > 0 || !hasMove(board));
    return board;
  };
const collapse = (b, del) => {
  if (!del.size) return b;
  const copy = b.map(r => r.slice());
  for (let c = 0; c < 6; c++) {
    const keep = [];
    for (let r = 5; r >= 0; r--) if (!del.has(`${r},${c}`)) keep.push(copy[r][c]);
    while (keep.length < 6)
      keep.push({ id: uid(), kind: rand(FRUITS.length), row: -1, col: c });
    for (let r = 5; r >= 0; r--) {
      const cell = keep[5 - r]; cell.row = r; cell.col = c;
      copy[r][c] = cell;
    }
  }
  return copy;
};

/* ─── cell component ─────────────────────────────────────────── */
const Cell = memo(({ cell, hidden, selected, onPress }) => (
  <Pressable disabled={hidden} onPress={() => onPress(cell)}
    style={[styles.cell, hidden && { opacity:0 }]}>
    <LinearGradient
      colors={selected ? ['#ffd700','#ffa500'] : ['#7a0000','#000']}
      start={{x:0,y:0}} end={{x:1,y:1}}
      style={styles.gradient}>
      <Image source={FRUITS[cell.kind]} style={styles.pic}/>
    </LinearGradient>
  </Pressable>
));

/* ─── GamePlay ───────────────────────────────────────────────── */
export default function GamePlay() {
  /* layout anim (Android) */
  useEffect(() => {
    if (Platform.OS === 'android'
        && UIManager.setLayoutAnimationEnabledExperimental)
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }, []);

  /* state */
  const [screen, setScreen] = useState('menu');           // 'menu' | 'game'
  const [board,  setBoard]  = useState(ensurePlayableBoard());
  const [time,   setTime]   = useState(60);
  const [score,  setScore]  = useState(0);
  const [record, setRecord] = useState(7);                // статический рекорд
  const [sel,    setSel]    = useState(null);
  const [hidden, setHidden] = useState(new Set());
  const [animating, setAnim] = useState(false);

  const [win,  setWin]  = useState(false);
  const [lose, setLose] = useState(false);

  /* pulse */
  const pulse = useRef(new Animated.Value(1)).current;
  const loop  = useRef(null);
  useEffect(() => {
    if (!sel) { loop.current?.stop(); pulse.setValue(1); return; }
    loop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse,{toValue:1.35,duration:300,useNativeDriver:true}),
        Animated.timing(pulse,{toValue:1.00,duration:300,useNativeDriver:true}),
      ]));
    loop.current.start(); return ()=>loop.current?.stop();
  }, [sel]);

  /* timer */
  useEffect(() => {
    if (screen !== 'game' || win || lose) return;
    const id = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [screen, win, lose]);
  useEffect(() => { if (screen==='game' && time<=0 && !lose) setLose(true); }, [time]);

  /* overlays */
  const overlays = useRef([]);

  /* selection / swap */
  const onSelect = cell => {
    if (animating || win || lose) return;
    if (!sel) { setSel(cell); return; }
    if (sel.row===cell.row && sel.col===cell.col) { setSel(null); return; }
    const dr=Math.abs(cell.row-sel.row), dc=Math.abs(cell.col-sel.col);
    if (dr+dc===1) swap(sel,cell);
    setSel(null);
  };

  const swap = (a,b) => {
    const next = board.map(r=>r.slice());
    [next[a.row][a.col], next[b.row][b.col]] = [next[b.row][b.col], next[a.row][a.col]];
    next[a.row][a.col] = { ...next[a.row][a.col], row:a.row, col:a.col };
    next[b.row][b.col] = { ...next[b.row][b.col], row:b.row, col:b.col };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBoard(next);

    const del = matches(next);
    if (!del.size) {
      setTimeout(()=>{LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setBoard(board);}, 200);
      return;
    }
    animateCollect(next,del);
  };

  const animateCollect = (cur,del) => {
    setAnim(true);
    const pts = Array.from(del).map(k => {
      const [r,c]=k.split(',').map(Number);
      return { r,c,kind:cur[r][c].kind,x:c*SIZE,y:r*SIZE };
    });
    const cx = pts.reduce((s,p)=>s+p.x,0)/pts.length;
    const cy = pts.reduce((s,p)=>s+p.y,0)/pts.length;

    setHidden(new Set(del));
    overlays.current = pts.map(p => ({
      key:`ov_${p.r},${p.c}`, kind:p.kind,
      anim:new Animated.ValueXY({x:p.x,y:p.y})
    }));

    Animated.stagger(30,
      overlays.current.map(o=>
        Animated.timing(o.anim,{toValue:{x:cx,y:cy},duration:250,useNativeDriver:true})
      )).start(()=>{
        overlays.current=[]; setHidden(new Set());

        const gained=Math.floor(del.size/3);
        const newScore=score+gained; setScore(newScore);
        let nextBoard = collapse(cur,del);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBoard(nextBoard);

        const nextDel = matches(nextBoard);
        if (nextDel.size) { animateCollect(nextBoard,nextDel); return; }

        setAnim(false);
        if (!hasMove(nextBoard)) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setBoard(ensurePlayableBoard());
        }
        if (newScore >= GOAL_SCORE && !win) setWin(true);
    });
  };

  /* helpers */
  const restart = () => {
    setBoard(ensurePlayableBoard());
    setTime(60); setScore(0); setSel(null); setHidden(new Set());
    setAnim(false); setWin(false); setLose(false); setScreen('game');
  };
  const backToMenu = () => { setScreen('menu'); setWin(false); setLose(false); };

  /* ─── MENU ─────────────────────────────────────────────────── */
  if (screen==='menu') {
    return (
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <SafeAreaView style={styles.root}>
          <Text style={styles.title}>THREE IN A ROW</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.playWrap} onPress={restart}>
            <Image source={PLAY_ICON} style={styles.playBtn}/>
          </TouchableOpacity>
          <Image source={COLLAGE} style={styles.collage} resizeMode="contain"/>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  /* ─── GAME ─────────────────────────────────────────────────── */
  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.root}>

        {/* TIMER */}
        <View style={styles.timer}>
          <Text style={styles.timerTxt}>{`00:${Math.max(time,0).toString().padStart(2,'0')}`}</Text>
        </View>

        {/* BOARD */}
        <View style={styles.grid}>
          {board.flat().map(cell=>(
            <Cell key={cell.id} cell={cell}
              hidden={hidden.has(`${cell.row},${cell.col}`)}
              selected={sel && sel.row===cell.row && sel.col===cell.col}
              onPress={onSelect}/>
          ))}
          {sel && !animating && !win && !lose && (
            <Animated.View pointerEvents="none"
              style={[styles.pulse,{left:sel.col*SIZE,top:sel.row*SIZE,transform:[{scale:pulse}]}]}/>)}
          {overlays.current.map(o=>(
            <Animated.Image key={o.key} source={FRUITS[o.kind]} pointerEvents="none"
              style={[styles.overlay,{transform:[{translateX:o.anim.x},{translateY:o.anim.y}]}]}/>
          ))}
        </View>

        {/* SCORE */}
        <View style={styles.bottom}><Image source={CAL_ICON} style={styles.cal}/><Text style={styles.score}>{score}</Text></View>
      </SafeAreaView>

      {/* WIN overlay */}
      {win && (
        <View style={styles.overRoot}>
          <View style={styles.overCard}>
            <Text style={styles.overTitle}>GAME OVER</Text>
            <Image source={SEVEN_IMG} style={styles.overSeven}/>
            <Text style={styles.overMsg}>7 COMBOS IN A ROW!{"\n"}ENERGY IS AT ITS MAXIMUM!</Text>
            <TouchableOpacity style={styles.overBtn} onPress={backToMenu}>
              <Text style={styles.overBtnTxt}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* LOSE overlay — splash_bg as background */}
      {lose && (
        <ImageBackground source={BG} style={styles.full} resizeMode="cover">
          <View style={styles.resWrapper}>
            <Text style={styles.resTitle}>YOU SCORED</Text>
            <View style={styles.circle}><Text style={styles.resScore}>{score}</Text></View>
            <Text style={styles.recordTxt}>{`RECORD ${record}`}</Text>

            <TouchableOpacity activeOpacity={0.9} onPress={restart}>
              <LinearGradient colors={['#7a0000','#d90000']} start={{x:0,y:0}} end={{x:1,y:0}}
                style={styles.tryBtn}><Text style={styles.tryTxt}>TRY AGAIN</Text></LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.leaveBtn} onPress={backToMenu}>
              <Text style={styles.leaveTxt}>LEAVE</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )}
    </ImageBackground>
  );
}

/* ─── styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  bg:{flex:1},
  root:{flex:1,alignItems:'center',justifyContent:'center'},

  title:{fontFamily:'Amagro-Bold',fontSize:28,color:'#fff',marginTop:60},
  playWrap:{marginVertical:40},
  playBtn:{width:width*0.4,height:width*0.4},
  collage:{width:width*0.8,height:width*0.5,marginBottom:80},

  timer:{position:'absolute',top:60,width:280,height:56,borderRadius:28,
         backgroundColor:'rgba(255,255,255,0.25)',justifyContent:'center',alignItems:'center'},
  timerTxt:{fontFamily:'Amagro-Bold',fontSize:30,color:'#fff'},

  grid:{marginVertical:32,width:SIZE*6+BORDER*2,height:SIZE*6+BORDER*2,
        flexDirection:'row',flexWrap:'wrap',borderWidth:BORDER,borderColor:'#fff',
        borderRadius:16,overflow:'hidden'},
  cell:{width:SIZE,height:SIZE,justifyContent:'center',alignItems:'center'},
  gradient:{width:SIZE,height:SIZE,justifyContent:'center',alignItems:'center',borderRadius:4},
  pic:{width:SIZE*0.8,height:SIZE*0.8,resizeMode:'contain'},

  pulse:{position:'absolute',width:SIZE,height:SIZE,borderRadius:4,
         borderWidth:3,borderColor:'#ffd700',backgroundColor:'rgba(255,215,0,0.25)',zIndex:99},
  overlay:{position:'absolute',width:SIZE*0.8,height:SIZE*0.8,left:0,top:0,zIndex:98},

  bottom:{flexDirection:'row',alignItems:'center',marginTop:24},
  cal:{width:34,height:34,marginRight:8},
  score:{fontFamily:'Amagro-Bold',fontSize:28,color:'#fff'},

  /* WIN overlay */
  overRoot:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.6)',
            justifyContent:'center',alignItems:'center',zIndex:120},
  overCard:{width:width*0.8,padding:24,borderRadius:20,borderWidth:2,borderColor:'#fff',
            backgroundColor:'rgba(0,0,0,0.85)',alignItems:'center'},
  overTitle:{fontFamily:'Amagro-Bold',fontSize:32,color:'#fff',marginBottom:8},
  overSeven:{width:width*0.28,height:width*0.28,resizeMode:'contain',marginVertical:12},
  overMsg:{fontFamily:'Amagro-Bold',fontSize:16,color:'#fff',textAlign:'center',marginBottom:16},
  overBtn:{paddingHorizontal:32,paddingVertical:10,borderRadius:14,backgroundColor:'#fff'},
  overBtnTxt:{fontFamily:'Amagro-Bold',fontSize:18,color:'#000'},

  /* LOSE overlay */
  full:{...StyleSheet.absoluteFillObject,justifyContent:'center',alignItems:'center',zIndex:120},
  resWrapper:{width:'100%',alignItems:'center',paddingHorizontal:28},
  resTitle:{fontFamily:'Amagro-Bold',fontSize:28,color:'#fff',marginBottom:24},
  circle:{width:150,height:150,borderRadius:75,backgroundColor:'#ececec',justifyContent:'center',alignItems:'center',marginBottom:24},
  resScore:{fontFamily:'Amagro-Bold',fontSize:64,color:'#7a0000'},
  recordTxt:{fontFamily:'Amagro-Bold',fontSize:22,color:'#fff',marginBottom:60},

 
  tryBtn:{width:width-56,paddingVertical:14,borderRadius:30,marginBottom:20,alignItems:'center' , height:80,},
  tryTxt:{fontFamily:'Amagro-Bold',fontSize:20,color:'#fff'},

  leaveBtn:{width:width-56,paddingVertical:14,borderRadius:28,
            backgroundColor:'rgba(255,255,255,0.35)',alignItems:'center'},
  leaveTxt:{fontFamily:'Amagro-Bold',fontSize:20,color:'#fff'},
});
