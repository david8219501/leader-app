import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

// פונקציה להורדת נתוני המשתמש מהשרת
const fetchUserData = async () => {
  try {
    const response = await axios.get('http://10.100.102.95:5000/api/users/1'); 
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// פונקציה ליצירת ברכה לפי שעה
const getGreeting = (firstName) => {
  const currentHour = new Date().getHours();

  let greeting;
  if (currentHour < 12) {
    greeting = `שלום ${firstName}\nבוקר טוב`;
  } else if (currentHour < 17) {
    greeting = `שלום ${firstName}\nצהריים טובים`;
  } else if (currentHour < 21) {
    greeting = `שלום ${firstName}\nערב טוב`;
  } else {
    greeting = `שלום ${firstName}\nלילה טוב`;
  }
  return greeting;
};

// קומפוננטת המסך הראשי
export default function WelcomePage({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchUserData();
      setUser(data);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!user) {
    return <Text>Failed to load user data</Text>;
  }

  const greetingText = getGreeting(user.firstName).split('\n');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        <Text style={styles.greetingPart1}>{greetingText[0]}</Text>
        {'\n'}
        <Text style={styles.greetingPart2}>{greetingText[1]}</Text>
      </Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button('#9bc0ee')} onPress={() => navigation.navigate('timetable')}>
          <MaterialIcons name="calendar-today" size={30} color="#2e6eb7" />
          <Text style={styles.buttonText}>מערכת שעות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button('#e1b0e3')} onPress={() => navigation.navigate('employeeManagement')}>
          <MaterialIcons name="group" size={30} color="#2e6eb7" />
          <Text style={styles.buttonText}>ניהול עובדים</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button('#a0e0e1')} onPress={() => navigation.navigate('settings')}>
          <MaterialIcons name="settings" size={30} color="#42658d" />
          <Text style={styles.buttonText}>הגדרות</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// סגנונות הקומפוננטה
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
