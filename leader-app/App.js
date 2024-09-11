import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import BackrondApp from './components/backrondApp';
import WelcomePage from './components/welcomePage';

export default function App() {
  return (
    <BackrondApp>
      <StatusBar hidden={true} />
      <WelcomePage />
    </BackrondApp>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
