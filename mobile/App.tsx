import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useRouter, type Href } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export type Screen = "today" | "colonies" | "update" | "cats" | "tasks";
const nav: { id: Screen; icon: string; label: string }[] = [
  { id: "today", icon: "⌂", label: "today" },
  { id: "colonies", icon: "◉", label: "colonies" },
  { id: "update", icon: "+", label: "update" },
  { id: "cats", icon: "♡", label: "cats" },
  { id: "tasks", icon: "☑", label: "tasks" },
];
const colonies = [
  {
    name: "Mangrove Lantern",
    area: "Little River · fictional",
    cats: 4,
    fixed: 2,
    note: "A reported injury needs review",
    status: "needs attention",
    color: "#8c514c",
  },
  {
    name: "Coral Courtyard",
    area: "Buena Vista · fictional",
    cats: 4,
    fixed: 1,
    note: "Kittens reported, unconfirmed",
    status: "review update",
    color: "#8a6942",
  },
  {
    name: "Banyan Cove",
    area: "Allapattah · fictional",
    cats: 3,
    fixed: 1,
    note: "Feeder coverage needs review",
    status: "coverage",
    color: "#7162a0",
  },
];
const cats = [
  {
    name: "Pebble",
    description: "Mangrove Lantern",
    initials: "P",
    color: "#e2d9cd",
    status: "vet review",
  },
  {
    name: "Shell",
    description: "Coral Courtyard",
    initials: "S",
    color: "#e1d9e9",
    status: "confirmed",
  },
  {
    name: "Moss",
    description: "Banyan Cove",
    initials: "M",
    color: "#d1e3d0",
    status: "confirmed",
  },
];

const Header = () => (
  <View style={styles.header}>
    <View style={styles.brandMark}>
      <Text style={styles.paw}>✣</Text>
    </View>
    <View style={styles.brandText}>
      <Text style={styles.brand}>mangrove mews</Text>
      <Text style={styles.brandSub}>a little care, together</Text>
    </View>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>M</Text>
    </View>
  </View>
);
const Colonies = () => (
  <>
    {colonies.map((c) => (
      <View key={c.name} style={styles.colonyCard}>
        <View style={styles.cardHead}>
          <View style={styles.locationIcon}>
            <Text style={styles.locationGlyph}>⌖</Text>
          </View>
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{c.name}</Text>
            <Text style={styles.muted}>{c.area}</Text>
          </View>
          <Text style={[styles.status, { color: c.color }]}>{c.status}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.small}>
            <Text style={styles.strong}>{c.cats}</Text> confirmed cats
          </Text>
          <Text style={styles.small}>
            <Text style={styles.strong}>{c.fixed}</Text> fixed
          </Text>
        </View>
        <Text style={styles.cardNote}>● {c.note}</Text>
      </View>
    ))}
  </>
);

export default function App({ screen }: { screen: Screen }) {
  const router = useRouter();
  const setScreen = (next: Screen) =>
    router.replace((next === "today" ? "/" : `/${next}`) as Href);
  const [colony, setColony] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(false);
  const [mapColony, setMapColony] = useState(0);
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={[styles.shell, wide && styles.shellWide]}>
        <Header />
        <View style={styles.demo}>
          <Text style={styles.demoText}>
            ✳ fictional demo · not connected to a backend
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={[styles.content, wide && styles.contentWide]}
          keyboardShouldPersistTaps="handled"
        >
          {screen === "today" && (
            <>
              <View style={styles.homeHero}>
                <Text style={styles.homeKicker}>
                  A LITTLE MORE CARE, TOGETHER ✳
                </Text>
                <Text style={styles.homeTitle}>
                  Every cat has a story. Keep it together.
                </Text>
                <Text style={styles.homeLead}>
                  One shared place for rescue teams to collect field updates,
                  spot urgent needs, and keep track of the cats in their care.
                </Text>
                <View style={styles.homeActions}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => setScreen("update")}
                    style={styles.homePrimary}
                  >
                    <Text style={styles.homePrimaryText}>
                      Share an update ↗
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => setScreen("colonies")}
                    style={styles.homeSecondary}
                  >
                    <Text style={styles.homeSecondaryText}>
                      Explore colonies →
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.homeFootnote}>
                  A fictional hackathon demo · updates are not sent yet
                </Text>
              </View>
              <View style={styles.tracker}>
                <View style={styles.trackerHeader}>
                  <Text style={styles.trackerLabel}>
                    MANGROVE MEWS / COLONY TRACKER
                  </Text>
                  <Text style={styles.trackerDemo}>DEMO</Text>
                </View>
                <Text style={styles.trackerTitle}>
                  A clearer picture of care.
                </Text>
                <Text style={styles.trackerCaption}>
                  Fictional schematic · tap a marker to explore
                </Text>
                <View style={styles.map}>
                  <View style={styles.mapRoadOne} />
                  <View style={styles.mapRoadTwo} />
                  {colonies.map((item, index) => (
                    <TouchableOpacity
                      key={item.name}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${item.name}`}
                      onPress={() => setMapColony(index)}
                      style={[
                        styles.mapPin,
                        index === 0
                          ? styles.pinOne
                          : index === 1
                            ? styles.pinTwo
                            : styles.pinThree,
                        mapColony === index && styles.mapPinSelected,
                      ]}
                    >
                      <Text style={styles.mapPinText}>{index + 1}</Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.mapWater}>MIAMI / FICTIONAL</Text>
                </View>
                <View style={styles.trackerDetails}>
                  <View style={styles.grow}>
                    <Text style={styles.trackerLabel}>
                      SELECTED COLONY / 0{mapColony + 1}
                    </Text>
                    <Text style={styles.trackerColony}>
                      {colonies[mapColony].name}
                    </Text>
                    <Text style={styles.trackerCaption}>
                      {colonies[mapColony].note}
                    </Text>
                  </View>
                  <View style={styles.trackerCounter}>
                    <Text style={styles.trackerNumber}>
                      {colonies[mapColony].cats}
                    </Text>
                    <Text style={styles.trackerLabel}>CATS</Text>
                  </View>
                </View>
              </View>
              <View style={styles.aboutBlock}>
                <Text style={styles.homeKicker}>WHAT THIS MAKES POSSIBLE</Text>
                <Text style={styles.aboutTitle}>
                  Less searching. More caring.
                </Text>
                <Text style={styles.aboutBody}>
                  When updates live across chats, photos and notebooks,
                  important details are easy to miss. This workspace is designed
                  to bring them together so the team can see what needs
                  attention.
                </Text>
                <View style={styles.stepsRow}>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>01 / SHARE</Text>
                    <Text style={styles.stepText}>
                      A volunteer reports what they noticed.
                    </Text>
                  </View>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>02 / REVIEW</Text>
                    <Text style={styles.stepText}>
                      The team reviews suggested details and concerns.
                    </Text>
                  </View>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>03 / CARE</Text>
                    <Text style={styles.stepText}>
                      People decide what happens next.
                    </Text>
                  </View>
                </View>
                <View style={styles.aboutDivider} />
                <Text style={styles.homeKicker}>MEET MANGROVE MEWS</Text>
                <Text style={styles.aboutTitle}>
                  A community looking out for community cats.
                </Text>
                <Text style={styles.aboutBody}>
                  Mangrove Mews is a fictional Miami rescue created for this
                  challenge. Its volunteers feed colonies, help cats get
                  veterinary care and support trap-neuter-return. This app is
                  being built to help a team like theirs see the whole picture,
                  together.
                </Text>
              </View>
            </>
          )}
          {screen === "colonies" && (
            <>
              <Text style={styles.eyebrow}>THE PLACES WE CARE FOR</Text>
              <Text style={styles.title}>colonies</Text>
              <Text style={styles.subtitle}>
                A quick look at what each community needs.
              </Text>
              <View style={styles.search}>
                <Text style={styles.searchText}>⌕ Fictional colonies</Text>
              </View>
              <Colonies />
            </>
          )}
          {screen === "update" && (
            <>
              <Text style={styles.eyebrow}>FROM THE FIELD</Text>
              <Text style={styles.title}>share an update</Text>
              <Text style={styles.subtitle}>
                A little detail helps the whole team stay in the loop.
              </Text>
              <View style={styles.formCard}>
                <Text style={styles.formLabel}>where are you?</Text>
                <Text style={styles.help}>
                  Choose a fictional colony for this update.
                </Text>
                <View style={styles.chips}>
                  {colonies.map((c) => (
                    <TouchableOpacity
                      key={c.name}
                      accessibilityRole="button"
                      accessibilityState={{ selected: colony === c.name }}
                      onPress={() => {
                        setColony(c.name);
                        setPreview(false);
                      }}
                      style={[
                        styles.chip,
                        colony === c.name && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          colony === c.name && styles.chipTextSelected,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.formLabel, { marginTop: 24 }]}>
                  what did you notice?
                </Text>
                <TextInput
                  accessibilityLabel="Field update"
                  multiline
                  value={note}
                  onChangeText={(value) => {
                    setNote(value);
                    setPreview(false);
                  }}
                  placeholder="Share what you saw, in your own words..."
                  placeholderTextColor="#a3aaa3"
                  style={styles.textarea}
                />
                <Text style={styles.help}>
                  Please use fictional information only.
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !colony || !note.trim() }}
                  disabled={!colony || !note.trim()}
                  onPress={() => setPreview(true)}
                  style={[
                    styles.primary,
                    (!colony || !note.trim()) && styles.disabled,
                  ]}
                >
                  <Text style={styles.primaryText}>preview update →</Text>
                </TouchableOpacity>
                {preview && (
                  <View style={styles.preview}>
                    <Text style={styles.previewTitle}>your draft</Text>
                    <Text style={styles.small}>{colony}</Text>
                    <Text style={styles.previewBody}>{note}</Text>
                    <Text style={styles.help}>
                      Preview only. This update has not been sent or saved.
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipTitle}>✧ photos are coming next</Text>
                <Text style={styles.help}>
                  The team is connecting private photo uploads and the agent.
                </Text>
              </View>
            </>
          )}
          {screen === "cats" && (
            <>
              <Text style={styles.eyebrow}>EVERY CAT HAS A STORY</Text>
              <Text style={styles.title}>cat registry</Text>
              <Text style={styles.subtitle}>
                Confirmed fictional cats in our care.
              </Text>
              {cats.map((c) => (
                <View key={c.name} style={styles.catCard}>
                  <View
                    style={[styles.catPortrait, { backgroundColor: c.color }]}
                  >
                    <Text style={styles.catInitial}>{c.initials}</Text>
                    <Text style={styles.catCaption}>fictional profile</Text>
                  </View>
                  <View style={styles.grow}>
                    <Text style={styles.cardTitle}>{c.name}</Text>
                    <Text style={styles.muted}>{c.description}</Text>
                    <Text style={styles.catStatus}>● {c.status}</Text>
                  </View>
                  <Text style={styles.arrow}>↗</Text>
                </View>
              ))}
              <Text style={styles.footnote}>
                Photo profiles and histories will appear when private media is
                connected.
              </Text>
            </>
          )}
          {screen === "tasks" && (
            <>
              <Text style={styles.eyebrow}>CARE, MADE CLEAR</Text>
              <Text style={styles.title}>care tasks</Text>
              <Text style={styles.subtitle}>
                A little help goes a long way.
              </Text>
              {[
                {
                  title: "Review reported injury",
                  colony: "Mangrove Lantern",
                  tag: "today",
                },
                {
                  title: "Check on reported kittens",
                  colony: "Coral Courtyard",
                  tag: "today",
                },
                {
                  title: "Find feeder coverage",
                  colony: "Banyan Cove",
                  tag: "follow up",
                },
              ].map((t) => (
                <View key={t.title} style={styles.task}>
                  <View style={styles.taskIcon}>
                    <Text style={styles.taskGlyph}>✳</Text>
                  </View>
                  <View style={styles.grow}>
                    <Text style={styles.cardTitle}>{t.title}</Text>
                    <Text style={styles.muted}>{t.colony} · fictional</Text>
                  </View>
                  <Text style={styles.taskTag}>{t.tag}</Text>
                </View>
              ))}
              <Text style={styles.footnote}>
                These example tasks are not yet connected to live records.
              </Text>
            </>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
        <View style={styles.nav}>
          {nav.map((item) => (
            <TouchableOpacity
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: screen === item.id }}
              onPress={() => setScreen(item.id)}
              style={styles.navItem}
            >
              <View
                style={[
                  styles.navIconWrap,
                  screen === item.id && styles.navActive,
                ]}
              >
                <Text
                  style={[
                    styles.navIcon,
                    screen === item.id && styles.navIconActive,
                  ]}
                >
                  {item.icon}
                </Text>
              </View>
              <Text
                style={[
                  styles.navLabel,
                  screen === item.id && styles.navLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeHero: { paddingVertical: 26, paddingHorizontal: 4, marginBottom: 16 },
  homeKicker: {
    color: "#466d65",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  homeTitle: {
    color: "#193731",
    fontSize: 39,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -1.6,
    maxWidth: 620,
  },
  homeLead: {
    color: "#4d655d",
    fontSize: 16,
    lineHeight: 25,
    marginTop: 17,
    maxWidth: 550,
  },
  homeActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 23,
  },
  homePrimary: {
    backgroundColor: "#194f44",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    minHeight: 48,
    justifyContent: "center",
  },
  homePrimaryText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  homeSecondary: {
    borderColor: "#97b0a2",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    minHeight: 48,
    justifyContent: "center",
  },
  homeSecondaryText: { color: "#244d42", fontSize: 14, fontWeight: "700" },
  homeFootnote: { color: "#647a6f", fontSize: 11, marginTop: 16 },
  aboutBlock: { paddingHorizontal: 4, paddingTop: 22, paddingBottom: 35 },
  aboutTitle: {
    color: "#193731",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.6,
    maxWidth: 600,
  },
  aboutBody: {
    color: "#52675e",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 620,
  },
  stepsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 25 },
  step: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: "#e5eee5",
    borderRadius: 14,
    padding: 16,
    minHeight: 110,
  },
  stepNumber: {
    color: "#3e6a5e",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "800",
  },
  stepText: {
    color: "#25443a",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 10,
  },
  aboutDivider: { height: 1, backgroundColor: "#ceddd0", marginVertical: 32 },
  tracker: {
    backgroundColor: "#182931",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "#30474c",
  },
  trackerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  trackerLabel: {
    color: "#8ddbd7",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  trackerDemo: {
    color: "#1d2828",
    backgroundColor: "#f5b95c",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: "hidden",
    fontSize: 10,
    fontWeight: "800",
  },
  trackerTitle: {
    color: "#f9faf3",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 5,
  },
  trackerCaption: { color: "#b1c5c5", fontSize: 12, lineHeight: 18 },
  map: {
    height: 200,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#263d43",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#486367",
  },
  mapRoadOne: {
    position: "absolute",
    width: "150%",
    height: 22,
    backgroundColor: "#3a5559",
    top: 75,
    left: -40,
    transform: [{ rotate: "-18deg" }],
  },
  mapRoadTwo: {
    position: "absolute",
    width: "130%",
    height: 12,
    backgroundColor: "#3a5559",
    top: 95,
    left: -30,
    transform: [{ rotate: "34deg" }],
  },
  mapPin: {
    position: "absolute",
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#182931",
    borderWidth: 2,
    borderColor: "#84dad6",
    alignItems: "center",
    justifyContent: "center",
  },
  mapPinSelected: { backgroundColor: "#f5b95c", borderColor: "#f5b95c" },
  mapPinText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  pinOne: { left: "20%", top: "28%" },
  pinTwo: { left: "54%", top: "52%" },
  pinThree: { left: "77%", top: "19%" },
  mapWater: {
    position: "absolute",
    bottom: 12,
    right: 12,
    color: "#8ab7b5",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  trackerDetails: { flexDirection: "row", alignItems: "center", gap: 12 },
  trackerColony: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginVertical: 4,
  },
  trackerCounter: {
    alignItems: "center",
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderColor: "#486367",
  },
  trackerNumber: { color: "#f5b95c", fontSize: 26, fontWeight: "800" },
  safe: { flex: 1, backgroundColor: "#e9f1e6" },
  shell: { flex: 1, backgroundColor: "#f5f7f1" },
  shellWide: {
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#dce6d9",
  },
  header: {
    height: 76,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7f1",
    gap: 10,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#dcead9",
    justifyContent: "center",
    alignItems: "center",
  },
  paw: { color: "#526d58", fontSize: 25, fontWeight: "700" },
  brandText: { flex: 1 },
  brand: {
    fontSize: 17,
    fontWeight: "800",
    color: "#263a2d",
    letterSpacing: -0.4,
  },
  brandSub: { fontSize: 10, color: "#87948a", marginTop: 1 },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: "#e6ddf1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontWeight: "800", color: "#7356a0" },
  demo: {
    backgroundColor: "#e7efe3",
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  demoText: { color: "#60786a", fontSize: 10, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingTop: 25 },
  contentWide: {
    paddingHorizontal: 42,
    paddingTop: 35,
    maxWidth: 850,
    width: "100%",
    alignSelf: "center",
  },
  headerTitle: { fontSize: 20 },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "800",
    color: "#91a396",
    marginBottom: 8,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -1.2,
    color: "#26382d",
  },
  wave: { color: "#88a68b" },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#839088",
    marginTop: 6,
    marginBottom: 23,
  },
  datePill: {
    borderWidth: 1,
    borderColor: "#dfe8de",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  dateText: { fontSize: 11, color: "#6d7e72", fontWeight: "700" },
  introCard: {
    backgroundColor: "#6c60a0",
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    minHeight: 215,
  },
  introTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  introLabel: {
    fontSize: 10,
    color: "#e1d9f3",
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  introTag: {
    fontSize: 10,
    color: "#fff",
    backgroundColor: "#8276b0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: "hidden",
  },
  introTitle: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#fff",
    marginTop: 18,
    maxWidth: 260,
    lineHeight: 29,
  },
  introBody: {
    fontSize: 12,
    color: "#e6e0f1",
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 290,
  },
  whiteButton: {
    backgroundColor: "#fff",
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginTop: 15,
  },
  whiteButtonText: { fontSize: 11, color: "#6d5d9d", fontWeight: "800" },
  introPaw: {
    position: "absolute",
    fontSize: 115,
    color: "#ffffff14",
    right: 7,
    bottom: -28,
  },
  metrics: { flexDirection: "row", gap: 9, marginTop: 14 },
  metric: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#edf1ea",
    borderRadius: 14,
    padding: 13,
  },
  metricNum: { fontSize: 22, fontWeight: "800", color: "#2e4233" },
  metricLabel: { fontSize: 10, color: "#93a096", marginTop: 4 },
  sectionHead: {
    marginTop: 30,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#26382d",
  },
  link: { fontSize: 11, fontWeight: "800", color: "#7968a6", paddingBottom: 3 },
  colonyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#edf1ea",
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 11 },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#eaf2e8",
    alignItems: "center",
    justifyContent: "center",
  },
  locationGlyph: { fontSize: 24, color: "#72947a" },
  grow: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#314236" },
  muted: { fontSize: 11, color: "#98a69b", marginTop: 4 },
  status: {
    fontSize: 9,
    fontWeight: "800",
    backgroundColor: "#f7f2ef",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: "#f0f2ef", marginVertical: 13 },
  row: { flexDirection: "row", gap: 25 },
  small: { fontSize: 11, color: "#839088" },
  strong: { fontWeight: "800", color: "#35483a" },
  cardNote: { fontSize: 11, color: "#98756c", marginTop: 12 },
  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#edf1ea",
  },
  searchText: { fontSize: 12, color: "#a1ada3" },
  formCard: {
    backgroundColor: "#fff",
    padding: 19,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#edf1ea",
  },
  formLabel: { fontSize: 14, fontWeight: "800", color: "#314236" },
  help: { fontSize: 11, color: "#98a69b", lineHeight: 17, marginTop: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 13 },
  chip: {
    borderWidth: 1,
    borderColor: "#e4ebe2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipSelected: { borderColor: "#8b79bd", backgroundColor: "#f2eef8" },
  chipText: { fontSize: 11, color: "#718277", fontWeight: "600" },
  chipTextSelected: { color: "#735a9c" },
  textarea: {
    borderWidth: 1,
    borderColor: "#e5ebe3",
    borderRadius: 12,
    minHeight: 130,
    padding: 13,
    marginTop: 12,
    textAlignVertical: "top",
    fontSize: 13,
    color: "#314236",
  },
  primary: {
    backgroundColor: "#7865a7",
    borderRadius: 12,
    alignItems: "center",
    padding: 14,
    marginTop: 22,
  },
  disabled: { opacity: 0.45 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  preview: {
    backgroundColor: "#f1f5ee",
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#314236",
    marginBottom: 6,
  },
  previewBody: { fontSize: 12, color: "#51675a", marginTop: 8, lineHeight: 18 },
  tip: {
    backgroundColor: "#e8f0e5",
    padding: 16,
    borderRadius: 14,
    marginTop: 13,
  },
  tipTitle: { fontWeight: "800", fontSize: 12, color: "#5d7762" },
  catCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#edf1ea",
  },
  catPortrait: {
    width: 74,
    height: 74,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  catInitial: { fontSize: 24, color: "#6a786a", fontWeight: "800" },
  catCaption: { fontSize: 8, color: "#829184", marginTop: 3 },
  catStatus: {
    fontSize: 10,
    color: "#7c6aa4",
    marginTop: 9,
    fontWeight: "700",
  },
  arrow: { fontSize: 17, color: "#a9b6aa", marginRight: 4 },
  task: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#edf1ea",
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1edf7",
    alignItems: "center",
    justifyContent: "center",
  },
  taskGlyph: { color: "#8f7bb9", fontSize: 20 },
  taskTag: { fontSize: 10, color: "#8d7ca9", fontWeight: "700" },
  footnote: { fontSize: 11, color: "#9aa89b", lineHeight: 17, marginTop: 12 },
  bottomSpacer: { height: 35 },
  nav: {
    height: 68,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#edf1ea",
    paddingTop: 5,
  },
  navItem: { alignItems: "center", flex: 1 },
  navIconWrap: {
    height: 31,
    minWidth: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  navActive: { backgroundColor: "#eeeaf5" },
  navIcon: { fontSize: 21, color: "#a2b0a4", fontWeight: "600" },
  navIconActive: { color: "#7964a8" },
  navLabel: { fontSize: 9, color: "#a3afa5", marginTop: 1, fontWeight: "600" },
  navLabelActive: { color: "#7964a8", fontWeight: "800" },
});
