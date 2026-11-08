import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FICTIONAL_MAP_POINTS, MIAMI_CENTER, type MiamiMapProps } from './MiamiMap.data';
export type { MiamiMapPoint, MiamiMapProps } from './MiamiMap.data';

export default function MiamiMap({ points = FICTIONAL_MAP_POINTS, selectedId, onSelect }: MiamiMapProps = {}) {
  const [internalId, setInternalId] = useState<string | null>(null);
  const activeId = selectedId === undefined ? internalId : selectedId;
  const select = (id: string) => { if (selectedId === undefined) setInternalId(id); onSelect?.(id); };
  return <View style={styles.container}>
    <Text style={styles.notice}>Miami streets · demo colony positions are illustrative, not actual rescue sites.</Text>
    <MapView style={styles.map} accessibilityLabel="Miami map of example colony locations" initialRegion={{ ...MIAMI_CENTER, latitudeDelta: 0.06, longitudeDelta: 0.06 }} showsUserLocation={false} showsMyLocationButton={false}>
      {points.map(point => <Marker key={point.id} coordinate={{ latitude: point.latitude, longitude: point.longitude }} title={point.title} description="Illustrative location" pinColor={activeId === point.id ? '#7c3218' : '#d97437'} onPress={() => select(point.id)} />)}
    </MapView>
    <Text style={styles.label}>Colony list · select a colony</Text>
    {points.length === 0 ? <Text style={styles.notice}>No colonies available to display.</Text> : points.map(point => <Pressable key={point.id} accessibilityRole="button" accessibilityState={{ selected: activeId === point.id }} onPress={() => select(point.id)} style={[styles.item, activeId === point.id && styles.selected]}><Text style={styles.itemText}>{point.title}{activeId === point.id ? ' · Selected' : ''}</Text></Pressable>)}
  </View>;
}
const styles = StyleSheet.create({
  container: { width: '100%', gap: 8 }, notice: { fontSize: 13, lineHeight: 18, color: '#493b30' }, map: { width: '100%', height: 320, borderRadius: 12 }, label: { fontSize: 14, fontWeight: '700', color: '#261c17' }, item: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderWidth: 1, borderColor: '#d5c3aa', backgroundColor: '#fffcf4' }, selected: { borderColor: '#8d3f1c', backgroundColor: '#f7dfc0' }, itemText: { fontSize: 15, color: '#261c17' },
});
