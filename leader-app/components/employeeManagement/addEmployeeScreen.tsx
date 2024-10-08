import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { ScrollView } from 'react-native-gesture-handler';
import config from '../../config.json';


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
      // הסרת רווחים מיותרים
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedPosition = position.trim();
      const trimmedPhoneNumber = phoneNumber.trim();
      const trimmedEmail = email.trim();
    
      const response = await axios.post(`http://${config.data}/api/employees`, {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          phoneNumber: trimmedPhoneNumber,
          email: trimmedEmail,
      }, { timeout: 3000 });
    
      // אם ההוספה הצליחה, החזר את המשתמש לדף הקודם
      if (response.status === 201) {
        Alert.alert("עובד נוסף בהצלחה");
        navigation.goBack(); // חזרה לדף הקודם
      } else if (response.data.message) {
        // אם יש הודעה מהשרת (במקרה של מייל קיים)
        Alert.alert(response.data.message);
      }
    } catch (error) {
      console.error('שגיאה בהוספת עובד:', error);
      Alert.alert('שגיאה', 'לא ניתן להוסיף עובד');
    }
    
    
  };
  

  return (
    <ScrollView>
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
          onPress={() => handleAddEmployee()}>
          <Text style={styles.buttonText}>הוספת עובד</Text>
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
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#0751a6',
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: 12,
  }
});
