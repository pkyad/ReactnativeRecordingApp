import React from 'react';
import { Platform, StatusBar, StyleSheet, View,AsyncStorage ,AppState} from 'react-native';
import { AppLoading } from 'expo';
import   * as Font  from 'expo-font';
import * as Icon   from '@expo/vector-icons';
import {  Asset } from 'expo-asset';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import store from './store';






 export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };


  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen ) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <Provider store = {store}>

        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar backgroundColor="black" barStyle="light-content" />}
          <AppNavigator />
        </View>
        </Provider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        ...Icon.Ionicons.font,
        'Roboto': require('./assets/fonts/Roboto-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
