import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function AddEmployeeScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/; 
    return phoneRegex.test(phone);
  };

  const handleAddEmployee = async () => {
    if (!firstName || !lastName || !position || !phoneNumber || !email) {
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
      await axios.post('http://192.168.41.43:5000/api/employees', {
        firstName,
        lastName,
        position,
        phoneNumber,
        email,
      });
      Alert.alert("עובד נוסף בהצלחה");
      navigation.goBack();
    } catch (error) {
      console.error('Error adding employee:', error);
      Alert.alert('Error', 'Could not add employee');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titlePage}>הוספת עובד חדש</Text>
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
        placeholder="תפקיד"
        value={position}
        onChangeText={setPosition}
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
      <Button title="הוסף עובד" onPress={handleAddEmployee} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
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
  },
});
