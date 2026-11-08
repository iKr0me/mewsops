import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMewsFont } from '../components/MewsDesign';
import { Action, Arrow, CollectionShell, colors, Filters, Reveal, styles as s } from './CollectionUI';
const needs = [
  { id: 'R01', colonyId: 'colony-1', colony: 'Mangrove Lantern', title: 'LIMPING REPORTED', type: 'Care', label: 'Reported injury', observed: 'Nov 8 · 7:10 AM ET', received: 'Nov 8 · 7:18 AM ET', quote: 'Fed the colony at 7:10. A cat is limping.', identity: 'Identity unresolved', next: 'Review the original observation and arrange an appropriate staff follow-up. A report is not a diagnosis.' },
  { id: 'R02', colonyId: 'colony-2', colony: 'Coral Courtyard', title: 'KITTEN SIGHTING', type: 'Care', label: 'Reported sighting', observed: 'Time unknown', received: 'Nov 8 · 8:05 AM ET', quote: 'I saw two small kittens near the shelter.', identity: 'Identity unresolved', next: 'Ask the team to review the sighting. Keep the confirmed count unchanged until identities are reviewed.' },
  { id: 'R03', colonyId: 'colony-3', colony: 'Banyan Cove', title: 'FEEDER COVERAGE', type: 'Coverage', label: 'Visit needs checking', observed: 'Time unknown', received: 'Nov 8 · 8:20 AM ET', quote: 'I cannot cover the next visit. Can someone check coverage? I do not know when the colony was last fed.', identity: 'No individual cat involved', next: 'Check with the team about the next visit. Missing records do not establish that cats were not fed.' },
] as const;
export default function NeedsScreen() {
  const { display } = useMewsFont();
  const { colonyId } = useLocalSearchParams<{ colonyId?: string }>();
  const [filter, setFilter] = useState('All needs');
  const [open, setOpen] = useState<string | null>(null);
  const scoped = needs.filter(n => !colonyId || n.colonyId === colonyId);
  const visible = scoped.filter(n => filter === 'All needs' || n.type === filter);
  return <CollectionShell active="/tasks" title="A LITTLE" accent="ATTENTION" intro="Original reports first. Identity decisions stay with the team." notice="DEMO · Fictional reports. Nothing is assigned or resolved here.">
    {colonyId && <Action label="Show needs from all colonies" onPress={() => router.replace('/tasks')} style={local.clear}><Text style={s.body}>← All colonies</Text></Action>}
    <Filters options={['All needs', 'Care', 'Coverage']} value={filter} onChange={value => { setFilter(value); setOpen(null); }} />
    <Text accessibilityLiveRegion="polite" style={s.sectionMeta}>{visible.length} {visible.length === 1 ? 'REPORT' : 'REPORTS'} TO REVIEW</Text>
    {visible.map(need => <View style={s.card} key={need.id}>
      <Action label={`${need.title}, ${need.colony}, observed ${need.observed}, ${need.identity}. ${open === need.id ? 'Hide' : 'Read'} original report`} expanded={open === need.id} onPress={() => setOpen(open === need.id ? null : need.id)} style={local.row}>
        <View style={local.main}><View style={local.top}><Text style={s.label}>{need.id} / {need.label}</Text><Text style={local.marker}>{need.type === 'Care' ? '!' : '↗'}</Text></View><Text style={[s.cardTitle, display]}>{need.title}</Text><Text style={s.body}>{need.colony}</Text><Text style={s.label}>Observed {need.observed}</Text><View style={s.badge}><Text style={s.badgeText}>{need.identity}</Text></View></View><Arrow open={open === need.id} />
      </Action>
      {open === need.id && <Reveal><View style={s.detail}><Text style={s.label}>ORIGINAL REPORT</Text><Text selectable style={local.quote}>“{need.quote}”</Text><Text style={s.label}>Received {need.received}</Text><Text style={s.body}>{need.next}</Text><Action label="Open a follow-up report preview" onPress={() => router.push('/update')} style={s.darkAction}><Text style={[s.darkActionText, display]}>ADD AN UPDATE</Text><Text style={s.darkActionText}>→</Text></Action></View></Reveal>}
    </View>)}
    {!visible.length && <View style={s.empty}><Text style={[s.cardTitle, display]}>NOTHING IN THIS FILTER</Text><Text style={s.body}>Try another category or return to all colonies.</Text><Action label="Clear needs filters" onPress={() => { setFilter('All needs'); router.replace('/tasks'); }}><Text style={local.link}>Show all needs →</Text></Action></View>}
  </CollectionShell>;
}
const local = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 12 }, main: { flex: 1, gap: 8 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, marker: { color: colors.orange, fontSize: 20, fontWeight: '700' }, quote: { color: colors.ink, fontSize: 18, lineHeight: 27 }, clear: { justifyContent: 'center', marginBottom: 10 }, link: { color: colors.orange, fontWeight: '600', paddingVertical: 12 } });
