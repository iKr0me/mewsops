import TodayTracker from '../components/TodayTracker';
import { WelcomeScreen } from '../components/EntryScreens';
import { useDemoAccess } from '../state/DemoAccess';
export default function Today(){const {entered}=useDemoAccess();return entered?<TodayTracker/>:<WelcomeScreen/>;}
