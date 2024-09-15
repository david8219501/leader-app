// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import WelcomePage from './welcomePage';
import EmployeeManagement from './employeeManagement'; 
import BackgroundApp from './backgroundApp';
import Settings from './settings';
import Timetable from './timetable';
import AddEmployeeScreen from './addEmployeeScreen'; // יבוא המסך החדש

const Stack = createStackNavigator();

function ScreenWrapper({ children }) {
  return <BackgroundApp>{children}</BackgroundApp>;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome">
          {props => (
            <ScreenWrapper>
              <WelcomePage {...props} />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="employeeManagement">
          {props => (
            <ScreenWrapper>
              <EmployeeManagement {...props} />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="settings">
          {props => (
            <ScreenWrapper>
              <Settings {...props} />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="timetable">
          {props => (
            <ScreenWrapper>
              <Timetable {...props} />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="addEmployee">
          {props => (
            <ScreenWrapper>
              <AddEmployeeScreen {...props} />
            </ScreenWrapper>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
