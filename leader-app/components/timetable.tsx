import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions} from 'react-native';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import config from '../config.json';
import { Shifts, Employee } from './interface';
import generatePDF from './creatTable';


dayjs.extend(weekOfYear);

const hebrewDays = [
  'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת',
];

const Timetable = () => {
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState({});

  const isFocused = useIsFocused();

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      // קריאה ל-API של העובדים
      const employeeResponse = await axios.get(`http://${config.data}/api/employees`);
      const employeeData = employeeResponse.data.data;
  
      // קריאה ל-API של משתמש ספציפי (למשל, עם ID 1)
      const userResponse = await axios.get(`http://${config.data}/api/users/1`);
      const userData = userResponse.data.data; // הנח שיש שדה 'data' בתגובה
  
      // מיון נתוני העובדים לפי שם פרטי
      const sortedData = employeeData.sort((a: Employee, b: Employee) => {
        return a.firstName.localeCompare(b.firstName);
      });
  
      // שלב נתוני עובדים עם המידע על המשתמש
      const combinedData = sortedData.map(employee => ({
        ...employee,
        user: userData || null // הוספת מידע על המשתמש
      }));
      setEmployeeData(combinedData);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      Alert.alert('Error', 'Failed to load employee data.');
    } finally {
      setLoading(false);
    }
  };
  
  
// פונקציה לשליחת הקצאות משמרות
function sendShiftAssignment(shiftData) {
  fetch(`http://${config.data}/api/shifts/assign`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(shiftData) // שליחת shiftData בפורמט JSON
  })
  .then(response => {
      if (!response.ok) {
          // אם התגובה לא תקינה, זריקת שגיאה
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // ניתוח תגובת JSON
  })
  .then(data => {
      console.log('Success:', data); // הצלחה
  })
  .catch((error) => {
      console.error('Error:', error); // טיפול בשגיאה
  });
}

// פונקציה להוספת משמרות בטווח תאריכים
const sendShiftRangeQuery = async (startDate, endDate) => {
  console.log('Start Date:', startDate);
  console.log('End Date:', endDate);
  
  // בדיקות בסיסיות על התאריכים
  if (!startDate || !endDate) {
      console.error('Error: Start date and end date must be provided.');
      return { success: false, error: 'Both start and end dates are required.' };
  }

  // המרת תאריכים לפורמט חוקי
  const formattedStartDate = startDate.split('/').reverse().join('-');
  const formattedEndDate = endDate.split('/').reverse().join('-');
  
  if (new Date(formattedStartDate) >= new Date(formattedEndDate)) {
      console.error('Error: Start date must be before end date.');
      return { success: false, error: 'Start date must be before end date.' };
  }

  try {
      const response = await fetch(`http://${config.data}/api/shifts/range`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ startDate, endDate }),
      });

      if (response.ok) {
          const data = await response.json();
          console.log('Shifts added successfully:', data.message);
          return { success: true, data };
      } else {
          const errorData = await response.json();
          console.error('Error:', errorData.error);
          return { success: false, error: errorData.error };
      }
  } catch (error) {
      console.error('Error sending request:', error);
      return { success: false, error: error.message };
  }
};


// פונקציה למחיקת הקצאות משמרות בטווח תאריכים
const deleteShiftAssignmentsInRange = async (startDate, endDate) => {
  try {
    const response = await fetch(`http://${config.data}/api/shifts/range`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate }), // שליחת טווח התאריכים בפורמט JSON
    });

    if (!response.ok) {
      return; // יציאה מוקדמת אם יש בעיה בתגובה
    }

    const data = await response.json(); // ניתוח JSON במקרה של הצלחה
    console.log('Shifts deleted successfully:', data.message); // הצלחה
    return data;
  } catch (error) {
    console.error('Error deleting shift assignments:', error.message); // טיפול בשגיאה
    throw error; // זריקת שגיאה אם קרתה
  }
};


  useEffect(() => {
    if (isFocused) {
      fetchEmployeeData();
      const { startOfWeek, endOfWeek } = getWeekBoundaries(currentWeek);
      deleteShiftAssignmentsInRange(startOfWeek, endOfWeek);
      sendShiftRangeQuery(startOfWeek, endOfWeek);
    }
  }, [isFocused]);

  const getWeekDates = (week) => {
    const startOfWeek = week.startOf('week');
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push({
        day: hebrewDays[i],
        date: startOfWeek.add(i, 'day').format('DD/MM'),
        isFriday: hebrewDays[i] === 'שישי',
      });
    }
    return weekDates;
  };

  const getWeekBoundaries = (week) => {
    return {
      startOfWeek: week.startOf('week').format(' DD/MM/YY'),
      endOfWeek: week.endOf('week').format(' DD/MM/YY'),
    };
  };

  const weekBoundaries = getWeekBoundaries(currentWeek);
  const weekDates = getWeekDates(currentWeek);

  const changeWeek = async (direction) => {
    let newWeek = currentWeek;
    if (direction === 'prev') {
      newWeek = currentWeek.subtract(1, 'week');
    } else if (direction === 'next') {
      newWeek = currentWeek.add(1, 'week');
    }
    setCurrentWeek(newWeek);
    const { startOfWeek, endOfWeek } = getWeekBoundaries(newWeek);
    sendShiftRangeQuery(startOfWeek, endOfWeek);
    deleteShiftAssignmentsInRange(startOfWeek, endOfWeek)
  };

  const handleEmployeeChange = (day, timeOfDay, pickerIndex, employeeId) => {
    setSelectedEmployees((prevSelected) => ({
      ...prevSelected,
      [day]: {
        ...(prevSelected[day] || {}),
        [timeOfDay]: {
          ...(prevSelected[day]?.[timeOfDay] || {}),
          [pickerIndex]: employeeId,
        },
      },
    }));
  };

  const handleSaveAndShare = async () => {
    const { startOfWeek, endOfWeek } = getWeekBoundaries(currentWeek);
    await deleteShiftAssignmentsInRange(startOfWeek, endOfWeek);
    const allSelectedData = [];
    
    weekDates.forEach((day, dayIndex) => {
      Object.entries(selectedEmployees[day.day] || {}).forEach(([timeOfDay, employees]) => {
        Object.entries(employees).forEach(([index, employeeId]) => {
          const employee = employeeData.find(emp => emp.id === employeeId);
          if (employee) {
            const fullName = `${employee.firstName} ${employee.lastName}`;
            const nameParts = fullName.split(' ');
  
            const lastName = nameParts.pop(); // שם משפחה
            const firstName = nameParts.join(' '); // שאר השמות הם שם פרטי
            const date = currentWeek.startOf('week').add(dayIndex, 'day').format('DD/MM/YY'); // הוספת התאריך של המשמרת

            allSelectedData.push([
              index,          // אינדקס
              firstName,      // שם פרטי
              lastName,       // שם משפחה
              timeOfDay,      // משמרת
              date,
            ]);
          }
        });
      });
    });
  
    console.log(allSelectedData);
    sendShiftAssignment(allSelectedData);
    generatePDF(startOfWeek, allSelectedData);
  };
  
  
  const renderPickerForShift = (day, timeOfDay) => {
    return (
      <View style={styles.pickerContainer}>
        {[1, 2, 3].map((index) => (
          <Picker
            key={index}
            selectedValue={selectedEmployees[day]?.[timeOfDay]?.[index] || ''}
            onValueChange={(itemValue) => handleEmployeeChange(day, timeOfDay, index, itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="בחר עובד" value="" />
            {employeeData.length > 0 ? (
              employeeData.map((employee) => (
                <Picker.Item
                  key={employee.id}
                  label={`${employee.firstName} ${employee.lastName}`} // ודא שהשדות נכונים
                  value={employee.id} // ודא שזה מזהה ייחודי
                />
              ))
            ) : (
              <Picker.Item label="אין עובדים זמינים" value="" />
            )}
          </Picker>
        ))}
      </View>
    );
  };
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.weekRow}>
        <TouchableOpacity onPress={() => changeWeek('next')} style={styles.arrow} accessibilityLabel="Next Week">
          <Text style={styles.arrowText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.dayContainer}>
          <Text style={styles.dayText}>{hebrewDays[6]}</Text>
          <Text>{weekBoundaries.endOfWeek}</Text>
        </View>
        <View style={styles.dayContainer}>
          <Text style={styles.dayText}>{hebrewDays[0]}</Text>
          <Text >{weekBoundaries.startOfWeek}</Text>
        </View>
        <TouchableOpacity onPress={() => changeWeek('prev')} style={styles.arrow} accessibilityLabel="Previous Week">
          <Text style={styles.arrowText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSaveAndShare} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>שמור ושתף</Text>
      </TouchableOpacity>

      {hebrewDays.map((day) => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayText}>{day}</Text>
          {['בוקר', 'צהריים', 'ערב'].map((timeOfDay) => (
            <View key={timeOfDay} style={styles.shiftContainer}>
              <Text style={styles.shiftText}>{timeOfDay}</Text>
              {renderPickerForShift(day, timeOfDay)}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    width: Dimensions.get('window').width - 15,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrow: {
    padding: 10,
  },
  arrowText: {
    fontSize: 24,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shiftContainer: {
    marginBottom: 15,
    
  },
  shiftText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  picker: {
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Timetable;