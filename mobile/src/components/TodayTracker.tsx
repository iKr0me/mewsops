import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MewsColors as C, MewsMono as mono, MewsHeader, MewsBottomNav, MewsButton, PixelIcon, useMewsFont } from "./MewsDesign";
import SleepyMascot from "./SleepyMascot";
import MiamiMap from "./MiamiMap";
import { FICTIONAL_MAP_POINTS } from "./MiamiMap.data";

// Fictional report IDs align with the Needs screen; colony names come from the map's shared source.
const reportFixtures = {
  "colony-1": { id: "R01", title: "LIMPING", category: "Reported concern", detail: "A volunteer reported a limping cat. Identity remains unresolved; this is not a diagnosis.", status: "Identity needs review", kind: "cat" },
  "colony-2": { id: "R02", title: "KITTENS", category: "Reported sighting", detail: "A volunteer reported seeing two small kittens. The sighting does not establish new confirmed identities; staff review is still needed.", status: "Identity needs review", kind: "colony" },
  "colony-3": { id: "R03", title: "FEEDER CHECK", category: "Coverage concern", detail: "A volunteer reported a gap in feeder coverage. Last feeding time is unknown; no visit has been confirmed.", status: "Feeding time unknown", kind: "bowl" },
} as const;
const records = FICTIONAL_MAP_POINTS.flatMap(point => {
  const fixture = reportFixtures[point.id as keyof typeof reportFixtures];
  return fixture ? [{ ...fixture, colonyId: point.id, colony: point.title }] : [];
});
function StairAccent() {
  return <View style={s.stairs} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {[0, 1, 2, 3, 4].map(index => <View key={index} style={[s.step, { left: index * 11, bottom: index * 11 }]} />)}
  </View>;
}
function RecordArt({ kind }: { kind: typeof records[number]["kind"] }) {
  if (kind === "cat") return <View style={[s.art,s.concernArt]} accessible accessibilityLabel="Reported concern category illustration. No report photo."><PixelIcon name="care" size={56}/><Text style={s.categoryArtLabel}>CARE NEEDED</Text></View>;
  if (kind === "bowl") return <View style={[s.art, s.bowlArt]} accessible accessibilityLabel="Illustration of a feeding bowl, no report photo">
    <View style={s.bowlRim} /><View style={s.bowl} /><View style={s.bowlFoot} /><View style={s.foodOne} /><View style={s.foodTwo} />
  </View>;
  return <View style={[s.art, s.colonyArt]} accessible accessibilityLabel="Illustrated fictional colony, not a map location">
    <View style={s.houseRoof} /><View style={s.house} /><View style={s.door} /><View style={s.houseWindow} />
  </View>;
}

export default function TodayTracker() {
  const {fontsLoaded,fontError,display}=useMewsFont();
  const [selected,setSelected]=useState<string|null>(null);
  const {width,fontScale}=useWindowDimensions();
  const wide=width>=900;
  const selectedRecord=records.find(item=>item.colonyId===selected);

  return <SafeAreaView style={s.safe} edges={["top", "bottom", "left", "right"]}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <MewsHeader />
      <View style={[s.columns, wide && s.columnsWide]}>
        <View style={[s.listColumn, wide && s.listWide]}>
          <View style={s.hero}>
            <View style={s.heroText}><Text accessibilityRole="header" style={[s.heading, display, fontScale > 1.3 && s.largeTextHeading]}>NEEDED{`\n`}<Text style={s.orange}>TODAY</Text></Text></View>
            <View style={s.heroArt}>
              <StairAccent />
              <SleepyMascot />
            </View>
          </View>
          <Text style={s.purpose}>REPORT. CARE. REVIEW TOGETHER.</Text>
          <View style={s.listMeta}><Text style={s.meta}>FICTIONAL DEMO</Text><Text style={s.meta}>{records.length} OPEN NEEDS</Text></View>
          {!fontsLoaded && <Text style={s.fontNotice}>{fontError ? "Pixel font unavailable · fallback shown" : "Loading pixel type…"}</Text>}
          <View style={s.records}>
            {records.map(item => <View key={item.id} style={[s.record,selected===item.colonyId && s.selectedRecord]}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.colony}. ${item.status}. Show details`} accessibilityState={{ expanded: selected === item.colonyId, selected: selected === item.colonyId }} onPress={() => setSelected(selected === item.colonyId ? null : item.colonyId)} style={({ pressed }) => [s.recordButton, pressed && s.pressed]}>
                <View style={s.imageColumn}><View style={s.imageFrame}><RecordArt kind={item.kind} /></View><View style={s.numberBadge}><Text style={[s.number, display]}>{item.id}</Text></View><Text style={s.illustrationLabel}>ILLUSTRATION</Text></View>
                <View style={s.recordBody}>
                  <Text style={[s.recordTitle, display]}>{item.title}</Text>
                  <Text style={s.recordCategory}>{item.category}</Text>
                  <Text style={s.location}>⌖ {item.colony}</Text>
                  <View style={s.recordBottom}><View style={[s.tag, item.kind === "cat" && s.reviewTag]}><Text style={s.tagText}>{item.status}</Text></View><View style={s.arrowSquare}><Text style={s.arrow}>{selected === item.colonyId ? "−" : "→"}</Text></View></View>
                </View>
              </Pressable>
              {selected === item.colonyId && <View style={s.detail}><Text style={s.detailText}>{item.detail}</Text><Text style={s.detailCaption}>Fictional example. Artwork is not evidence.</Text></View>}
            </View>)}
          </View>
          <MewsButton label="REPORT AN UPDATE" onPress={()=>router.push("/update")} hint="Opens the report preview. Nothing is sent in this demo." />
          <Text style={s.receiptNote}>Preview only · nothing is sent</Text>
        </View>
        <View style={[s.mapColumn, wide && s.mapWide]}>
          <Text accessibilityRole="header" style={[s.mapTitle, display]}>OUR LITTLE{`\n`}CORNER</Text>
          <MiamiMap points={FICTIONAL_MAP_POINTS} selectedId={selected} onSelect={setSelected} />
          <View accessibilityLiveRegion="polite" style={s.mapSelection}>
            <Text style={s.mapNote}>{selectedRecord ? `${selectedRecord.colony} · ${selectedRecord.title.toLowerCase()}. ${selectedRecord.status}.` : "Choose a colony on the map or a care record above. Both views share the same selection."}</Text>
            {selectedRecord && <Pressable accessibilityRole="button" accessibilityLabel={`Read all needs for ${selectedRecord.colony}`} onPress={()=>router.push({pathname:"/tasks",params:{colonyId:selectedRecord.colonyId}})} style={s.relatedNeeds}><Text style={s.relatedNeedsText}>VIEW COLONY NEEDS →</Text></Pressable>}
          </View>
        </View>
      </View>
    </ScrollView>
    <MewsBottomNav active="/" />
  </SafeAreaView>;
}

const s = StyleSheet.create({
  selectedRecord:{borderColor:C.orange,backgroundColor:"#FFF0DD"},mapSelection:{marginTop:8},relatedNeeds:{minHeight:48,justifyContent:"center"},relatedNeedsText:{fontSize:13,fontWeight:"700",color:C.orange},
  concernArt:{backgroundColor:"#F3DEC8"},categoryArtLabel:{fontFamily:mono,fontSize:9,color:C.orange,marginTop:10},
  safe: { flex: 1, backgroundColor: C.cream }, page: { width: "100%", maxWidth: 1060, alignSelf: "center", paddingHorizontal: 18, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 9, paddingBottom: 12 }, brand: { flexDirection: "row", gap: 10, alignItems: "center" }, brandName: { color: C.ink, fontSize: 29 }, menu: { flexDirection: "row", alignItems: "center", minHeight: 48, gap: 9 }, menuLabel: { color: C.ink, fontFamily: mono, fontSize: 11 }, menuSquare: { width: 32, height: 32, backgroundColor: C.ginger, justifyContent: "center", alignItems: "center", gap: 3 }, menuLine: { width: 13, height: 2, backgroundColor: C.ink },
  columns: { gap: 30 }, columnsWide: { flexDirection: "row", gap: 44 }, listColumn: { minWidth: 0 }, listWide: { flex: 1, maxWidth: 470 }, mapColumn: { minWidth: 0 }, mapWide: { flex: 1, paddingTop: 28 },
  hero: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 13, paddingBottom: 10 }, heroText: { flex: 1 }, heading: { color: C.ink, fontSize: 58, lineHeight: 48, letterSpacing: -0.7 }, largeTextHeading: { fontSize: 42, lineHeight: 42 }, orange: { color: C.orange }, heroArt: { width: 106, minHeight: 142, alignItems: "center" }, heroCat: { width: 82, height: 82, marginTop: 9, borderRadius: 0 }, stairs: { position: "absolute", width: 66, height: 66, right: -3, top: 0 }, step: { position: "absolute", height: 22, width: 22, backgroundColor: C.ginger }, motionButton: { minHeight: 32, minWidth: 64, paddingHorizontal: 8, justifyContent: "center", alignItems: "center" }, motionText: { fontFamily: mono, fontSize: 9, color: C.muted },
  purpose: { fontFamily: mono, color: C.muted, fontSize: 10, lineHeight: 16, letterSpacing: 0.2, marginBottom: 13 }, listMeta: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, paddingBottom: 9 }, meta: { fontFamily: mono, color: C.muted, fontSize: 10 }, fontNotice: { color: C.orange, fontSize: 12, marginBottom: 10 },
  records: { gap: 8 }, record: { borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, borderRadius: 2 }, recordButton: { flexDirection: "row", padding: 7, gap: 12, minHeight: 133, alignItems: "center" }, imageColumn: { width: "37%", alignSelf: "stretch", justifyContent: "center" }, imageFrame: { width: "100%", aspectRatio: 1, backgroundColor: "#EADCC5", overflow: "hidden" }, photo: { width: "100%", height: "100%" }, numberBadge: { position: "absolute", top: -8, left: -8, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: C.ginger, borderWidth: 1, borderColor: C.ink, borderRadius: 2 }, number: { fontSize: 20, color: C.ink }, illustrationLabel: { fontFamily: mono, fontSize: 7, color: C.muted, marginTop: 3 }, recordBody: { flex: 1, minWidth: 0, paddingVertical: 2 }, recordTitle: { fontSize: 26, lineHeight: 27, color: C.ink }, recordCategory: { fontFamily: mono, fontSize: 10, lineHeight: 16, color: C.ink, marginTop: 2 }, location: { fontSize: 11, lineHeight: 17, color: C.ink, marginTop: 5 }, recordBottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 6, marginTop: 7 }, tag: { flex: 1, paddingHorizontal: 5, paddingVertical: 4, borderWidth: 1, borderColor: "#CAA777", borderRadius: 2 }, reviewTag: { borderColor: "#B9876D" }, tagText: { fontSize: 9, lineHeight: 12, color: C.muted }, arrowSquare: { backgroundColor: C.ink, width: 29, height: 29, alignItems: "center", justifyContent: "center" }, arrow: { color: C.cream, fontSize: 22, lineHeight: 25 }, detail: { padding: 12, borderTopWidth: 1, borderTopColor: C.line }, detailText: { color: C.ink, fontSize: 14, lineHeight: 21 }, detailCaption: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 6 },
  art: { flex: 1, alignItems: "center", justifyContent: "center" }, bowlArt: { backgroundColor: "#ECD8B9" }, bowlRim: { width: "68%", height: 9, backgroundColor: C.ink, position: "absolute", top: "42%", zIndex: 2 }, bowl: { width: "60%", height: "30%", backgroundColor: C.ginger, borderWidth: 3, borderColor: C.ink, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: 12 }, bowlFoot: { position: "absolute", bottom: "21%", height: 4, width: "40%", backgroundColor: C.ink }, foodOne: { position: "absolute", top: "30%", left: "39%", width: 7, height: 7, backgroundColor: C.orange }, foodTwo: { position: "absolute", top: "26%", left: "54%", width: 7, height: 7, backgroundColor: C.orange }, colonyArt: { backgroundColor: "#E7E1CD" }, house: { width: "56%", height: "43%", backgroundColor: C.cream, borderWidth: 2, borderColor: C.ink, marginTop: 13 }, houseRoof: { position: "absolute", top: "20%", width: "49%", height: "39%", backgroundColor: C.ginger, transform: [{ rotate: "45deg" }] }, door: { position: "absolute", bottom: "23%", width: "13%", height: "22%", backgroundColor: C.ink }, houseWindow: { position: "absolute", top: "47%", right: "27%", width: 8, height: 8, backgroundColor: C.ginger },
  report: { flexDirection: "row", minHeight: 57, marginTop: 18, backgroundColor: C.ink, borderWidth: 2, borderColor: C.ink, alignItems: "center" }, reportText: { flex: 1, color: C.cream, fontSize: 25, paddingHorizontal: 13, paddingVertical: 9 }, reportArrow: { minHeight: 53, width: 52, backgroundColor: C.ginger, justifyContent: "center", alignItems: "center", borderLeftWidth: 2, borderLeftColor: C.ink }, reportArrowText: { color: C.ink, fontSize: 30 }, receiptNote: { fontFamily: mono, fontSize: 10, color: C.muted, textAlign: "center", marginTop: 7 },
  mapTitle: { color: C.ink, fontSize: 42, lineHeight: 37, marginBottom: 18 }, mapNote: { fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 8 }, bottomBar: { borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.cream }, nav: { width: "100%", maxWidth: 470, alignSelf: "center", flexDirection: "row", paddingHorizontal: 12 }, navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 7, minHeight: 68, paddingVertical: 10 }, navSelected: { backgroundColor: C.ginger }, navLabel: { color: C.ink, fontFamily: mono, fontSize: 8 }, pressed: { opacity: 0.7 },
});
