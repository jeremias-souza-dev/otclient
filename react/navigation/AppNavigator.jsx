import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider } from '../context/AuthContext';
import LoginScreen           from '../screens/LoginScreen';
import RegisterScreen        from '../screens/RegisterScreen';
import CharacterSelectScreen from '../screens/CharacterSelectScreen';
import LoadingScreen         from '../screens/LoadingScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0d0d0d' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login"           component={LoginScreen}          />
          <Stack.Screen name="Register"         component={RegisterScreen}        />
          <Stack.Screen name="CharacterSelect"  component={CharacterSelectScreen} />
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{ gestureEnabled: false }} // impede voltar com swipe
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
