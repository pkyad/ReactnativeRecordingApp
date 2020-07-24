import React from 'react';
import { Platform ,Image,View,TouchableOpacity} from 'react-native';
import { FontAwesome ,Ionicons,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons} from '@expo/vector-icons';
import { createAppContainer,createSwitchNavigator,withNavigation} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator,DrawerItems } from 'react-navigation-drawer';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import HomeScreen from '../screens/HomeScreen';
import VideoScreen from '../screens/VideoScreen';
import InitialScreen from '../screens/InitialScreen';
import LogInScreen from '../screens/LogInScreen';
import OtpScreen from '../screens/OtpScreen';

const stackNavigator = createStackNavigator(
  {
    InitialScreen: InitialScreen,
    HomeScreen: HomeScreen,
    VideoScreen: VideoScreen,
  },
  {
    initialRouteName: 'InitialScreen',
  }
);



export default createAppContainer(stackNavigator);
