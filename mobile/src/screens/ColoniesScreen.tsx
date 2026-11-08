import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MiamiMap from '../components/MiamiMap';
import { FICTIONAL_MAP_POINTS } from '../components/MiamiMap.data';
import { useMewsFont } from '../components/MewsDesign';
import { Action, Arrow, CollectionShell, colors, Filters, Reveal, styles as s } from './CollectionUI';

const colonies = [
  { id: 'colony-1', code: '01', name: 'Mangrove Lantern', area: 'Little River', cats: 4, fixed: 2, unknown: 2, concern: 'Reported limping', type: 'Care concern', note: 'A reported injury needs staff review. Cat identity remains unresolved.' },
  { id: 'colony-2', code: '02', name: 'Coral Courtyard', area: 'Buena Vista', cats: 4, fixed: 1, unknown: 3, concern: 'Kittens reported', type: 'Care concern', note: 'A sighting mentions kittens. The report does not establish new confirmed identities.' },
  { id: 'colony-3', code: '03', name: 'Banyan Cove', area: 'Allapattah', cats: 3, fixed: 1, unknown: 2, concern: 'Feeder coverage', type: 'Coverage', note: 'The next feeding visit needs checking. No feeding time is recorded in this example.' },
] as const;
export default function ColoniesScreen() {
  const { display } = useMewsFont();
  const [filter, setFilter] = useState('All colonies');
  const { colonyId } = useLocalSearchParams<{ colonyId?: string }>();
  const [open, setOpen] = useState<string | null>(colonyId ?? null);
  const [showMap, setShowMap] = useState(false);
  const visible = colonies.filter(c => filter !== 'Coverage' || c.type === 'Coverage');
  return <CollectionShell active="/colonies" title="OUR LITTLE" accent="COLONIES" intro="A simple view of each colony and what needs a closer look." notice="DEMO · Fictional colonies and counts. No live updates.">
    <Filters options={['All colonies', 'Coverage']} value={filter} onChange={value => { setFilter(value); setOpen(null); }} />
    <Action label={showMap ? 'Hide colony map' : 'Show colony map'} expanded={showMap} onPress={() => setShowMap(value => !value)} style={local.mapToggle}><Text style={s.body}>{showMap ? 'Hide map −' : 'View colonies on a map →'}</Text></Action>
    {showMap && <View style={local.map}><MiamiMap points={FICTIONAL_MAP_POINTS} selectedId={open} onSelect={id => { setFilter('All colonies'); setOpen(id); }} /></View>}
    <Text style={s.sectionMeta}>{visible.length} COLONIES · SELECT TO SEE DETAILS</Text>
    {visible.map(colony => <View key={colony.id} style={s.card}>
      <Action label={`${colony.name}, ${colony.cats} confirmed cats, ${colony.concern}. ${open === colony.id ? 'Hide' : 'Show'} colony details`} expanded={open === colony.id} onPress={() => setOpen(open === colony.id ? null : colony.id)} style={local.row}>
        <View style={local.code}><Text style={[local.codeText, display]}>{colony.code}</Text></View>
        <View style={local.main}><Text style={[s.cardTitle, display]}>{colony.name.toUpperCase()}</Text><Text style={s.label}>{colony.area} · {colony.cats} confirmed cats</Text><View style={s.badge}><Text style={s.badgeText}>{colony.concern}</Text></View></View>
        <Arrow open={open === colony.id} />
      </Action>
      {open === colony.id && <Reveal><View style={s.detail}>
        <View style={local.metrics}><View><Text style={[local.metric, display]}>{colony.fixed}</Text><Text style={s.label}>Confirmed fixed</Text></View><View><Text style={[local.metric, display]}>{colony.unknown}</Text><Text style={s.label}>TNR unknown</Text></View></View>
        <Text style={s.body}>{colony.note}</Text><Text style={s.label}>Last recorded feeding: unknown</Text>
        <Action label={`View needs for ${colony.name}`} onPress={() => router.push({ pathname: '/tasks', params: { colonyId: colony.id } })} style={s.darkAction}><Text style={[s.darkActionText, display]}>VIEW COLONY NEEDS</Text><Text style={s.darkActionText}>→</Text></Action>
      </View></Reveal>}
    </View>)}
  </CollectionShell>;
}
const local = StyleSheet.create({ mapToggle: { justifyContent: 'center', marginBottom: 12 }, map: { marginBottom: 18 }, row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }, code: { width: 35, height: 35, backgroundColor: colors.ginger, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }, codeText: { fontSize: 26, color: colors.ink }, main: { flex: 1, gap: 9 }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 32 }, metric: { fontSize: 36, color: colors.ink } });
