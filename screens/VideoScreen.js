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
import { ScreenOrientation } from 'expo';
import { Camera } from 'expo-camera';
import { Audio, Video } from "expo-av";

const { width,height } = Dimensions.get('window');
// const height = width * 0.8
const SERVER_URL = settings.url
const themeColor = settings.themeColor

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);



class VideoScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {header:null}
  };

  constructor(props) {
    super(props);
    var toContact = props.navigation.getParam('toContact',null)
    var myContact = props.navigation.getParam('myContact',null)
    this.state={
      details:null,
      fullScreen:null,
      resizeMode:'cover',
      isPause:true,
      shouldPlay:true,
      onError:false,
      errText:'Playback error',
      landscape:false,
      myContact:myContact,
      toContact:toContact,
      }
      willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
        }
     );
     // this.handleCameraRef = this.handleCameraRef.bind(this);
     // this.video = null
     // this.isRecording = false
    }

    handleBackButtonClick=()=> {
     this.props.navigation.goBack();
     return true;
   };

   componentWillMount() {
       BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
   }

   componentWillUnmount() {
       BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
   }

    componentDidMount() {
      var details = this.props.navigation.getParam('details',null)
      if(details!=null){
        this.setState({details:details})
      }
    }

    playPause=(video)=>{
   this.setState({isPause:!this.state.isPause})
   if (this.playbackInstance != null) {
       if (this.state.isPause) {
         this.playbackInstance.pauseAsync();
       } else {
         this.playbackInstance.playAsync();
       }
   }
 }

 onPlaybackStatusUpdate=(status)=>{
   console.log(status,'lllllll');
   if (status.isLoaded) {
     this.setState({
       playbackInstancePosition: status.positionMillis,
       playbackInstanceDuration: status.durationMillis,
       shouldPlay: status.shouldPlay,
       onError:false,
       isPause:status.isPlaying
   });
 }
 else{
   this.setState({isPause:false});
 }
}

 getSeekSliderPosition=()=> {
  if (this.playbackInstance != null &&this.state.playbackInstancePosition != null &&this.state.playbackInstanceDuration !=null) {
    return (this.state.playbackInstancePosition /this.state.playbackInstanceDuration);
  }
  return 0;
 }

 onSeekSliderValueChange = value => {
   if (this.playbackInstance != null && !this.isSeeking) {
     this.isSeeking = true;
     this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
     this.playbackInstance.pauseAsync();
   }
 };

 onSeekSliderSlidingComplete = async value => {
   if (this.playbackInstance != null) {
     this.isSeeking = false;
     const seekPosition = value * this.state.playbackInstanceDuration;
     if (this.shouldPlayAtEndOfSeek) {
       this.playbackInstance.playFromPositionAsync(seekPosition);
     } else {
       this.playbackInstance.setPositionAsync(seekPosition);
     }
   }
 };

 getMMSSFromMillis(millis) {
   const totalSeconds = millis / 1000;
   const seconds = Math.floor(totalSeconds % 60);
   const minutes = Math.floor(totalSeconds / 60);

   const countDown = number => {
     const string = number.toString();
     if (number < 10) {
       return "0" + string;
     }
     return string;
   };
   return countDown(minutes) + ":" + countDown(seconds);
}

 getTimestamp() {
   if (this.playbackInstance != null &&this.state.playbackInstancePosition != null &&this.state.playbackInstanceDuration !=null) {
     return `${this.getMMSSFromMillis(this.state.playbackInstancePosition)} / ${this.getMMSSFromMillis(this.state.playbackInstanceDuration)}`;
   }
   return '00:00';
}

 onLoadStart = () => {
   console.log('ON LOAD START');
 };

 onLoad = status => {
  console.log(status,'lllllll');
 };

 onError = error => {
   this.setState({onError:true})
 };

 addVideo=async()=>{
   // var video = {attachment:this.state.details,thumbnail:require('../assets/images/robot-dev.png'),type:'out'}
   // this.props.addVideo(video);
   // this.props.navigation.state.params.onGoBack()
   // this.props.navigation.goBack()
   if(this.state.toContact.id==undefined){
     var mobile = this.state.toContact.mobile
   }else{
     var mobile = this.state.toContact.phoneNumbers[0].number
   }
   const type = 'video/mp4'
   const uri = this.state.details
   const name = this.state.details.split('/').pop();
   var strMobile = mobile.toString()
    if(strMobile.includes('+')){
      strMobile = strMobile.substring(3,strMobile.length)
    }
     var formdata = new FormData();
     var video = {
       name:name,
       type:type,
       uri:uri,
     }
     var attach = {
       attach : video
     }
     formdata.append("attach",video);
     formdata.append("from",this.state.myContact.number);
     formdata.append("to",strMobile);
     console.log(formdata,this.state.myContact,SERVER_URL + '/sendExternalMessage/?from='+this.state.myContact.number+'&to='+strMobile,'nsdjnbfgjd');

     // try {
     //      let response = await fetch(SERVER_URL + '/sendExternalMessage/?from='+this.state.myContact.number+'&to='+strMobile, {
     //          method: 'POST',
     //          headers: {
     //            'Content-Type': 'multipart/form-data',
     //            'Accept': 'application/json',
     //            'Referer': SERVER_URL,
     //          },
     //          body: formData
     //      });
     //      var res=  await response.json();
     //      if(res!=undefined){
     //        this.props.navigation.state.params.onGoBack()
     //        this.props.navigation.goBack()
     //      }
     //    }
     //    catch (error) {
     //      ToastAndroid.showWithGravity(
     //            'Some thing went wrong',
     //            ToastAndroid.SHORT,
     //            ToastAndroid.CENTER,
     //          )
     //          return
     //    }

     await fetch(SERVER_URL + '/sendExternalMessage/?from='+this.state.myContact.number+'&to='+strMobile, {
       method: 'POST',
       headers: {
         'Content-Type': 'multipart/form-data',
         'Accept': 'application/json',
         'Referer': '/sendExternalMessage/?from='+this.state.myContact.number+'&to='+strMobile,
       },
       body:formdata
       })
       .then((response) =>{
         console.log(response.status,'bdsbgfrj');
         if(response.status==200||response.status==201){
           return response.json()
         }else{
           return undefined
         }
       })
       .then((responseJson) => {
         console.log(responseJson,'hfsgm');
          if(responseJson!=undefined){
            this.props.navigation.state.params.onGoBack()
            this.props.navigation.goBack()
          }else{
            ToastAndroid.showWithGravity(
              'Some thing went wrong',
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
            )
            return
          }
       })
       .catch((error) => {
         ToastAndroid.showWithGravity(
           'Some thing went wrong',
           ToastAndroid.SHORT,
           ToastAndroid.CENTER,
         )
         return
       });
 }

 render() {



   return (

     <View style={{flex: 1,}}>
       <View style={{height:Constants.statusBarHeight,backgroundColor:'red'}}>
           <StatusBar  translucent={true} barStyle="light-content" backgroundColor={'red'} networkActivityIndicatorVisible={false}    />
       </View>
       <View style={{width:width,height:height,backgroundColor:'#000'}}>
       {this.state.onError&&
         <View style={{flex:1,alignItems: 'center',justifyContent: 'center',backgroundColor: '#000'}}>
           <Text style={{color:'#fff',fontSize: 14,fontWeight: '400'}}>{this.state.errText}</Text>
         </View>
       }
       {!this.state.onError&&this.state.details!=null&&
         <View style={{ width: width, height: height }}>
         <Video
         ref={video=>this.playbackInstance = video}
         source={{uri:this.state.details}}
         rate={1.0}
         volume={1.0}
         isMuted={true}
         onLoadStart={()=>{this.setState({loading:true})}}
         onLoad={(status)=>{this.setState({loading:false})}}
         onError={()=>this.onError()}
         isLooping
         onPlaybackStatusUpdate={(playbackStatus) => this.onPlaybackStatusUpdate(playbackStatus)}
         resizeMode='cover'
         shouldPlay={false}
         pictureInPicture={true}
         style={{ width: width, height: height }}
         />
         {this.state.loading&&
           <View style={{alignItems: 'center',justifyContent: 'center',position:'absolute',top:0,bottom: 0,left:0,right:0,}}>
           <ActivityIndicator size="small" color="#fff" />
           </View>
         }
         {!this.state.loading&&
           <View style={{position:'absolute',top:0,bottom: 0,left:0,right:0,}}>
              <View style={{flex:1}}>

                <View style={{position:'absolute',height:100,bottom: 0,left:0,right:0,}}>
                  <View style={{flex:1,flexDirection:'row',paddingHorizontal:15}}>
                     <View style={{flex:1,justifyContent:'center'}}>
                        <Text style={{color:'#fff',fontSize: 14}}>{this.getTimestamp()}</Text>
                      </View>
                     <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                         <TouchableOpacity onPress={()=>{this.playPause(this.video)}} disabled={this.state.onError} style={{height:60,width:60,borderRadius:30,backgroundColor:'red',borderWidth:2,borderColor:'#fff',alignItems:'center',justifyContent:'center'}}>
                         {this.state.isPause&&
                           <MaterialIcons name="pause" size={40} color="#fff" />
                         }
                         {!this.state.isPause&&
                           <MaterialIcons name="play-arrow" size={40} color="#fff" />
                         }
                         </TouchableOpacity>
                     </View>
                     <View style={{flex:1,justifyContent:'center',alignItems:'flex-end'}}>
                       <TouchableOpacity onPress={()=>{this.addVideo()}}>
                         <MaterialCommunityIcons name="send" size={32} color="#fff" />
                       </TouchableOpacity>
                     </View>
                   </View>
                </View>

              </View>
           </View>
         }
         </View>

       }
       </View>


     </View>
   );
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

export default connect(mapStateToProps, mapDispatchToProps)(VideoScreen);


// <View style={{paddingHorizontal:15,paddingVertical: 10,flexDirection: 'row'}}>
//   <TouchableOpacity style={{flex:0.08}} onPress={()=>{this.playPause(this.video)}} disabled={this.state.onError} >
//     <FontAwesome name={this.state.isPause?'pause':'play'} size={25} color='#032757' />
//   </TouchableOpacity>
//   <View style={{flex:0.5,justifyContent: 'center',alignItems: 'center'}}>
//       <Slider
//      style={styles.playbackSlider}
//      thumbTintColor="#032757"
//      minimumTrackTintColor="#032757"
//      minimumTrackTintColor="grey"
//      value={this.getSeekSliderPosition()}
//      onValueChange={this.onSeekSliderValueChange}
//      onSlidingComplete={this.onSeekSliderSlidingComplete}
//      disabled={this.state.onError}
//      />
//   </View>
//   <View style={{flex:0.32,justifyContent: 'center',alignItems: 'center'}}>
//     <Text style={{color:'#032757',fontSize: 14}}>{this.getTimestamp()}</Text>
//   </View>
//   <TouchableOpacity style={{flex:0.1}} onPress={()=>{this.onFullscreenPressed()}} disabled={this.state.onError}>
//     <SimpleLineIcons name={'size-fullscreen'} size={25} color='#032757'  />
//   </TouchableOpacity>
// </View>
