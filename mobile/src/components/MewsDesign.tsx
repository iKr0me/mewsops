import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
export const MewsColors = { cream: "#F9F6EC", paper: "#FFFCF4", ink: "#1F1D1A", ginger: "#E9A15D", orange: "#A74C23", muted: "#6E6256", line: "#DED7C7" };
export const MewsMono = Platform.select({ android: "monospace", ios: "Menlo", default: "monospace" });
const C = MewsColors;
export function useMewsFont() {
  const [fontsLoaded, fontError] = useFonts({ VT323_400Regular });
  return { fontsLoaded, fontError, display: { fontFamily: fontsLoaded ? "VT323_400Regular" : MewsMono } };
}
export const navigation = [
  { label: "TODAY", path: "/", icon: "home" },
  { label: "COLONIES", path: "/colonies", icon: "map" },
  { label: "REPORT", path: "/update", icon: "plus" },
  { label: "NEEDS", path: "/tasks", icon: "needs" },
  { label: "CATS", path: "/cats", icon: "cat" },
] as const;
export type IconName = typeof navigation[number]["icon"] | "care";
const glyphs: Record<IconName, string[]> = {
  care: ["0001000", "0011100", "0011100", "0111110", "0110110", "1111111", "1110111"],
  home: ["0001000", "0011100", "0110110", "1100011", "0100010", "0101010", "0111110"],
  map: ["1100011", "1011101", "1010101", "1010101", "1010101", "1011101", "1100011"],
  plus: ["0001000", "0001000", "0001000", "1111111", "0001000", "0001000", "0001000"],
  needs: ["1111111", "1000001", "1011101", "1000001", "1011101", "1000001", "1111111"],
  cat: ["1100011", "1110111", "1000001", "1010101", "1000001", "0101010", "0011100"],
};
export function PixelIcon({ name, size = 21 }: { name: IconName; size?: number }) {
  const unit = size / 7;
  return <View style={{ width: size, height: size }} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {glyphs[name].flatMap((row, y) => row.split("").map((cell, x) => cell === "1" ? <View key={`${x}-${y}`} style={{ position: "absolute", left: x * unit, top: y * unit, width: unit, height: unit, backgroundColor: C.ink }} /> : null))}
  </View>;
}

export type MewsRoute = typeof navigation[number]["path"];
export function MewsHeader() {
  const { display } = useMewsFont();
  return <View style={styles.header}>
    <Pressable accessibilityRole="button" accessibilityLabel="Mangrove Mews welcome" onPress={() => router.push("/welcome")} style={styles.brand}><PixelIcon name="cat" size={30} /><Text style={[styles.brandName, display]}>MEWS</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="About Mangrove Mews" onPress={() => router.push("/about")} style={({pressed}) => [styles.menu, pressed && styles.pressed]}><Text style={styles.menuLabel}>ABOUT</Text><View style={styles.menuSquare}><View style={styles.menuLine}/><View style={styles.menuLine}/><View style={styles.menuLine}/></View></Pressable>
  </View>;
}
export function MewsBottomNav({ active }: { active?: MewsRoute }) {
  return <View style={styles.bottomBar}><View style={styles.nav}>{navigation.map(item => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{selected:active===item.path}} onPress={() => { if (item.path !== active) router.navigate(item.path); }} style={({pressed}) => [styles.navItem, active===item.path && styles.navSelected, pressed && styles.pressed]}><PixelIcon name={item.icon}/><Text style={styles.navLabel}>{item.label}</Text></Pressable>)}</View></View>;
}
export type MewsButtonProps = { label: string; onPress: () => void; hint?: string; disabled?: boolean };
export function MewsButton({label,onPress,hint,disabled=false}: MewsButtonProps) {
  const {display} = useMewsFont();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed}) => [styles.action, disabled && styles.disabled, pressed && styles.pressed]}><Text style={[styles.actionText,display]}>{label}</Text><View style={styles.actionArrow}><Text style={styles.arrowText}>→</Text></View></Pressable>;
}
const styles=StyleSheet.create({
header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingTop:9,paddingBottom:12},brand:{flexDirection:"row",gap:10,alignItems:"center",minHeight:48},brandName:{color:C.ink,fontSize:29},menu:{flexDirection:"row",alignItems:"center",minHeight:48,gap:9},menuLabel:{color:C.ink,fontFamily:MewsMono,fontSize:11},menuSquare:{width:32,height:32,backgroundColor:C.ginger,justifyContent:"center",alignItems:"center",gap:3},menuLine:{width:13,height:2,backgroundColor:C.ink},
bottomBar:{borderTopWidth:1,borderTopColor:C.line,backgroundColor:C.cream},nav:{width:"100%",maxWidth:560,alignSelf:"center",flexDirection:"row",paddingHorizontal:8},navItem:{flex:1,alignItems:"center",justifyContent:"center",gap:7,minHeight:68,paddingVertical:10},navSelected:{backgroundColor:C.ginger},navLabel:{color:C.ink,fontFamily:MewsMono,fontSize:9},
action:{flexDirection:"row",minHeight:57,marginTop:18,backgroundColor:C.ink,borderWidth:2,borderColor:C.ink,alignItems:"center"},actionText:{flex:1,color:C.cream,fontSize:25,paddingHorizontal:13,paddingVertical:9},actionArrow:{minHeight:53,width:52,backgroundColor:C.ginger,justifyContent:"center",alignItems:"center",borderLeftWidth:2,borderLeftColor:C.ink},arrowText:{color:C.ink,fontSize:30},pressed:{opacity:0.7},disabled:{opacity:0.45}
});
