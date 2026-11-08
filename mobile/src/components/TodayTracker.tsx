import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import MiamiMap from "./MiamiMap";

const C = { cream: "#F9F6EC", paper: "#FFFCF4", ink: "#1F1D1A", ginger: "#E9A15D", orange: "#A74C23", muted: "#6E6256", line: "#DED7C7" };
const mono = Platform.select({ android: "monospace", ios: "Menlo", default: "monospace" });
const mascotImage = require("../../assets/fictional-black-cat.png");
const records = [
  { id: "R01", title: "LIMP REPORTED", colony: "Laundry Lane", category: "Reported concern", detail: "A volunteer reported a limping cat. Identity remains unresolved; this is not a diagnosis.", status: "Identity needs review", kind: "cat" },
  { id: "R02", title: "FEEDER CHECK", colony: "Banyan Corner", category: "Coverage concern", detail: "A volunteer reported a gap in feeder coverage. Last feeding time is unknown; no visit has been confirmed.", status: "Feeding time unknown", kind: "bowl" },
  { id: "C03", title: "LITTLE HARBOR", colony: "Colony record", category: "4 confirmed cats · demo", detail: "This fictional record has four confirmed cats and no recorded open concern. It does not establish current wellbeing.", status: "No concern recorded", kind: "colony" },
] as const;
const navigation = [
  { label: "TODAY", path: "/", icon: "home" },
  { label: "COLONIES", path: "/colonies", icon: "map" },
  { label: "REPORT", path: "/update", icon: "plus" },
  { label: "NEEDS", path: "/tasks", icon: "needs" },
  { label: "CATS", path: "/cats", icon: "cat" },
] as const;
type IconName = typeof navigation[number]["icon"];
const glyphs: Record<IconName, string[]> = {
  home: ["0001000", "0011100", "0110110", "1100011", "0100010", "0101010", "0111110"],
  map: ["1100011", "1011101", "1010101", "1010101", "1010101", "1011101", "1100011"],
  plus: ["0001000", "0001000", "0001000", "1111111", "0001000", "0001000", "0001000"],
  needs: ["1111111", "1000001", "1011101", "1000001", "1011101", "1000001", "1111111"],
  cat: ["1100011", "1110111", "1000001", "1010101", "1000001", "0101010", "0011100"],
};
function PixelIcon({ name, size = 21 }: { name: IconName; size?: number }) {
  const unit = size / 7;
  return <View style={{ width: size, height: size }} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {glyphs[name].flatMap((row, y) => row.split("").map((cell, x) => cell === "1" ? <View key={`${x}-${y}`} style={{ position: "absolute", left: x * unit, top: y * unit, width: unit, height: unit, backgroundColor: C.ink }} /> : null))}
  </View>;
}
function StairAccent() {
  return <View style={s.stairs} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {[0, 1, 2, 3, 4].map(index => <View key={index} style={[s.step, { left: index * 11, bottom: index * 11 }]} />)}
  </View>;
}
function RecordArt({ kind }: { kind: typeof records[number]["kind"] }) {
  if (kind === "cat") return <Image source={mascotImage} style={s.photo} resizeMode="cover" accessible accessibilityLabel="Original sleepy black cat mascot illustration, not report evidence" />;
  if (kind === "bowl") return <View style={[s.art, s.bowlArt]} accessible accessibilityLabel="Illustration of a feeding bowl, no report photo">
    <View style={s.bowlRim} /><View style={s.bowl} /><View style={s.bowlFoot} /><View style={s.foodOne} /><View style={s.foodTwo} />
  </View>;
  return <View style={[s.art, s.colonyArt]} accessible accessibilityLabel="Illustrated fictional colony, not a map location">
    <View style={s.houseRoof} /><View style={s.house} /><View style={s.door} /><View style={s.houseWindow} />
  </View>;
}

export default function TodayTracker() {
  const [fontsLoaded, fontError] = useFonts({ VT323_400Regular });
  const [selected, setSelected] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [motionPaused, setMotionPaused] = useState(false);
  const [float] = useState(() => new Animated.Value(0));
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= 900;
  const display = { fontFamily: fontsLoaded ? "VT323_400Regular" : mono };

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (reducedMotion || motionPaused) { float.setValue(0); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -7, duration: 1400, useNativeDriver: true, isInteraction: false }),
      Animated.timing(float, { toValue: 0, duration: 1400, useNativeDriver: true, isInteraction: false }),
      Animated.delay(700),
    ]));
    animation.start();
    return () => animation.stop();
  }, [float, reducedMotion, motionPaused]);

  return <SafeAreaView style={s.safe} edges={["top", "bottom", "left", "right"]}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View style={s.brand}><PixelIcon name="cat" size={30} /><Text style={[s.brandName, display]}>MEWS</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="About Mangrove Mews" onPress={() => router.push("/about")} style={({ pressed }) => [s.menu, pressed && s.pressed]}><Text style={s.menuLabel}>ABOUT</Text><View style={s.menuSquare}><View style={s.menuLine} /><View style={s.menuLine} /><View style={s.menuLine} /></View></Pressable>
      </View>
      <View style={[s.columns, wide && s.columnsWide]}>
        <View style={[s.listColumn, wide && s.listWide]}>
          <View style={s.hero}>
            <View style={s.heroText}><Text accessibilityRole="header" style={[s.heading, display, fontScale > 1.3 && s.largeTextHeading]}>NEEDED{`\n`}<Text style={s.orange}>TODAY</Text></Text></View>
            <View style={s.heroArt}>
              <StairAccent />
              <Animated.Image source={mascotImage} resizeMode="cover" accessibilityLabel="Sleepy black cat mascot illustration" style={[s.heroCat, { transform: [{ translateY: float }] }]} />
              {!reducedMotion && <Pressable accessibilityRole="button" accessibilityLabel={motionPaused ? "Play mascot animation" : "Pause mascot animation"} onPress={() => setMotionPaused(value => !value)} style={s.motionButton}><Text style={s.motionText}>{motionPaused ? "PLAY" : "PAUSE"}</Text></Pressable>}
            </View>
          </View>
          <Text style={s.purpose}>REPORT. CARE. REVIEW TOGETHER.</Text>
          <View style={s.listMeta}><Text style={s.meta}>FICTIONAL DEMO</Text><Text style={s.meta}>2 OPEN NEEDS</Text></View>
          {!fontsLoaded && <Text style={s.fontNotice}>{fontError ? "Pixel font unavailable · fallback shown" : "Loading pixel type…"}</Text>}
          <View style={s.records}>
            {records.map(item => <View key={item.id} style={s.record}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.colony}. ${item.status}. Show details`} accessibilityState={{ expanded: selected === item.id }} onPress={() => setSelected(selected === item.id ? null : item.id)} style={({ pressed }) => [s.recordButton, pressed && s.pressed]}>
                <View style={s.imageColumn}><View style={s.imageFrame}><RecordArt kind={item.kind} /></View><View style={s.numberBadge}><Text style={[s.number, display]}>{item.id}</Text></View><Text style={s.illustrationLabel}>ILLUSTRATION</Text></View>
                <View style={s.recordBody}>
                  <Text style={[s.recordTitle, display]}>{item.title}</Text>
                  <Text style={s.recordCategory}>{item.category}</Text>
                  <Text style={s.location}>⌖ {item.colony}</Text>
                  <View style={s.recordBottom}><View style={[s.tag, item.kind === "cat" && s.reviewTag]}><Text style={s.tagText}>{item.status}</Text></View><View style={s.arrowSquare}><Text style={s.arrow}>{selected === item.id ? "−" : "→"}</Text></View></View>
                </View>
              </Pressable>
              {selected === item.id && <View style={s.detail}><Text style={s.detailText}>{item.detail}</Text><Text style={s.detailCaption}>Fictional example. Artwork is not evidence.</Text></View>}
            </View>)}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Report an update" accessibilityHint="Opens the report preview. Nothing is sent in this demo." onPress={() => router.push("/update")} style={({ pressed }) => [s.report, pressed && s.pressed]}>
            <Text style={[s.reportText, display]}>REPORT AN UPDATE</Text><View style={s.reportArrow}><Text style={s.reportArrowText}>→</Text></View>
          </Pressable>
          <Text style={s.receiptNote}>Preview only · nothing is sent</Text>
        </View>
        <View style={[s.mapColumn, wide && s.mapWide]}>
          <Text accessibilityRole="header" style={[s.mapTitle, display]}>OUR LITTLE{`\n`}CORNER</Text>
          <MiamiMap />
          <Text style={s.mapNote}>Illustrative map markers are separate from the demo records above.</Text>
        </View>
      </View>
    </ScrollView>
    <View style={s.bottomBar}><View style={s.nav}>
      {navigation.map(item => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label === "TODAY" ? "Today, current screen" : item.label} accessibilityState={{ selected: item.path === "/" }} onPress={() => { if (item.path !== "/") router.push(item.path); }} style={({ pressed }) => [s.navItem, item.path === "/" && s.navSelected, pressed && s.pressed]}><PixelIcon name={item.icon} /><Text style={s.navLabel}>{item.label}</Text></Pressable>)}
    </View></View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream }, page: { width: "100%", maxWidth: 1060, alignSelf: "center", paddingHorizontal: 18, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 9, paddingBottom: 12 }, brand: { flexDirection: "row", gap: 10, alignItems: "center" }, brandName: { color: C.ink, fontSize: 29 }, menu: { flexDirection: "row", alignItems: "center", minHeight: 48, gap: 9 }, menuLabel: { color: C.ink, fontFamily: mono, fontSize: 11 }, menuSquare: { width: 32, height: 32, backgroundColor: C.ginger, justifyContent: "center", alignItems: "center", gap: 3 }, menuLine: { width: 13, height: 2, backgroundColor: C.ink },
  columns: { gap: 30 }, columnsWide: { flexDirection: "row", gap: 44 }, listColumn: { minWidth: 0 }, listWide: { flex: 1, maxWidth: 470 }, mapColumn: { minWidth: 0 }, mapWide: { flex: 1, paddingTop: 28 },
  hero: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 13, paddingBottom: 10 }, heroText: { flex: 1 }, heading: { color: C.ink, fontSize: 58, lineHeight: 48, letterSpacing: -0.7 }, largeTextHeading: { fontSize: 42, lineHeight: 42 }, orange: { color: C.orange }, heroArt: { width: 106, height: 116, alignItems: "center" }, heroCat: { width: 82, height: 82, marginTop: 9, borderRadius: 0 }, stairs: { position: "absolute", width: 66, height: 66, right: -3, top: 0 }, step: { position: "absolute", height: 22, width: 22, backgroundColor: C.ginger }, motionButton: { minHeight: 32, minWidth: 64, paddingHorizontal: 8, justifyContent: "center", alignItems: "center" }, motionText: { fontFamily: mono, fontSize: 9, color: C.muted },
  purpose: { fontFamily: mono, color: C.muted, fontSize: 10, lineHeight: 16, letterSpacing: 0.2, marginBottom: 13 }, listMeta: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, paddingBottom: 9 }, meta: { fontFamily: mono, color: C.muted, fontSize: 10 }, fontNotice: { color: C.orange, fontSize: 12, marginBottom: 10 },
  records: { gap: 8 }, record: { borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, borderRadius: 2 }, recordButton: { flexDirection: "row", padding: 7, gap: 12, minHeight: 133, alignItems: "center" }, imageColumn: { width: "37%", alignSelf: "stretch", justifyContent: "center" }, imageFrame: { width: "100%", aspectRatio: 1, backgroundColor: "#EADCC5", overflow: "hidden" }, photo: { width: "100%", height: "100%" }, numberBadge: { position: "absolute", top: -8, left: -8, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: C.ginger, borderWidth: 1, borderColor: C.ink, borderRadius: 2 }, number: { fontSize: 20, color: C.ink }, illustrationLabel: { fontFamily: mono, fontSize: 7, color: C.muted, marginTop: 3 }, recordBody: { flex: 1, minWidth: 0, paddingVertical: 2 }, recordTitle: { fontSize: 26, lineHeight: 27, color: C.ink }, recordCategory: { fontFamily: mono, fontSize: 10, lineHeight: 16, color: C.ink, marginTop: 2 }, location: { fontSize: 11, lineHeight: 17, color: C.ink, marginTop: 5 }, recordBottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 6, marginTop: 7 }, tag: { flex: 1, paddingHorizontal: 5, paddingVertical: 4, borderWidth: 1, borderColor: "#CAA777", borderRadius: 2 }, reviewTag: { borderColor: "#B9876D" }, tagText: { fontSize: 9, lineHeight: 12, color: C.muted }, arrowSquare: { backgroundColor: C.ink, width: 29, height: 29, alignItems: "center", justifyContent: "center" }, arrow: { color: C.cream, fontSize: 22, lineHeight: 25 }, detail: { padding: 12, borderTopWidth: 1, borderTopColor: C.line }, detailText: { color: C.ink, fontSize: 14, lineHeight: 21 }, detailCaption: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 6 },
  art: { flex: 1, alignItems: "center", justifyContent: "center" }, bowlArt: { backgroundColor: "#ECD8B9" }, bowlRim: { width: "68%", height: 9, backgroundColor: C.ink, position: "absolute", top: "42%", zIndex: 2 }, bowl: { width: "60%", height: "30%", backgroundColor: C.ginger, borderWidth: 3, borderColor: C.ink, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: 12 }, bowlFoot: { position: "absolute", bottom: "21%", height: 4, width: "40%", backgroundColor: C.ink }, foodOne: { position: "absolute", top: "30%", left: "39%", width: 7, height: 7, backgroundColor: C.orange }, foodTwo: { position: "absolute", top: "26%", left: "54%", width: 7, height: 7, backgroundColor: C.orange }, colonyArt: { backgroundColor: "#E7E1CD" }, house: { width: "56%", height: "43%", backgroundColor: C.cream, borderWidth: 2, borderColor: C.ink, marginTop: 13 }, houseRoof: { position: "absolute", top: "20%", width: "49%", height: "39%", backgroundColor: C.ginger, transform: [{ rotate: "45deg" }] }, door: { position: "absolute", bottom: "23%", width: "13%", height: "22%", backgroundColor: C.ink }, houseWindow: { position: "absolute", top: "47%", right: "27%", width: 8, height: 8, backgroundColor: C.ginger },
  report: { flexDirection: "row", minHeight: 57, marginTop: 18, backgroundColor: C.ink, borderWidth: 2, borderColor: C.ink, alignItems: "center" }, reportText: { flex: 1, color: C.cream, fontSize: 25, paddingHorizontal: 13, paddingVertical: 9 }, reportArrow: { minHeight: 53, width: 52, backgroundColor: C.ginger, justifyContent: "center", alignItems: "center", borderLeftWidth: 2, borderLeftColor: C.ink }, reportArrowText: { color: C.ink, fontSize: 30 }, receiptNote: { fontFamily: mono, fontSize: 10, color: C.muted, textAlign: "center", marginTop: 7 },
  mapTitle: { color: C.ink, fontSize: 42, lineHeight: 37, marginBottom: 18 }, mapNote: { fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 8 }, bottomBar: { borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.cream }, nav: { width: "100%", maxWidth: 470, alignSelf: "center", flexDirection: "row", paddingHorizontal: 12 }, navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 7, minHeight: 68, paddingVertical: 10 }, navSelected: { backgroundColor: C.ginger }, navLabel: { color: C.ink, fontFamily: mono, fontSize: 8 }, pressed: { opacity: 0.7 },
});
