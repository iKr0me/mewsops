# Mobile design round 2

Selected reference: [PAWDEX by Martin Milenkovski](https://dribbble.com/shots/27424855-PAWDEX). The user selected its visual direction while retaining cream and ginger and a sleepy black-cat mascot. Original component artwork and implementation; no reference artwork copied.

Today uses bold display hierarchy, pixel accents, structured cards, a persistent Report action and an enlarged animated mascot with pause/reduced-motion support. About retains the earlier introductory screen. Other screens still require design alignment.

MiamiMap selects native react-native-maps or web Leaflet/OSM. Markers are fictional and currently independent of the sample colony record selection. No user GPS requested. See component notes for native configuration and tile-provider limitations.

API client is prepared but not wired to the UI. Demo login is loopback-only; native authentication and backend connectivity remain unresolved. No report submission is implied by the preview. Actual Android Expo Go verification is pending. Web Today rendering was inspected, but map tile interaction and actual animation behavior were not verified by a still screenshot.

Continue user screenshot feedback before treating this as final design acceptance.
