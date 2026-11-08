import { useState } from 'react';
import { Image, Linking, StyleSheet, Text, TextInput, View, type ImageSourcePropType } from 'react-native';
import { useMewsFont } from '../components/MewsDesign';
import { Action, Arrow, CollectionShell, colors, Reveal, styles as s } from './CollectionUI';

const cats = [
  { id: '01', title: 'ORANGE TABBY', coat: 'Orange & white', image: require('./assets/orange-tabby.jpg'), short: 'Striped orange coat, white muzzle and pink nose.', traits: 'Orange stripes across the forehead and cheeks. White muzzle and chest, a pink nose, and pale whiskers. The cat is lying on its side in this photograph.', credit: 'Miscellaneous contributor', source: 'https://commons.wikimedia.org/wiki/File:Orange_tabby_cat_closeup_(2).jpg' },
  { id: '02', title: 'BLACK & WHITE', coat: 'Tuxedo markings', image: require('./assets/tuxedo-cat.jpg'), short: 'Dark face, narrow white nose mark and white chest.', traits: 'Black coat with a white chest and paws. A narrow white mark runs down the nose. Pale green-yellow eyes and long white whiskers are visible.', credit: 'Ryan Schwark', source: 'https://commons.wikimedia.org/wiki/File:Tuxedo_cat,_front_view.png' },
] as const;
function CatPhoto({ source, label, full = false }: { source: ImageSourcePropType; label: string; full?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return <View style={[local.photoFrame, full && local.fullFrame]}>
    {failed ? <View style={local.photoError}><Text style={s.body}>Photo unavailable</Text><Action label={`Retry photo: ${label}`} onPress={() => { setAttempt(value => value + 1); setFailed(false); }}><Text style={local.link}>Retry →</Text></Action></View> : <Image key={attempt} source={source} accessibilityLabel={label} resizeMode={full ? 'contain' : 'cover'} style={local.photo} onError={() => setFailed(true)} />}
  </View>;
}
export default function CatsScreen() {
  const { display } = useMewsFont();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [credits, setCredits] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const visible = cats.filter(cat => `${cat.title} ${cat.coat} ${cat.short}`.toLowerCase().includes(query.trim().toLowerCase()));
  const openSource = async (url: string) => { try { await Linking.openURL(url); setLinkError(false); } catch { setLinkError(true); } };
  return <CollectionShell active="/cats" title="THE CAT" accent="INDEX" intro="Look closer at the small details that make each face distinct." notice="DEMO · Licensed illustrative photos, not rescue records. Descriptions show visible traits only.">
    <View style={local.search}><Text style={local.searchIcon} accessible={false}>⌕</Text><TextInput accessibilityLabel="Search cats by visible feature" placeholder="Search coat, color or markings" placeholderTextColor={colors.muted} value={query} onChangeText={value => { setQuery(value); setOpen(null); }} style={local.input} autoCorrect={false} returnKeyType="search" />{query.length > 0 && <Action label="Clear cat search" onPress={() => setQuery('')} style={local.clear}><Text style={s.body}>×</Text></Action>}</View>
    <Text accessibilityLiveRegion="polite" style={s.sectionMeta}>{visible.length} PHOTO {visible.length === 1 ? 'PROFILE' : 'PROFILES'}</Text>
    {visible.map(cat => <View key={cat.id} style={s.card}>
      <View style={local.row}>
        <View style={local.imageColumn}><CatPhoto source={cat.image} label={cat.short} /><View style={local.id}><Text style={[local.idText, display]}>{cat.id}</Text></View></View>
        <View style={local.main}><Text accessibilityRole="header" style={[s.cardTitle, display]}>{cat.title}</Text><Text style={s.label}>{cat.coat}</Text><Text style={local.description}>{cat.short}</Text><Action label={`${open === cat.id ? 'Hide' : 'Show'} visible features and full photo of ${cat.title.toLowerCase()}`} expanded={open === cat.id} onPress={() => setOpen(open === cat.id ? null : cat.id)} style={local.detailsButton}><Text style={local.detailsLabel}>Look closer</Text><Arrow open={open === cat.id} /></Action></View>
      </View>
      {open === cat.id && <Reveal><View style={s.detail}><CatPhoto source={cat.image} label={cat.traits} full /><Text style={s.label}>VISIBLE FEATURES</Text><Text style={s.body}>{cat.traits}</Text><Text style={s.label}>Photo: {cat.credit} · CC0</Text><Action label={`Open original photo source by ${cat.credit}`} onPress={() => { void openSource(cat.source); }}><Text style={local.link}>View original photograph ↗</Text></Action></View></Reveal>}
    </View>)}
    {!visible.length && <View style={s.empty}><Text style={[s.cardTitle, display]}>NO MATCHING FEATURES</Text><Text style={s.body}>Try “orange”, “white” or “nose”.</Text><Action label="Show all cat photos" onPress={() => setQuery('')}><Text style={local.link}>Show both profiles →</Text></Action></View>}
    <Action label="Photo credits and licenses" expanded={credits} onPress={() => setCredits(value => !value)} style={local.creditsButton}><Text style={s.label}>PHOTO CREDITS & LICENSES</Text><Text style={s.body}>{credits ? '−' : '+'}</Text></Action>
    {credits && <Reveal><View style={local.credits}>{cats.map(cat => <Action key={cat.id} label={`View ${cat.title.toLowerCase()} source and CC0 license`} onPress={() => { void openSource(cat.source); }}><Text style={s.body}>{cat.title.toLowerCase()} — {cat.credit}</Text><Text style={s.label}>Wikimedia Commons · CC0 1.0 ↗</Text></Action>)}<Text style={s.body}>These photographs illustrate coat patterns. No age, health, rescue history or colony membership is inferred.</Text></View></Reveal>}
    {linkError && <Text accessibilityRole="alert" style={s.body}>The source link could not open. Please try again.</Text>}
  </CollectionShell>;
}
const local = StyleSheet.create({ search: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, marginBottom: 16, minHeight: 50 }, searchIcon: { fontSize: 27, color: colors.ink, paddingHorizontal: 12 }, input: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 14, paddingVertical: 14, paddingRight: 10 }, clear: { width: 48, alignItems: 'center', justifyContent: 'center' }, row: { flexDirection: 'row', gap: 13, padding: 8, alignItems: 'center' }, imageColumn: { width: '41%', alignSelf: 'flex-start' }, photoFrame: { width: '100%', aspectRatio: 1, backgroundColor: '#EADCC5', overflow: 'hidden' }, photo: { width: '100%', height: '100%' }, fullFrame: { aspectRatio: 1, maxHeight: 420 }, photoError: { flex: 1, padding: 8, justifyContent: 'center' }, id: { position: 'absolute', left: -8, top: -8, backgroundColor: colors.ginger, borderWidth: 1, borderColor: colors.ink, paddingHorizontal: 7, paddingVertical: 3 }, idText: { fontSize: 22, color: colors.ink }, main: { flex: 1, minWidth: 0, gap: 7 }, description: { color: colors.ink, fontSize: 13, lineHeight: 19 }, detailsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 }, detailsLabel: { color: colors.muted, fontSize: 12, flexShrink: 1 }, link: { color: colors.orange, fontSize: 14, paddingVertical: 12 }, creditsButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }, credits: { gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line } });
