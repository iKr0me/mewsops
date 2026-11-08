import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MewsHeader, MewsBottomNav, useMewsFont, MewsColors, MewsMono } from '../components/MewsDesign';

export const colors = MewsColors;
export const mono = MewsMono;
const ReducedMotion = createContext(true);
export function CollectionShell({ active, title, accent, intro, notice, children }: PropsWithChildren<{ active: '/colonies' | '/cats' | '/tasks'; title: string; accent: string; intro: string; notice: string }>) {
  const { display, fontsLoaded, fontError } = useMewsFont();
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);
  return <ReducedMotion.Provider value={reduced}><SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <MewsHeader />
      <View style={styles.headingRow}>
        <Text accessibilityRole="header" style={[styles.heading, display]}>{title}{'\n'}<Text style={styles.orange}>{accent}</Text></Text>
        <View style={styles.steps} accessible={false} importantForAccessibility="no-hide-descendants">{[0, 1, 2, 3].map(i => <View key={i} style={[styles.step, { left: i * 10, bottom: i * 10 }]} />)}</View>
      </View>
      <Text style={styles.intro}>{intro}</Text>
      <Text style={styles.notice}>{notice}</Text>
      {!fontsLoaded && <Text style={styles.label}>{fontError ? "Pixel font unavailable · system type shown" : "Loading pixel type…"}</Text>}
      {children}
    </ScrollView>
    <MewsBottomNav active={active} />
  </SafeAreaView></ReducedMotion.Provider>;
}

/** A short reveal ties newly opened details to their trigger; no idle motion. */
export function Reveal({ children }: PropsWithChildren) {
  const reduced = useContext(ReducedMotion);
  const [progress] = useState(() => new Animated.Value(reduced ? 1 : 0));
  useEffect(() => {
    progress.stopAnimation();
    if (reduced) { progress.setValue(1); return; }
    const animation = Animated.timing(progress, { toValue: 1, duration: 160, useNativeDriver: true, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [progress, reduced]);
  return <Animated.View style={{ opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>{children}</Animated.View>;
}

export function Action({ label, onPress, children, expanded, selected, style }: PropsWithChildren<{ label: string; onPress: () => void; expanded?: boolean; selected?: boolean; style?: StyleProp<ViewStyle> }>) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded, selected }} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.action, style, focused && styles.focus, pressed && styles.pressed]}>{children}</Pressable>;
}
export function Arrow({ open = false }: { open?: boolean }) { return <View style={styles.arrowBox} accessible={false}><Text style={styles.arrow}>{open ? '−' : '→'}</Text></View>; }
export function Filters({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <View style={styles.filters}>{options.map(option => <Action key={option} label={`Filter: ${option}`} selected={value === option} onPress={() => onChange(option)} style={[styles.filter, value === option && styles.filterSelected]}><Text style={[styles.filterText, value === option && styles.filterSelectedText]}>{option}</Text></Action>)}</View>;
}
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream }, page: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 28 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, marginBottom: 12 }, heading: { fontSize: 56, lineHeight: 48, color: colors.ink, flex: 1 }, orange: { color: colors.orange }, steps: { width: 64, height: 64, marginLeft: 10 }, step: { position: 'absolute', width: 22, height: 22, backgroundColor: colors.ginger },
  intro: { color: colors.ink, fontSize: 15, lineHeight: 22, marginBottom: 12 }, notice: { color: colors.muted, fontFamily: mono, fontSize: 11, lineHeight: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 9, marginBottom: 18 },
  action: { minHeight: 48, borderWidth: 2, borderColor: 'transparent' }, focus: { borderColor: colors.orange }, pressed: { opacity: 0.7 }, arrowBox: { width: 32, height: 32, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }, arrow: { color: colors.cream, fontSize: 24, lineHeight: 28 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, filter: { paddingHorizontal: 13, justifyContent: 'center', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, filterSelected: { backgroundColor: colors.ink, borderColor: colors.ink }, filterText: { fontSize: 13, color: colors.ink }, filterSelectedText: { color: colors.cream },
  sectionMeta: { color: colors.muted, fontFamily: mono, fontSize: 11, lineHeight: 16, marginBottom: 10 }, card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, marginBottom: 12 }, cardTitle: { color: colors.ink, fontSize: 31, lineHeight: 30 }, body: { color: colors.ink, fontSize: 14, lineHeight: 21 }, muted: { color: colors.muted }, detail: { borderTopWidth: 1, borderTopColor: colors.line, padding: 14, gap: 12 }, label: { fontFamily: mono, fontSize: 11, color: colors.muted, lineHeight: 16 }, badge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 5, borderWidth: 1, borderColor: '#CAA777' }, badgeText: { color: colors.ink, fontSize: 12, lineHeight: 16 },
  darkAction: { backgroundColor: colors.ink, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, darkActionText: { color: colors.cream, fontSize: 23 }, empty: { padding: 22, borderWidth: 1, borderColor: colors.line, gap: 9 },
});
