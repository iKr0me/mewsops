import { Stack } from 'expo-router';
import { DemoAccessProvider } from '../state/DemoAccess';
export default function RootLayout(){return <DemoAccessProvider><Stack screenOptions={{headerShown:false,animation:'fade'}}/></DemoAccessProvider>;}
