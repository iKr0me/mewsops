import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FICTIONAL_MAP_POINTS, MIAMI_CENTER } from './MiamiMap.data';

/** Native Google Maps on Android / Apple Maps on iOS; no user location requested. */
export default function MiamiMap() {
  return (
    <View style={styles.container}>
      <Text style={styles.notice}>Real Miami map · markers are fictional examples, not rescue sites.</Text>
      <MapView
        style={styles.map}
        accessibilityLabel="Interactive map of Miami with three fictional example markers"
        initialRegion={{ ...MIAMI_CENTER, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {FICTIONAL_MAP_POINTS.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.title}
            description="Fictional example — not an actual rescue location"
            accessibilityLabel={`${point.title}. Fictional example, not an actual rescue location.`}
          />
        ))}
      </MapView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { width: '100%', gap: 8 },
  notice: { fontSize: 13, lineHeight: 18, color: '#33474c' },
  map: { width: '100%', height: 320, borderRadius: 12 },
});
