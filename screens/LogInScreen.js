import React from 'react';
import {
  Image,Platform,Switch,
  ScrollView,StyleSheet,
  Text,Button,TextInput,NativeModules,
  TouchableOpacity,View,Animated,
  Slider,ImageBackground,LayoutAnimation,
  Dimensions, Alert,StatusBar,
  FlatList, AppState, BackHandler ,
  AsyncStorage,ActivityIndicator,
  ToastAndroid,RefreshControl,TouchableWithoutFeedback,TouchableNativeFeedback} from 'react-native';
import { createDrawerNavigator,DrawerItems, } from 'react-navigation-drawer';
import {SearchBar,Card}from 'react-native-elements';
import {Fontisto, FontAwesome,Entypo,SimpleLineIcons,MaterialCommunityIcons,Feather,Octicons,MaterialIcons,FontAwesome5 } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { SharedElement } from 'react-navigation-shared-element';
import Modal from "react-native-modal";
import TabComponent  from '../components/TabComponent.js';
import { createFluidNavigator, Transition } from 'react-navigation-fluid-transitions';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import * as Permissions from 'expo-permissions';
import * as Contacts from 'expo-contacts';
import { Camera } from 'expo-camera';
import { Audio, Video } from "expo-av";
import FloatingInput from '../components/FloatingInput';
import { Notifications } from 'expo';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
const themeColor = settings.themeColor

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);



class LogInScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {header:null}
  };

  constructor(props) {
    super(props);
    this.state={
        mobile:'',
        otp:null,
        otpDetails:null,
        loader:false,
        contacts:[],
        myContact:null,
        list:[]
      }
      willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
          // this.getOtp()
        }
     );
  }


  getOtp=async()=>{
    var mob = /^[1-9]{1}[0-9]{9}$/;
    if (mob.test(this.state.mobile) == false) {
      ToastAndroid.showWithGravityAndOffset(
        'Enter Correct Mobile No',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        200
      )
      return
    }
    var deviceId = Constants.deviceId
    var token = await Notifications.getExpoPushTokenAsync();
    console.log(token,'ghjdhkmk');
    console.log(SERVER_URL + '/generateExternalOTP/?mobile='+this.state.mobile+'&deviceid='+token,'deviceId');
    // return
    // return
    this.setState({loader:true})
    fetch(SERVER_URL + '/generateExternalOTP/?mobile='+this.state.mobile+'&deviceid='+token,{
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
      }
    })
   .then((response) =>{
     console.log(response.status,'jjjjjjj');
     if(response.status==200||response.status==201){
       return  response.json()
     }else{
       return  undefined
     }
   })
   .then((responseJson) => {
     console.log(responseJson,'gnsdjnmk');
     this.setState({loader:false})
     if(responseJson!=undefined){
      // this.setState({otpDetails:responseJson,otp:responseJson.otp})
      // this.props.navigation.navigate('OtpScreen',{mobile:this.state.mobile})
      this.props.navigation.navigate('OtpScreen',{otpDetails:responseJson,mobile:this.state.mobile})
      // this.verifyOtp(responseJson.otp)
      }else{
        return
      }
    })
   .catch((error) => {
     this.setState({loader:false})
     return
   });
  }

askNotification=async()=>{
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;

   if (existingStatus !== 'granted') {
     const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
     finalStatus = status;
   }
}



  componentDidMount(){
     this.askNotification()
  }

  renderLogin=()=>{
     return(
       <View style={{flexDirection: 'row',width:width,alignItems: 'center',justifyContent:'center',marginBottom:15,}}>
          <TouchableOpacity onPress={()=>this.getOtp()} style={{ flex:1,borderRadius:3,borderWidth:1,borderColor:themeColor,height:45,alignItems:'center',justifyContent:'center',marginHorizontal:15,backgroundColor:themeColor}}>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:20,}}>Login</Text>
          </TouchableOpacity>
     </View>
     )
   }

  render() {

    return (
     <View style={{flex:1}}>
         <View style={{height:Constants.statusBarHeight,backgroundColor:themeColor}}>
             <StatusBar  translucent={true} barStyle="light-content" backgroundColor={themeColor} networkActivityIndicatorVisible={false}    />
         </View>
         {this.state.loader&&
           <View style={{flex:1,backgroundColor:'#ffff',alignItems:'center',justifyContent:'center'}}>
              <ActivityIndicator color={themeColor} size='large'/>
           </View>
         }
         {!this.state.loader&&
           <View style={{flex:1,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}}>
            <Text style={{textAlign:'center',fontSize:20,color:'#000',marginHorizontal:20,fontWeight:'700',marginBottom:30}}>LOGIN</Text>
             <View style={{marginHorizontal:20,marginBottom:20}}>
                <TouchableOpacity onPress={()=>this.mobileRef.focus()} activeOpacity={1.0} style={[styles.inputStyle,{borderRadius: 3,borderWidth: 1,borderColor: '#fff',backgroundColor:'#fff',}]}>
                  <View style={{flex:0.15,alignItems: 'center',justifyContent: 'center',backgroundColor:themeColor,borderTopLeftRadius:3,borderBottomLeftRadius: 3,borderWidth:1,borderRightWidth:0,borderColor:themeColor}}>
                   <Text style={{color:'#fff',fontSize:16,fontWeight:'700'}}>+91</Text>
                  </View>
                  <View style={{flex:0.85,alignItems: 'center',justifyContent: 'center',height:'100%',paddingHorizontal: 10, paddingVertical: 5,borderWidth:1,borderColor:themeColor,borderTopRightRadius:3,borderBottomRightRadius: 3,}}>
                    <FloatingInput
                      label="Mobile"
                      value={this.state.mobile}
                      onChangeText={text => this.setState({mobile:text})}
                      outputRange = {'#a2a2a2'}
                      passWord={false}
                      email={false}
                      type={false}
                      onRef={(ref) =>{this.mobileRef = ref}}
                    />
                 </View>
                </TouchableOpacity>
              </View>
              {this.renderLogin()}
           </View>
         }
      </View>
    )

  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  camera: {
   flex: 1
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
  modalView: {
     backgroundColor: '#fff',
     marginHorizontal: width*0.1 ,
     borderRadius:5,
  },
  inputStyle:{
 height: 50,
 width:'100%',
 borderRadius:3,
 fontSize: 16,
 flexDirection: 'row',
 borderWidth:1,
 borderColor:themeColor
},
});

const mapStateToProps =(state) => {
    return {
      videos: state.cartItems.videos,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addVideo:  (args) => dispatch(actions.addVideo(args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogInScreen);
