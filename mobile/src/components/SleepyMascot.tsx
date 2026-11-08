import { useCallback, useEffect, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { MewsColors as C, MewsMono } from "./MewsDesign";

/** One decorative mascot, never a report photograph or cat identity. */
export default function SleepyMascot() {
  const [reduceMotion,setReduceMotion]=useState(true);
  const [paused,setPaused]=useState(false);
  const [focused,setFocused]=useState(false);
  const [foreground,setForeground]=useState(AppState.currentState !== "background" && AppState.currentState !== "inactive");
  const [breath]=useState(()=>new Animated.Value(0));
  useFocusEffect(useCallback(()=>{setFocused(true);return()=>setFocused(false);},[]));
  useEffect(()=>{
    let active=true;
    AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(active)setReduceMotion(value);}).catch(()=>{});
    const motion=AccessibilityInfo.addEventListener("reduceMotionChanged",setReduceMotion);
    const app=AppState.addEventListener("change",state=>setForeground(state !== "background" && state !== "inactive"));
    return()=>{active=false;motion.remove();app.remove();};
  },[]);
  useEffect(()=>{
    if(reduceMotion || paused || !focused || !foreground){breath.setValue(0);return;}
    const animation=Animated.loop(Animated.sequence([
      Animated.timing(breath,{toValue:1,duration:1700,useNativeDriver:true,isInteraction:false}),
      Animated.timing(breath,{toValue:0,duration:1900,useNativeDriver:true,isInteraction:false}),
      Animated.delay(400),
    ]));
    animation.start();return()=>animation.stop();
  },[breath,reduceMotion,paused,focused,foreground]);
  return <View style={styles.wrap}>
    <View style={styles.imageSpace}><Animated.Image source={require("../../assets/fictional-black-cat.png")} resizeMode="cover" accessible accessibilityLabel="Sleepy black cat mascot, decorative illustration" style={[styles.image,{transform:[{scaleX:breath.interpolate({inputRange:[0,1],outputRange:[1,1.035]})},{scaleY:breath.interpolate({inputRange:[0,1],outputRange:[1,1.075]})},{translateY:breath.interpolate({inputRange:[0,1],outputRange:[0,-3]})}]}]}/></View>
    {!reduceMotion && <Pressable accessibilityRole="button" accessibilityLabel={paused?"Play mascot breathing":"Pause mascot breathing"} onPress={()=>setPaused(value=>!value)} style={styles.control}><Text style={styles.label}>{paused?"PLAY":"PAUSE"}</Text></Pressable>}
  </View>;
}
const styles=StyleSheet.create({wrap:{width:106,alignItems:"center"},imageSpace:{height:94,width:100,justifyContent:"center",alignItems:"center"},image:{width:82,height:82},control:{minHeight:48,minWidth:72,alignItems:"center",justifyContent:"center"},label:{fontFamily:MewsMono,fontSize:10,color:C.muted}});
