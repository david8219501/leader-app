import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Data from '../data.json';

// פונקציה לקביעת הודעת הברכה
const getGreeting = () => {
  const currentHour = new Date().getHours();
  const userName = Data.user.name;

  let greeting;
  if (currentHour < 12) {
    greeting = `שלום ${userName}\nבוקר טוב`;
  } else if (currentHour < 17) {
    greeting = `שלום ${userName}\nצהריים טובים`;
  } else if (currentHour < 21) {
    greeting = `שלום ${userName}\nערב טוב`;
  } else {
    greeting = `שלום ${userName}\nלילה טוב`;
  }

  return greeting;
};

export default function WelcomePage() {
  const greetingText = getGreeting().split('\n');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        <Text style={styles.greetingPart1}>{greetingText[0]}</Text>
        {'\n'}
        <Text style={styles.greetingPart2}>{greetingText[1]}</Text>
      </Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button('#9bc0ee')} onPress={() => console.log('Button Pressed!')}>
          <MaterialIcons name="calendar-today" size={30} color="#2e6eb7" />
          <Text style={styles.buttonText}>מערכת שעות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button('#e1b0e3')} onPress={() => console.log('Button Pressed!')}>
          <MaterialIcons name="group" size={30} color="#2e6eb7" />
          <Text style={styles.buttonText}>ניהול עובדים</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button('#b6ecf0')} onPress={() => console.log('Button Pressed!')}>
          <MaterialIcons name="settings" size={30} color="#42658d" />
          <Text style={styles.buttonText}>הגדרות</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2e6eb7',
    fontFamily: 'ComicSansMS',
    marginBottom: 10,
    textAlign: 'center',
  },
  greetingPart1: {
    fontWeight: 'bold',
  },
  greetingPart2: {
    fontWeight: 'normal',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: (color) => ({
    backgroundColor: color,
    padding: 20,
    borderRadius: 75,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  }),
  buttonText: {
    fontSize: 20,
    color: 'gray',
    fontFamily: 'ComicSansMS',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
