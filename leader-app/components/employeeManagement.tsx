import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

// הגדרת סוג הנתונים של עובד
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  phoneNumber: string;
  email: string;
}

// קומפוננטת ניהול עובדים
export default function EmployeeManagement() {
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // פונקציה להורדת נתוני העובדים מהשרת
  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get('http://10.100.102.95:5000/api/employees');
      setEmployeeData(response.data.data); // מגדיר את מצב הנתונים
      setLoading(false); // מנתק את מצב הטעינה
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setLoading(false); // מנתק את מצב הטעינה גם במקרה של שגיאה
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const handlePress = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLongPress = (id: number) => {
    Alert.alert(
      "מחק אובייקט",
      "האם אתה בטוח שברצונך למחוק את האובייקט?",
      [
        {
          text: "לא",
          style: "cancel"
        },
        {
          text: "כן",
          onPress: () => deleteItem(id)
        }
      ]
    );
  };

  const deleteItem = (id: number) => {
    setEmployeeData(employeeData.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => handlePress(item.id)}
        onLongPress={() => handleLongPress(item.id)}
        style={styles.row}
      >
        <Text style={styles.arrow}>{expandedId === item.id ? '▲' : '▼'}</Text>
        <Text style={[
          styles.name,
          expandedId === item.id && styles.nameExpanded
        ]}>{item.firstName} {item.lastName}</Text>
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
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
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
    padding: 20,
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
