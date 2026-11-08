import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import MiamiMap from "./MiamiMap";

const C = { bg: "#FFF9EF", panel: "#F8E5D2", ink: "#292725", muted: "#716255", ginger: "#AC4C19", slate: "#65554A", concern: "#A43A2B", line: "#E8D9C8" };
const displayFont = Platform.select({ android: "sans-serif-black", ios: "System", default: "system-ui" });
const labelFont = Platform.select({ android: "monospace", ios: "Menlo", default: "monospace" });
const colonies = [
  { name: "Laundry Lane", cats: 7, label: "Reported limping", note: "A feeder noticed a limping calico. Identity still needs review." },
  { name: "Banyan Corner", cats: 5, label: "Feeder coverage", note: "A volunteer reported a gap in feeder coverage. A visit is not yet confirmed." },
  { name: "Little Harbor", cats: 4, label: "No concern recorded", note: "No open concern in this fictional example. Last feeding time is unknown." },
] as const;

function PixelSpark() {
  return <View style={s.pixelSpark} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {[[7, 0], [0, 7], [7, 7], [14, 7], [7, 14]].map(([left, top]) => <View key={`${left}-${top}`} style={[s.pixel, { left, top }]} />)}
  </View>;
}

function CatMascot() {
  return <View accessible accessibilityLabel="Sleepy round black cat mascot" style={s.cat}>
    <View style={s.catShadow} />
    <View style={[s.ear, { left: 12, transform: [{ rotate: "-18deg" }] }]} />
    <View style={[s.ear, { right: 12, transform: [{ rotate: "18deg" }] }]} />
    <View style={s.face}>
      <View style={[s.eye, { left: 16 }]} /><View style={[s.eye, { right: 16 }]} />
      <View style={s.nose} /><View style={[s.whisker, { left: 5 }]} /><View style={[s.whisker, { right: 5 }]} />
      <View style={s.paw} />
    </View>
    <Text style={s.sleepMark}>z</Text>
  </View>;
}

export default function TodayTracker() {
  const [selected, setSelected] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [motionPaused, setMotionPaused] = useState(false);
  const [greeting] = useState(() => new Animated.Value(0));
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= 900;
  const colony = colonies[selected];

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (reducedMotion || motionPaused) { greeting.setValue(0); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(greeting, { toValue: -8, duration: 1200, useNativeDriver: true }),
      Animated.timing(greeting, { toValue: 0, duration: 1200, useNativeDriver: true }),
      Animated.delay(1200),
    ]));
    animation.start();
    return () => animation.stop();
  }, [greeting, reducedMotion, motionPaused]);

  return <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View style={s.brand}><PixelSpark /><Text style={s.brandText}>mangrove mews</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="About Mangrove Mews" onPress={() => router.push("/about")} style={({ pressed }) => [s.about, pressed && s.pressed]}><Text style={s.aboutText}>About ↗</Text></Pressable>
      </View>
      <View style={[s.greeting, (width < 350 || fontScale > 1.3) && s.greetingStacked]}>
        <View style={s.titleBlock}><Text style={s.eyebrow}>MIAMI / CAT CARE CLUB</Text><Text accessibilityRole="header" style={[s.title, width < 400 && s.compactTitle]}>LITTLE PAWS.{'\n'}BIG PLANS.</Text></View>
        <View style={s.mascotColumn}>
          <Animated.View style={{ width: 112, height: 116, alignItems: "center", justifyContent: "center", transform: [{ translateY: greeting }, { rotate: greeting.interpolate({ inputRange: [-8, 0], outputRange: ["-4deg", "2deg"] }) }, { scale: 1.3 }] }}><CatMascot /></Animated.View>
          {!reducedMotion && <Pressable accessibilityRole="button" accessibilityLabel={motionPaused ? "Play mascot animation" : "Pause mascot animation"} onPress={() => setMotionPaused(value => !value)} style={s.motionControl}><Text style={s.motionLabel}>{motionPaused ? "Play cat" : "Pause cat"}</Text></Pressable>}
        </View>
      </View>
      <Text style={s.purpose}>Report a sighting. Check colony needs. Let the team review cat identities.</Text>
      <View style={s.todayLine}><Text style={s.todayTitle}>TODAY’S FIELDNOTES</Text><Text style={s.demo}>Fictional demo · not live</Text></View>
      <View style={[s.main, wide && s.mainWide]}>
        <View style={[s.needsColumn, wide && s.needsWide]}>
          <View style={s.sectionHeading}><Text accessibilityRole="header" style={s.sectionTitle}>On the care list</Text><Text style={s.needCount}>2 needs</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="View Laundry Lane reported limping concern" onPress={() => setSelected(0)} accessibilityState={{ selected: selected === 0 }} style={({ pressed }) => [s.need, selected === 0 && s.selectedNeed, pressed && s.pressed]}>
            <View style={[s.needIcon, { backgroundColor: "#FBE2D8" }]}><Text style={[s.iconText, { color: C.concern }]}>!</Text></View>
            <View style={s.needBody}><Text style={s.urgentLabel}>REPORTED CONCERN</Text><Text style={s.needTitle}>A calico is limping</Text><Text style={s.needMeta}>Laundry Lane · example report</Text><Text style={s.identity}>?  Identity awaiting review</Text>{selected === 0 && <Text style={s.cardDetail}>{colonies[0].note}</Text>}</View><Text style={s.chevron}>›</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="View Banyan Corner feeder coverage concern" onPress={() => setSelected(1)} accessibilityState={{ selected: selected === 1 }} style={({ pressed }) => [s.need, s.secondNeed, selected === 1 && s.selectedNeed, pressed && s.pressed]}>
            <View style={[s.needIcon, { backgroundColor: "#F7E5CE" }]}><View style={s.bowl} /></View>
            <View style={s.needBody}><Text style={s.needTitle}>A feeding visit needs checking</Text><Text style={s.needMeta}>Banyan Corner · coverage reported</Text><Text style={s.smallNote}>Last feeding time unknown</Text>{selected === 1 && <Text style={s.cardDetail}>{colonies[1].note}</Text>}</View><Text style={s.chevron}>›</Text>
          </Pressable>
          <View style={s.helper}><Text style={s.helperText}>Seen something? A quick note helps the team decide what comes next.</Text></View>
        </View>
        <View style={[s.mapColumn, wide && s.mapWide]}>
          <View style={s.mapSectionHeading}><PixelSpark /><Text accessibilityRole="header" style={s.sectionTitle}>Around Miami</Text></View>
          <MiamiMap />
          <Text style={s.recordLabel}>DEMO COLONY RECORDS</Text>
          <Text style={s.recordHint}>Select a record below. Map markers are separate examples.</Text>
          <View style={s.colonyTabs} accessibilityLabel="Choose a colony">
            {colonies.map((item, index) => <Pressable key={item.name} accessibilityRole="button" accessibilityState={{ selected: selected === index }} onPress={() => setSelected(index)} style={({ pressed }) => [s.colonyTab, selected === index && s.activeTab, pressed && s.pressed]}><Text style={[s.tabText, selected === index && s.activeTabText]}>{item.name}</Text></Pressable>)}
          </View>
          <View style={s.selection} accessibilityLiveRegion="polite">
            <View style={s.selectionTop}><Text style={s.selectionTitle}>{colony.name}</Text><Text style={s.catCount}>{colony.cats} confirmed cats</Text></View>
            <Text style={s.selectionNote}>{colony.note}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
    <View style={s.actionBar}><View style={s.actionInner}>
      <Pressable accessibilityRole="button" accessibilityLabel="Report an update" accessibilityHint="Opens the report screen. This demo does not send reports." onPress={() => router.push("/update")} style={({ pressed }) => [s.report, pressed && (reducedMotion ? s.pressed : s.reportPressed)]}><Text style={s.reportPlus}>+</Text><Text style={s.reportText}>REPORT AN UPDATE</Text><Text style={s.reportArrow}>↗</Text></Pressable>
      <Text style={s.actionHint}>Demo preview · nothing is sent</Text>
    </View></View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  greetingStacked: { flexDirection: "column", alignItems: "flex-start" }, compactTitle: { fontSize: 28, lineHeight: 30 },
  pixelSpark: { width: 20, height: 20 }, pixel: { position: "absolute", width: 6, height: 6, backgroundColor: C.ginger },
  mascotColumn: { alignItems: "center", width: 112 }, motionControl: { minHeight: 48, minWidth: 72, justifyContent: "center", alignItems: "center" }, motionLabel: { fontFamily: labelFont, fontSize: 11, color: C.muted, textDecorationLine: "underline" },
  purpose: { color: C.muted, fontSize: 15, lineHeight: 22, maxWidth: 490, marginBottom: 22 },
  selectedNeed: { borderColor: C.ginger, backgroundColor: "#FFF1E2" }, cardDetail: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  mapSectionHeading: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 14 }, recordLabel: { fontFamily: labelFont, color: C.ink, fontSize: 12, letterSpacing: 0.8, marginTop: 20, fontWeight: "700" }, recordHint: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  safe: { flex: 1, backgroundColor: C.bg }, content: { width: "100%", maxWidth: 1160, alignSelf: "center", paddingHorizontal: 22, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }, brand: { flexDirection: "row", alignItems: "center", gap: 8 }, brandText: { color: C.ink, fontWeight: "900", fontSize: 16, letterSpacing: -0.7, fontFamily: displayFont }, about: { minHeight: 48, minWidth: 64, alignItems: "flex-end", justifyContent: "center" }, aboutText: { color: C.muted, fontSize: 14 },
  greeting: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 18, paddingBottom: 4, gap: 8 }, titleBlock: { flex: 1 }, eyebrow: { color: C.ginger, fontSize: 11, letterSpacing: 1.2, fontWeight: "700", marginBottom: 10 }, title: { fontFamily: displayFont, fontSize: 34, lineHeight: 34, letterSpacing: -1.6, fontWeight: "900", color: C.ink },
  cat: { width: 80, height: 85, marginTop: 8 }, catShadow: { position: "absolute", bottom: 2, left: 9, width: 62, height: 10, borderRadius: 20, backgroundColor: "#E8D9C8" }, ear: { position: "absolute", width: 23, height: 29, top: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: "#292725" }, face: { position: "absolute", top: 23, left: 4, width: 72, height: 57, borderRadius: 32, backgroundColor: "#292725", overflow: "hidden" }, eye: { position: "absolute", top: 18, height: 7, width: 12, borderBottomWidth: 2, borderColor: "#F4E9D9", borderBottomLeftRadius: 9, borderBottomRightRadius: 9 }, nose: { position: "absolute", top: 29, left: 33, width: 6, height: 4, borderRadius: 3, backgroundColor: "#D8A88A" }, whisker: { position: "absolute", top: 30, height: 1, width: 10, backgroundColor: "#BAACA0" }, paw: { position: "absolute", bottom: 3, right: 9, width: 25, height: 11, borderRadius: 9, backgroundColor: "#423D38" }, sleepMark: { position: "absolute", top: -2, right: 2, color: C.ginger, fontSize: 18, fontWeight: "600", transform: [{ rotate: "12deg" }] },
  todayLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }, todayTitle: { color: C.ink, fontFamily: labelFont, fontSize: 12, fontWeight: "700", letterSpacing: 0.8 }, demo: { color: C.muted, fontSize: 12 }, main: { gap: 24 }, mainWide: { flexDirection: "row-reverse", gap: 32 }, mapColumn: { minWidth: 0 }, mapWide: { flex: 1.2 }, needsColumn: { minWidth: 0 }, needsWide: { flex: 1, paddingTop: 6 },
  colonyTabs: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 12 }, colonyTab: { paddingHorizontal: 10, minHeight: 48, justifyContent: "center", borderRadius: 3, borderWidth: 1, borderColor: C.line }, activeTab: { backgroundColor: C.panel, borderColor: C.ginger }, tabText: { color: C.muted, fontSize: 12 }, activeTabText: { color: C.ginger, fontWeight: "700" }, selection: { paddingTop: 12 }, selectionTop: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }, selectionTitle: { color: C.ink, fontWeight: "700", fontSize: 16 }, catCount: { color: C.slate, fontSize: 12 }, selectionNote: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }, sectionTitle: { color: C.ink, fontFamily: displayFont, fontSize: 24, fontWeight: "900", letterSpacing: -0.8 }, needCount: { color: C.ink, fontFamily: labelFont, fontSize: 12, backgroundColor: "#F2C99D", paddingHorizontal: 9, paddingVertical: 6, fontWeight: "700" }, need: { flexDirection: "row", gap: 10, padding: 14, borderWidth: 1.5, borderColor: "#CDBDA9", borderBottomWidth: 4, backgroundColor: "#FFFDFA", borderRadius: 4, alignItems: "flex-start", marginBottom: 12 }, secondNeed: { paddingBottom: 12 }, needIcon: { width: 38, height: 42, borderRadius: 3, justifyContent: "center", alignItems: "center" }, iconText: { fontSize: 24, fontWeight: "800" }, needBody: { flex: 1 }, urgentLabel: { color: C.concern, fontSize: 10, letterSpacing: 1.1, fontWeight: "700", marginBottom: 5 }, needTitle: { color: C.ink, fontSize: 18, lineHeight: 23, fontWeight: "800" }, needMeta: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }, identity: { color: C.slate, fontSize: 12, lineHeight: 18, marginTop: 9, backgroundColor: "#F1EAE0", alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 3 }, smallNote: { color: C.muted, fontSize: 12, marginTop: 5 }, chevron: { color: C.muted, fontSize: 19 }, bowl: { width: 23, height: 13, borderWidth: 2, borderColor: C.ginger, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }, helper: { paddingTop: 8 }, helperText: { color: C.muted, fontSize: 13, lineHeight: 20 },
  actionBar: { backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 6 }, actionInner: { width: "100%", maxWidth: 600, alignSelf: "center" }, report: { minHeight: 56, backgroundColor: "#EF9B59", borderRadius: 4, borderWidth: 2, borderBottomWidth: 5, borderColor: C.ink, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }, reportPlus: { color: C.ink, fontSize: 28, fontWeight: "400" }, reportText: { flex: 1, color: C.ink, fontFamily: displayFont, fontWeight: "900", fontSize: 16, letterSpacing: 0.5 }, reportArrow: { color: C.ink, fontSize: 23 }, actionHint: { color: C.muted, textAlign: "center", fontSize: 11, paddingTop: 7, paddingBottom: 2 }, pressed: { opacity: 0.72 }, reportPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
