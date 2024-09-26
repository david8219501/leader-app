import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { ScrollView } from 'react-native-gesture-handler';
import config from '../config.json';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Login({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleAddEmployee = async () => {
    if (!firstName || !lastName || !password || !confirmPassword || !phoneNumber || !email) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות.');
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
      // שלח את הנתונים לשרת כדי להוסיף את המשתמש
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedPhoneNumber = phoneNumber.trim();
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim(); // הסרת רווחים גם מהסיסמה
  
      await axios.post(`http://${config.data}/api/users`, {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          phoneNumber: trimmedPhoneNumber,
          email: trimmedEmail,
          password: trimmedPassword,
          is_connected: true,
      }, { timeout: 3000 });
  
      navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
      });
  } catch (error) {
      console.error('Error:', error);
      Alert.alert('שגיאה', 'לא ניתן להוסיף את הנתונים');
  }
  
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.titlePage}>כניסה למערכת</Text>
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
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="סיסמה"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconButton}
          >
            <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="אימות סיסמה"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            style={styles.iconButton}
          >
            <Icon name={isConfirmPasswordVisible ? 'eye-slash' : 'eye'} size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleAddEmployee}
          style={styles.button}
        >
          <Text style={styles.buttonText}>כניסה למערכת</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  titlePage: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#0751a6',
    borderBottomWidth: 5,
    borderBottomColor: '#0751a6',
  },
  input: {
    width: '100%',
    maxWidth: 350,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    marginBottom: 12,
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  button: {
    backgroundColor: '#0751a6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    maxWidth: 350,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  }
});
