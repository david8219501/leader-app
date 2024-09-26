import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import config from '../../config.json';

type RootStackParamList = {
  editEmployee: { employee: Employee };
};

type EditEmployeeScreenRouteProp = RouteProp<RootStackParamList, 'editEmployee'>;

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  phoneNumber: string;
  email: string;
}

export default function EditEmployeeScreen() {
  const route = useRoute<EditEmployeeScreenRouteProp>();
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState(route.params.employee.firstName);
  const [lastName, setLastName] = useState(route.params.employee.lastName);
  const [position, setPosition] = useState(route.params.employee.position);
  const [phoneNumber, setPhoneNumber] = useState(route.params.employee.phoneNumber);
  const [email, setEmail] = useState(route.params.employee.email);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleUpdateEmployee = async () => {
    if (!firstName || !lastName || !phoneNumber || !email) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('שגיאה', 'פורמט אימייל לא חוקי.');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('שגיאה', 'מספר פלאפון לא חוקי. יש להזין 10 ספרות.');
      return;
    }

    try {
      // הסרת רווחים מיותרים בשמות ובפרטים
      const employeeData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
      };

      // שליחת בקשה לעדכון העובד לפי ID
      await axios.put(`http://${config.data}/api/employees/${route.params.employee.id}`, employeeData, { timeout: 3000 });

      Alert.alert("העובד עודכן בהצלחה");
      navigation.goBack();
    } catch (error) {
      console.error('Error updating employee:', error);
      Alert.alert('שגיאה', 'לא ניתן לעדכן את העובד');
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.titlePage}>עריכת פרטי עובד</Text>
        <TextInput
          placeholder="שם פרטי"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <TextInput
          placeholder="שם משפחה"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <TextInput
          placeholder="פלאפון"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="מייל"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
        <TouchableOpacity
          onPress={handleUpdateEmployee}
          style={styles.button}
        >
          <Text style={styles.buttonText}>שמור שינויים</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    minWidth: '100%',
    padding: 16,
  },
  titlePage: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#0751a6',
    borderBottomWidth: 5, 
    borderBottomColor: '#0751a6' 
  },  
  input: {
    width: 350,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    backgroundColor: '#eff5fb',
    minHeight: 60,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#83bdff',
  },
  button: {
    backgroundColor: '#0751a6',
    padding: 15,
    borderRadius: 10,
    width: 200,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  }
});
