import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, FlatList, Dimensions} from 'react-native';
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
      const employeeResponse = await axios.get(`http://${config.data}/api/employees`);
      const employeeData = employeeResponse.data.data;
      const userResponse = await axios.get(`http://${config.data}/api/users/1`);
      const userData = userResponse.data.data;

      const sortedData = employeeData.sort((a, b) => {
        return a.firstName.localeCompare(b.firstName);
      });

      const combinedData = sortedData.map(employee => ({
        ...employee,
        user: userData || null
      }));
      setEmployeeData(combinedData);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      Alert.alert('שגיאה', 'טעינת נתוני העובדים נכשלה. בדוק את החיבור שלך');
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
    for (let i = 0; i < 6; i++) {
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
    
    // בדוק אם יש עובדים שנבחרו
    let hasEmployees = false; // משתנה שיאשר אם יש עובדים
    weekDates.forEach((day, dayIndex) => {
        Object.entries(selectedEmployees[day.day] || {}).forEach(([timeOfDay, employees]) => {
            Object.entries(employees).forEach(([index, employeeId]) => {
                if (employeeId) { // אם עובד נבחר
                    hasEmployees = true; // עדכן את המשתנה
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
                }
            });
        });
    });

    // אם אין עובדים, הצג הודעה
    if (!hasEmployees) {
        Alert.alert('שגיאה', 'לא בחרת עובדות למשמרות' );
        return; // יציאה מהפונקציה
    }

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
              <Picker.Item label="בחרי עובדת" value="" />
              {employeeData.length > 0 ? (
                employeeData.map((employee) => (
                  <Picker.Item
                    key={employee.id}
                    label={`${employee.firstName} ${employee.lastName}`}
                    value={employee.id}
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
  
    const renderDay = ({ item: day, index }) => {
      const date = getWeekBoundaries(currentWeek)
      return (
        <View style={styles.boxContainer}>
          <Text style={styles.dayTextBox}>יום {day}</Text>
          <ScrollView style={styles.innerBox} contentContainerStyle={styles.scrollViewContent}>
            {/* אם זה יום שישי, מציגים רק בוקר */}
            {day === hebrewDays[5] ? (
              <View>
                <Text style={styles.timeOfDayText}>בוקר</Text>
                {renderPickerForShift(day, 'בוקר')}
              </View>
            ) : (
              ['בוקר', 'צהריים', 'ערב'].map((timeOfDay) => (
                <View key={timeOfDay}>
                  <Text style={styles.timeOfDayText}>{timeOfDay}</Text>
                  {renderPickerForShift(day, timeOfDay)}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      );
    };
    
    
  
  
    return (
      <View style={styles.container}>
        {loading ? (
        <View style={styles.loadingContainer}>
          {/* אין צורך להוסיף style ל-ActivityIndicator, מאפיינים כמו color ו-size מועברים ישירות */}
          <ActivityIndicator size={100} color={"rgba(55,128,212,1)"} />
          <Text style={styles.loadingText}>טוען נתונים...</Text>
        </View>
        ) : (
          <>
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
                <Text>{weekBoundaries.startOfWeek}</Text>
              </View>
              <TouchableOpacity onPress={() => changeWeek('prev')} style={styles.arrow} accessibilityLabel="Previous Week">
                <Text style={styles.arrowText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
    
            <TouchableOpacity onPress={handleSaveAndShare} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>שמור ושתף</Text>
            </TouchableOpacity>
    
            <FlatList
              data={hebrewDays.slice(0, -1)} // מסנן את האיבר האחרון
              renderItem={renderDay}
              keyExtractor={(item) => item}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContent}
              snapToAlignment="start"
              decelerationRate="fast"
              inverted // מאפשר גלילה מימין לשמאל
            />
          </>
        )}
      </View>
    );    
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      width: Dimensions.get('window').width - 20,
      height: '100%',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: "20%",
    },  
    loadingIndicator: {
      color: "rgba(55,128,212,255)",
      fontSize: 100,
    },
    loadingText: {
      marginTop: "10%",
      fontSize: 50, // גודל הטקסט
      color: 'rgba(55,128,212,255)', // צבע הטקסט (תוכל לשנות בהתאם לצורך)
      textAlign: 'center', // מרכז את הטקסט
    },
    weekRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dayContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      margin: 10,
      borderRadius: 8,
    },
    boxContainer: {
      width: Dimensions.get('window').width - 20,
      backgroundColor: 'rgba(169, 226, 245, 0.3)', // צבע הרקע של הקובייה
      marginLeft: 2,
      padding: 10,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    innerBox: {
      borderRadius: 5,
      width: '100%',
    },
    dayText: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      marginRight: 10,
    },
    dayTextBox: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      alignSelf: 'flex-end',
      marginRight: 10,
    },
    timeOfDayText: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10,
      textAlign: 'center',
      color: 'rgb(5, 94, 197)',
      textDecorationLine: 'underline',
    },
    pickerContainer: {
      width: '100%',
      marginVertical: 5,
      alignItems: 'center',
    },
    picker: {
      marginBottom: 15,
      width: 300,
      backgroundColor: '#eff5fb',
      borderColor: 'black',
      borderWidth: 5,
      borderRadius: 25,
    },
    arrow: {
      padding: 10,
    },
    arrowText: {
      fontSize: 24,
    },
    saveButton: {
      backgroundColor: 'rgba(55,128,212,255)',
      padding: 10,
      alignItems: 'center',
      margin: 10
    },
    saveButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    scrollViewContent: {
      alignItems: 'center',
    },
  });
  
  export default Timetable;
  