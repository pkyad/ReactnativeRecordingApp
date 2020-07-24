import React from 'react';
import {
  Image,Platform,
  ScrollView,StyleSheet,
  Text,Button,TextInput,
  TouchableOpacity,View,
  Slider,ImageBackground,
  Dimensions, Alert,StatusBar,
  FlatList, AppState, BackHandler ,
  AsyncStorage,ActivityIndicator,
  ToastAndroid,RefreshControl,TouchableNativeFeedback,TouchableWithoutFeedback} from 'react-native';
import { createDrawerNavigator,DrawerItems, } from 'react-navigation-drawer';
import { FontAwesome,Entypo,MaterialIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { LinearGradient } from 'expo-linear-gradient';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { Card } from 'react-native-elements';


const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const themeColor = settings.themeColor

class LoginCheck extends React.Component {

  static navigationOptions = ({ navigation }) => {
       const { params = {} } = navigation.state
       return {header:null}
  };

  constructor(props) {
    super(props);
    this.state={

    }
  }

  getUser=async()=>{
      var login = await AsyncStorage.getItem("login")
      var userPk = await AsyncStorage.getItem("userpk")
      console.log(userPk,'lll');
      if(JSON.parse(login)&&JSON.parse(userPk)!=null){
        this.setState({loader:true})
        fetch(SERVER_URL + '/api/HR/users/'+JSON.parse(userPk)+'/')
       .then((response) =>{
         return response.json()
       })
       .then((responseJson) => {
         console.log(responseJson,'mmmmmmmmmmmmmmmm');
         if(responseJson!=undefined){
           if(responseJson.is_staff){
             return  this.props.navigation.navigate('Main')
           }else if(responseJson.profile.typ=='moderator'){
             return  this.props.navigation.navigate('Moderator',{moderator:true})
           }else{
             return  this.props.navigation.navigate('Main')
           }
         }else{
              this.props.navigation.navigate('LogIn')
         }
         // this.setState({loader:false,showStoreRegister:true})
         // this.props.navigation.navigate('LogIn')
        })
       .catch((error) => {
         // this.setState({loader:false,showStoreRegister:true})
         this.props.navigation.navigate('LogIn')
         return
       });
     }
  }



checkLogin=async()=>{
   var login = await AsyncStorage.getItem("login")
   var myContact = await AsyncStorage.getItem("myContact")
   if(JSON.parse(login)&&JSON.parse(myContact)!=null){
     this.props.navigation.navigate('Main')
   }else{
     return  this.props.navigation.navigate('LogInScreen')
   }
}


componentDidMount(){
  this.checkLogin()
}

render() {
    return (
      <View style={{flex:1,backgroundColor:'#f2f2f2'}}>

        <View style={{height:Constants.statusBarHeight,backgroundColor:themeColor}}>
          <StatusBar  translucent={true} barStyle="light-content" backgroundColor={themeColor} networkActivityIndicatorVisible={false}    />
        </View>

        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
             <ActivityIndicator size={'large'} color={themeColor} />
        </View>

      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 0,
  },

});

const mapStateToProps =(state) => {
    return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginCheck);
