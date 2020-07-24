import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import initialNavigator from './MainTabNavigator';
import { createStackNavigator } from 'react-navigation-stack';
import LogInScreen from '../screens/LogInScreen';
import OtpScreen from '../screens/OtpScreen';
import LoginCheck from '../screens/LoginCheck';

const loginStack = createStackNavigator({
  LogInScreen: LogInScreen,
  OtpScreen: OtpScreen,
});

export default createAppContainer(createSwitchNavigator({
  LoginCheck:LoginCheck,
  LogIn: loginStack,
  Main: initialNavigator,
 },{
  initialRouteName:'LoginCheck'
}
));
