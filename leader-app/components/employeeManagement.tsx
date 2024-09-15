import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  phoneNumber: string;
  email: string;
}

export default function EmployeeManagement({ navigation }) {
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFocused = useIsFocused(); // Hook to check if screen is focused

  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get('http://192.168.41.43:5000/api/employees');
      const sortedData = response.data.data.sort((a: Employee, b: Employee) => {
        return a.firstName.localeCompare(b.firstName);
      });
      setEmployeeData(sortedData); 
    } catch (error) {
      console.error('Error fetching employee data:', error);
      Alert.alert('שגיאה', 'לא הצלחנו לטעון את נתוני העובדים.');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (isFocused) {
      setLoading(true); // Ensure loading is shown each time the screen is focused
      fetchEmployeeData();
    }
  }, [isFocused]);

  const handlePress = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLongPressLine = (id: number) => {
    Alert.alert(
      "מחק אובייקט",
      "האם אתה בטוח שברצונך למחוק את האובייקט?",
      [
        { text: "לא", style: "cancel" },
        { text: "כן", onPress: () => deleteItem(id) }
      ],
      { cancelable: true }
    );
  };

  const deleteItem = async (id: number) => {
    try {
      await axios.delete(`http://192.168.41.43:5000/api/employees/${id}`);
      setEmployeeData(employeeData.filter(item => item.id !== id));
    } catch (error) {
      console.error('שגיאה במחיקת עובד:', error);
      Alert.alert('שגיאה', 'לא הצלחנו למחוק את העובד.');
    }
  };

  const handleLongPressImage = (id: number) => {
    Alert.alert(
      'בפיתוח אפשרות הוספת תמונה'
      // 'בחר פעולה',
      // 'בחר אם להוסיף תמונה מהגלריה או לצלם חדשה',
    //   [
    //     {
    //       text: 'גלריה',
    //       onPress: () => launchImageLibrary({ mediaType: 'photo' }, (response) => {
    //         if (response.assets) {
    //           const uri = response.assets[0].uri;
    //           // כאן תוכל להוסיף את הקוד להעלאת התמונה לשרת או לעדכן את פרטי העובד
    //           console.log(`תמונה נבחרה מהגלריה: ${uri}`);
    //         }
    //       }),
    //     },
    //     {
    //       text: 'מצלמה',
    //       onPress: () => launchCamera({ mediaType: 'photo' }, (response) => {
    //         if (response.assets) {
    //           const uri = response.assets[0].uri;
    //           // כאן תוכל להוסיף את הקוד להעלאת התמונה לשרת או לעדכן את פרטי העובד
    //           console.log(`תמונה צולמה: ${uri}`);
    //         }
    //       }),
    //     },
    //     { text: 'ביטול', style: 'cancel' },
    //   ],
    //   { cancelable: true }
    );
  };

  const renderItem = useCallback(({ item }: { item: Employee }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => handlePress(item.id)}
        onLongPress={() => handleLongPressLine(item.id)}
        style={styles.row}
      >
        <Text style={styles.arrow}>{expandedId === item.id ? '▲' : '▼'}</Text>
        <Text style={[
          styles.name,
          expandedId === item.id && styles.nameExpanded
        ]}>{item.firstName} {item.lastName}</Text>
        <TouchableOpacity
          onLongPress={() => handleLongPressImage(item.id)}
        >
          <Image
            source={require('../assets/employeePhoto.png')} 
            style={styles.image}
          />
        </TouchableOpacity>
      </TouchableOpacity>
      {expandedId === item.id && (
        <View style={styles.detailsContainer}>
          <Text style={styles.details}>
            <Text style={styles.detailsLabel}>תפקיד: </Text>
            {item.position}
          </Text>
          <Text style={styles.details}>
            <Text style={styles.detailsLabel}>טלפון: </Text>
            {item.phoneNumber}
          </Text>
          <Text style={styles.details}>
            <Text style={styles.detailsLabel}>אימייל: </Text>
            {item.email}
          </Text>
        </View>
      )}
    </View>
  ), [expandedId, employeeData]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titlePage}>ניהול עובדים</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('addEmployee')}
      >
        <Text style={{ color: 'white', fontSize: 20 }}>הוספת עובד חדש</Text>
      </TouchableOpacity>
      <FlatList
        data={employeeData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white'
  },
  titlePage: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#0751a6',
    borderBottomWidth: 5, 
    borderBottomColor: '#0751a6' 
  },  
  addButton: {
    backgroundColor: '#0751a6',
    padding: 15,
    borderRadius: 10,
    width: 200,
    marginBottom: 40,
  },
  itemContainer: {
    width: 350,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    backgroundColor: '#eff5fb',
    marginBottom: 15,
    minHeight: 60,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  name: {
    fontSize: 16,
    color: "#20272e",
    fontWeight: 'bold',
  },
  nameExpanded: {
    fontSize: 16,
    color: "#1e72c5",
    fontWeight: 'bold',
  },
  image: {
    width: 40, 
    height: 40, 
    resizeMode: 'contain', 
  },
  arrow: {
    fontSize: 16,
  },
  detailsContainer: {
    padding: 10,
    backgroundColor: '#ffffffb8',
  },
  details: {
    fontSize: 14,
    color: '#000000',
  },
  detailsLabel: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
});
