import { StatusBar } from 'expo-status-bar';
import AppNavigator from './components/appNavigator';
export default function App() {
  return (
    <>
      <StatusBar hidden={true} />
      <AppNavigator />
    </>
  );
}
