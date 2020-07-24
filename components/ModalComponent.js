import React from 'react';
import {
  Image,Platform,Switch,
  ScrollView,StyleSheet,
  Text,Button,TextInput,
  TouchableOpacity,View,
  Slider,ImageBackground,
  Dimensions, Alert,StatusBar,
  FlatList, AppState, BackHandler ,
  AsyncStorage,ActivityIndicator,
  ToastAndroid,RefreshControl,NativeModules,LayoutAnimation,Animated,TouchableWithoutFeedback} from 'react-native';
import { createDrawerNavigator,DrawerItems, } from 'react-navigation-drawer';
import {SearchBar,Card}from 'react-native-elements';
import {Fontisto, FontAwesome,Entypo,SimpleLineIcons,MaterialCommunityIcons } from '@expo/vector-icons';
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


const { width,height } = Dimensions.get('window');

const SERVER_URL = settings.url
const themeColor = settings.themeColor

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);


const data = [
  {img:require('../assets/images/ag_marvel_image.jpg'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/amaze.195_1.png'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/glass.jpg'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/crystal_nxt.jpg'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/mtds.jpg'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/mtds.jpg'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/enhance_-_ro_uv_uf_mtds-450x450.jpg'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/enhance_-_ro_uv_uf_mtds-450x450.jpg'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/menu-product.jpg'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,},
  {img:require('../assets/images/nrich_front_3.png'),name:'Fusion Hot N Ambient N Cold Water Purifier',mrp:850,price:700,}
]

class ModalComponent extends React.Component {

  constructor(props) {
    super(props);
    var show = props.show
    this.state={
      AnimatedValue:new Animated.Value(0),
      show:show
    }
    }

  setValue=()=>{


  }
  static getDerivedStateFromProps(props, state) {
    console.log(props,state);
    if (props.show !== state.show) {
      Animated.timing(this.state.AnimatedValue,{
        toValue:props.show?1:0,
        duration:300,
        useNativeDriver:true
      }).start()
      return {
        show: props.show,
      };
    }

    return null;
  }


  componentDidMount(){

  }

  gotoDetails=(item)=>{

  }


  render() {

    const modalStyle = {
      position:'absolute',
      width:width,
      height:height*0.6,
      left:0,
      bottom:0,
      right:0,
      transform:[
        {
          translateY:this.state.AnimatedValue.interpolate({
            inputRange:[0.01,0.80],
            outputRange:[50,55],
          })
        },
        {
          scale:this.state.AnimatedValue.interpolate({
            inputRange:[0.01,0.80],
            outputRange:[0.8,1],
          })
        }
      ]
    }


    return (
      <Animated.View style={[modalStyle,{backgroundColor:'#f2f2f2',zIndex:9}]}>

      </Animated.View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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

});



export default ModalComponent;
