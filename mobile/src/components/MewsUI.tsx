import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, type TextProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MewsBottomNav, MewsButton, MewsColors, MewsHeader, useMewsFont, type MewsRoute } from "./MewsDesign";
export { MewsColors, MewsMono, PixelIcon, useMewsFont } from "./MewsDesign";
export const Action = MewsButton;
export function PixelText({ size=36, style, ...props }: TextProps & {size?: number}) {
  const {display}=useMewsFont();
  return <Text {...props} style={[{color:MewsColors.ink,fontSize:size,lineHeight:size, ...display},style]}/>;
}
export function Screen({title,subtitle,children,active}: {title:string;subtitle?:string;children:ReactNode;active?:MewsRoute}) {
  const {fontsLoaded,fontError}=useMewsFont();
  return <SafeAreaView style={styles.safe} edges={["top","bottom","left","right"]}><StatusBar style="dark"/><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><MewsHeader/><PixelText accessibilityRole="header" size={46} style={styles.title}>{title}</PixelText>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}{!fontsLoaded && <Text style={styles.notice}>{fontError?"Pixel font unavailable · fallback shown":"Loading pixel type…"}</Text>}{children}</ScrollView><MewsBottomNav active={active}/></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:MewsColors.cream},content:{width:"100%",maxWidth:760,alignSelf:"center",paddingHorizontal:18,paddingBottom:28},title:{marginTop:16,marginBottom:12},subtitle:{fontSize:15,lineHeight:23,color:MewsColors.muted,marginBottom:20},notice:{fontSize:12,color:MewsColors.orange,marginBottom:10}});
