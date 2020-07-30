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
import { Camera } from 'expo-camera';
import { Audio, Video } from "expo-av";
import * as FileSystem from 'expo-file-system';


const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
const themeColor = settings.themeColor

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);


const WAMP_SERVER = settings.WAMP_SERVER;
const WAMP_PREFIX = settings.WAMP_PREFIX;


class HomeScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {header:null}
  };

  constructor(props) {
    super(props);
    var toContact = props.navigation.getParam('toContact',null)
    var myContact = props.navigation.getParam('myContact',null)
    var connection = props.navigation.getParam('connection',null)
    this.state={
      isRecording: false,
      video: null,
      videoIsLoading: false,
      cameraFlipDirection:Camera.Constants.Type.front,
      hasPermission:null,
      cameraPermission:null,
      audioPermission:null,
      type:'front',
      duration:30,
      timeFormat:'secs',
      video:null,
      playVideo:false,
      chatView:true,
      fileUrl:null,
      pauseRecord:false,
      preview:false,
      playDuration:0,
      list:[],
      selectedVideo:null,
      details:null,
      fullScreen:null,
      resizeMode:'cover',
      isPause:true,
      shouldPlay:true,
      onError:false,
      errText:'Playback error',
      landscape:false,
      optionsShow:false,
      clickCount:0,
      fullScreenMode:false,
      myContact:myContact,
      toContact:toContact,
      messages:[],
      initialTimer:5,
      hide:true,
      dataLoad:false,
      fileDownload:false,
      connection:connection,



      }
      willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
        }
     );
     this.handleCameraRef = this.handleCameraRef.bind(this);
     this.video = null
     this.isRecording = false
    }

    handleBackButtonClick=()=> {
      if(this.state.chatView){
        if(this.state.playVideo){
          this.setState({playVideo:false})
        }else{
          this.props.navigation.goBack()
          return true
        }
        // return false;
      }else{
        clearInterval(this.setInitialTimer)
        clearTimeout(this.closeInitialTimer)
        clearInterval(this.timerInterval)
        clearTimeout(this.timeLimit)
        this.setState({playVideo:false,pauseRecord:false,duration:30,initialTimer:5,})
        this.setState({chatView:true})
        // return true
      }

   };

   componentWillMount() {
       BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
   }

   componentWillUnmount() {
       BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
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
   if(status.didJustFinish){
     LayoutAnimation.easeInEaseOut();
     this.setState({playVideo:false});
   }
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
   };

   onLoad = status => {
   };

   onError = error => {
   this.setState({onError:true})
   };

  getPermission=async()=>{
      const { status, expires, permissions } = await Permissions.getAsync(
            Permissions.CAMERA,
            Permissions.AUDIO_RECORDING
          );
        if(permissions.camera.status == 'granted'){
          this.setState({cameraPermission:true})
          if(permissions.audioRecording.status == 'granted'){
            this.setState({audioPermission:true,hasPermission:true})
          }else{
            this.askAudioPermission()
          }
        }else{
          this.askCameraPermission()
        }
    }

    askCameraPermission=async()=>{
      const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
        if (status === 'granted') {
          this.setState({cameraPermission:true})
          this.getPermission()
        } else {
          this.setState({cameraPermission:false})
          this.getPermission()
       }
    }

    askAudioPermission=async()=>{
      const { status, permissions } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        if (status === 'granted') {
          this.setState({audioPermission:true})
          this.getPermission()
        } else {
          this.setState({audioPermission:false})

       }
    }

    supportChat=(args)=>{
      var msg = 'One message received from '+ args[0].from
      ToastAndroid.showWithGravityAndOffset(
        msg,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        200
      )
    }

    subscribe=()=>{
      // if(this.state.connection!=null){
      //   this.state.connection.onopen = (session,details)=>{
      //     this.setState({session : session});
      //     session.subscribe(myContact.number.toString(), this.supportChat).then(
      //       (sub) => {
      //       },
      //       (err) => {
      //       });
      //     }
      //     this.state.connection.open();
      //
      // }
    }



    componentDidMount(){
      // this.subscribe()
      this.getPermission()
      this.getMessages()
    }

    setInitialTimer=()=>{
      this.setState({hide:false})
       this.initialtimer = setInterval(() => {
         var {initialTimer} = this.state
           this.setState({initialTimer:initialTimer-1})
       }, 1000);
     }

    closeInitialTimer=()=>{
      var {initialTimer} = this.state
      this.finalTimer =  setTimeout(()=>{
        clearInterval(this.initialtimer)
        this.setState({hide:true,})
        if(this.camera){
          this.onRecord()
        }
        // if(this.camera){
        //   this.setState({isRecording: !this.state.isRecording,preview:false})
        // }
      },6000)
    }

    getMessages=()=>{
      if(this.state.toContact.id==undefined){
        var mobile = this.state.toContact.mobile
      }else{
        var mobile = this.state.toContact.phoneNumbers[0].number
      }
      this.setState({loader:true})
      fetch(SERVER_URL + '/getIMsByNumber/?with='+mobile+'&token='+this.state.myContact.token,{
        headers:{
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
        }
      })
     .then((response) =>{
       if(response.status==200||response.status==201){
         return  response.json()
       }else{
         return  undefined
       }
     })
     .then((responseJson) => {
       this.setState({loader:false})
       if(responseJson!=undefined){
        this.setState({list:responseJson})
        }else{
          return
        }
      })
     .catch((error) => {
       this.setState({loader:false})
       return
     });
    }

    handleCameraRef(ref) {
      this.camera = ref;
    }
  onPress=()=>{
      this.pauseRecording()
      this.onRecordVideo()
   }

setTimeInterval=(ms)=>{
   this.timerInterval = setInterval(() => {
     var {duration} = this.state
       this.setState({duration:duration-1})
   }, ms);
 }

setTimeLimit=(ms)=>{
  var {duration} = this.state
  this.timeLimit =  setTimeout(()=>{
    clearInterval(this.timerInterval)
    this.setState({isRecording: !this.state.isRecording,preview:false})
    if(this.camera){
       this.camera.stopRecording()
      // this.setState({video:this.video,})
    }
  },ms)
}

componentWillUnmount=()=>{
  clearInterval(this.setInitialTimer)
  clearTimeout(this.closeInitialTimer)
  clearInterval(this.timerInterval)
  clearTimeout(this.timeLimit)
}

 onRecordVideo=async()=>{

    if (this.camera) {
          this.setState({ isRecording: true, fileUrl: null });
          this.isRecording = true;
          this.camera.recordAsync({quality: '4:3'}).then((file)=>{
            this.setState({fileUrl: file.uri })
            this.setTimeInterval()
            this.setTimeLimit()
          })

        }
        // else{
        //   this.setState({ isRecording: false }, async () => {
        //       this.isRecording = false;
        //       await this.camera.stopRecording()
        //       clearInterval(this.timerInterval)
        //       clearTimeout(this.timeLimit)
        //
        //   })
        //
        // }
      //   this.setState({ isRecording: true }, async () => {
      //
      //   this.isRecording = true; // variable used for other functions that need to know if it's recording without waiting for state
      //   // this.recordTime = ;
      //
      //   // this.animateProgressBar();
      //   // this.startCountdown();
      //   // There appears to be some relationship between maxDuration in recordAsync and this bug.
      //   this.setTimeInterval()
      //   this.setTimeLimit()
      //   return
      //   const video = await this.camera.recordAsync({
      //     maxDuration: VIDEO_DURATION / 1000
      //   });
      //   this.isRecording = false;
      //
      //   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      //   this.setState({ videoIsLoading: false, isRecording: false, video });
      //   // this.setState({ isRecording: false, video });
      // })
    // }
  }
  reload=()=>{
    // this.setState({chatView:true})
    this.getMessages()

  }
  onRecord=async()=>{
    // this.setState({ isRecording: true }, async () => {
    //     this.isRecording = true;
    //     this.setTimeInterval(1000)
    //     this.setTimeLimit(59000)
    //     this.video = await this.camera.recordAsync();
    //     this.setState({video:this.video})
    // })
    if (this.camera) {
    try{
      this.camera.stopRecording()
      try {
          const videoRecordPromise = this.camera.recordAsync();
          if (videoRecordPromise) {
            this.isRecording = true;
            this.setState({isRecording:true})
            this.setTimeInterval(1000)
            this.setTimeLimit(30000)
            // this.setInitialTimer()
            // this.closeInitialTimer()
            const data = await videoRecordPromise;
            const source = data.uri;
            if (source) {
              this.setState({preview:true});
              this.setState({video:source,duration:30,playVideo:false,isRecording: false,pauseRecord:true})
              // this.setState({video:source,details:source,playVideo:true,})
              // this.props.navigation.navigate('VideoScreen',{details:source,toContact:this.state.toContact,myContact:this.state.myContact,onGoBack:()=>{this.reload()}})
            }
          }
        } catch (error) {
          console.warn(error);
        }
    } catch(error){
      try {
          const videoRecordPromise = this.camera.recordAsync();
          if (videoRecordPromise) {
            this.isRecording = true;
            this.setState({isRecording:true})
            this.setTimeInterval(1000)
            this.setTimeLimit(30000)
            // this.setInitialTimer()
            // this.closeInitialTimer()
            const data = await videoRecordPromise;
            const source = data.uri;
            if (source) {
              this.setState({preview:true});
              this.setState({video:source,duration:29,playVideo:false,isRecording: false,pauseRecord:true})
              // this.props.navigation.navigate('VideoScreen',{details:source,onGoBack:()=>{this.reload()}})
            }
          }
        } catch (error) {
          console.warn(error);
        }
    }

  }else{
  }
  }

  onPlayPauseRecord=async()=>{
    if(this.state.pauseRecord){
      await this.camera.resumePreview()
      this.setState({pauseRecord:false})
      this.setTimeInterval(1000)
      var duration = this.state.duration
      this.setTimeLimit(3*1000)
    }else{
      await this.camera.pausePreview()
      this.setState({pauseRecord:true})
      clearInterval(this.timerInterval)
      clearTimeout(this.timeLimit)
    }
  }

  stopRecording=async()=>{
       this.camera.stopRecording();
       this.setState({ pauseRecord: true,playDuration:this.state.duration });
       clearInterval(this.timerInterval)
       clearTimeout(this.timeLimit)
  }

  switchCamera=()=>{
    if (this.state.preview) {
      return;
    }
    var {type} = this.state
    if(type=='back'){
      this.setState({cameraFlipDirection:Camera.Constants.Type.front,type:'front'})
    }else{
      this.setState({cameraFlipDirection:Camera.Constants.Type.back,type:'back'})
    }
  }

  renderHeader=()=>{
    var dp = ''
    var dpRequire = false
    if(this.state.toContact.id==undefined){
       dp = this.state.toContact.dp!=null?SERVER_URL+this.state.toContact.dp:''
       if(dp.length>0&&dp.includes('/media/')==false){
         dp = this.state.toContact.dp
       }
       var name = this.state.toContact.name!=null?(this.state.toContact.name.length>0?this.state.toContact.name:this.state.toContact.mobile):this.state.toContact.mobile
    }else{
       dp = this.state.toContact.imageAvailable?this.state.toContact.image.uri:''
       var name = this.state.toContact.name.length>0?this.state.toContact.name:this.state.toContact.phoneNumbers[0].number
    }
    var online = false
    if(this.props.callee!=null&&this.props.callee.status=='online'){
      console.log(this.props.callee.number);
      online = true
    }
    return(
      <View style={{height:55,width:width,backgroundColor:themeColor}}>
      <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
         <View style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'center',}}>
           <TouchableOpacity onPress={()=>{this.handleBackButtonClick()}} style={{flex:1,alignItems:'center' }}>
              <MaterialIcons name="arrow-back" size={28} color="#fff" />
           </TouchableOpacity>
         </View>
         <View style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'center', }}>
           {dp.length>0&&<Image source={{uri:dp}} style={{width:40,height:40,resizeMode:'cover',borderRadius:20}} />}
           {dp.length==0&&<View  style={{width:40,height:40,borderRadius:20,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}} >
              <Text style={{color:themeColor,fontSize:22,fontWeight:'700'}}>{name.charAt(0)}</Text>
            </View>
            }
         </View>
         <View style={{ flex: 0.65, flexDirection: 'row', justifyContent: 'flex-start', }}>
           <Text  style={{ color:'#fff',fontWeight:'700',fontSize:18,paddingLeft:5,paddingRight:10}} numberOfLines={1}>{name}</Text>
         </View>
         <View style={{ flex: 0.1, flexDirection: 'row', justifyContent: 'flex-start',alignItems:'center' }}>
           <View  style={{ backgroundColor:online?'#32CD32':'#7e1a05',width:10,height:10,borderRadius:5}} />
         </View>

       </View>
   </View>
    )
  }

  handlingTap=()=>{
    // this.playPause(this.video)
   this.state.clickCount==1 ?this.setState({fullScreenMode:!this.state.fullScreenMode}):this.setState({clickCount:1}, ()=>{
     setTimeout(()=>{
       this.setState({clickCount:0})
       this.setState({optionsShow:!this.state.optionsShow})
     }, 300)
   })
}

changeScreenMode=()=>{
  if(this.state.fullScreenMode){
    LayoutAnimation.configureNext(
            LayoutAnimation.create(
              300,
              LayoutAnimation.Types.easeOut,
              LayoutAnimation.Properties.scaleXY,
            ),
      );
  }else{
    LayoutAnimation.configureNext(
            LayoutAnimation.create(
              300,
              LayoutAnimation.Types.easeIn,
              LayoutAnimation.Properties.scaleXY,
            ),
      );
  }

    this.setState({fullScreenMode:!this.state.fullScreenMode})
    return
}

renderTimer=()=>{
  if(!this.state.hide){
    let {initialTimer} = this.state
    var top,left
    if(initialTimer==1){
      top = 0
      left = 0
    }else if(initialTimer==2){
      top = 50
      left = 50
    }else if(initialTimer==3){
      top = 100
      left = 0
    }else if(initialTimer==4){
      top = 50
      left = -50
    }else{
      top = 0
      left = 0
    }
    return(
      <View style={{position:'absolute',top:0,right:0,bottom:0,left:0,marginTop:-Constants.statusBarHeight}}>
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
           {initialTimer==0&&<View style={{paddingHorizontal:20,paddingVertical:10,backgroundColor:'rgba(0,0,0,0.6)',borderRadius:25,alignItems:'center',justifyContent:'center',marginTop:0,marginLeft:0}}>
              <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>Smile</Text>
           </View>}
           {initialTimer==5&&<View style={{paddingHorizontal:20,paddingVertical:10,backgroundColor:'rgba(0,0,0,0.6)',borderRadius:25,alignItems:'center',justifyContent:'center',marginTop:0,marginLeft:0}}>
              <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>Ready</Text>
           </View>}
           {initialTimer!=5&&initialTimer!=0&&<View style={{width:50,height:50,backgroundColor:'rgba(0,0,0,0.6)',borderRadius:25,alignItems:'center',justifyContent:'center',marginTop:0,marginLeft:0}}>
              <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>{initialTimer}</Text>
           </View>
         }

        </View>
      </View>
    )
  }else{
    return null
  }

}

startRecording=()=>{
  this.setState({preview:false,chatView:false,})
  clearInterval(this.setInitialTimer)
  clearTimeout(this.closeInitialTimer)
  clearInterval(this.timerInterval)
  clearTimeout(this.timeLimit)
  this.setState({playVideo:false,pauseRecord:false,duration:30,initialTimer:5,})

  // this.onRecord()
  this.openTimer =  setTimeout(()=>{
    if(this.camera){
        this.setInitialTimer()
        this.closeInitialTimer()
    }
  },100)
}

 playVideoPlayer=async(item)=>{
   var url = SERVER_URL+item.attach
   var urlFile = item.attach.split('/')
   var fileName = urlFile[urlFile.length-1]
   var uriFile = FileSystem.documentDirectory + 'zingoo'
   var directory = await FileSystem.getInfoAsync(uriFile)

   if(directory.exists){
     var fileInfo =await FileSystem.getInfoAsync(uriFile+'/'+fileName)
     if(!fileInfo.exists){
       var details = item
       details.localFile = null
       this.setState({selectedVideo:item,details:item,fullScreenMode:false,fileDownload:true,playVideo:true,})
       LayoutAnimation.easeInEaseOut()
       FileSystem.downloadAsync(
        url,
        uriFile+'/'+fileName
      )
        .then(({ uri }) => {
          details.localFile = uri
          this.setState({selectedVideo:item,details:item,fileDownload:false,})
          return
        })
        .catch(error => {
          this.setState({fileDownload:false})
        });
     }else{
       var details = item
       details.localFile = uriFile+'/'+fileName
       this.setState({selectedVideo:item,details:item,fullScreenMode:false,playVideo:true})
       LayoutAnimation.easeInEaseOut()
     }
   }else{
      var dirName = await FileSystem.makeDirectoryAsync(uriFile, {intermediates:true})
      var fileInfo =await FileSystem.getInfoAsync(uriFile+'/'+fileName)
      if(!fileInfo.exists){
        var details = item
        details.localFile = null
        this.setState({selectedVideo:item,details:item,fullScreenMode:false,fileDownload:true,playVideo:true,})
        LayoutAnimation.easeInEaseOut()
        FileSystem.downloadAsync(
         url,
         uriFile+'/'+fileName
       )
         .then(({ uri }) => {
           details.localFile = uri
           this.setState({selectedVideo:item,details:item,fileDownload:false,})
           return
         })
         .catch(error => {
           this.setState({fileDownload:false})
         });
      }else{
        var details = item
        details.localFile = uriFile+'/'+fileName
        this.setState({selectedVideo:item,details:item,fullScreenMode:false,playVideo:true})
        LayoutAnimation.easeInEaseOut()
      }
   }


 }
 componentWillReceiveProps(nextProps){

   if (nextProps.receivedMessage !== null && nextProps.receivedMessage !== this.props.receivedMessage) {
     var messages = this.state.list
     var obj = {
       frm : nextProps.receivedMessage.from,
       to : nextProps.receivedMessage.to,
       attachment : null,
       thumbnail : null,
     }
     if(this.state.toContact.id==undefined){
       var mobile = this.state.toContact.mobile
     }else{
       var mobile = this.state.toContact.phoneNumbers[0].number
     }
     var strMobile = mobile.toString()
      if(strMobile.includes('+')){
        strMobile = strMobile.substring(3,strMobile.length)
      }
     if(this.state.myContact.number==nextProps.receivedMessage.to&&strMobile==nextProps.receivedMessage.from){
        messages.reverse().push(obj)
     }
     this.setState({list:messages.reverse()})
     console.log(messages.reverse,'reverseee');
     this.props.setReceivedMessage(null)
   }
 }


  render() {
    let {hasPermission,type,duration,timeFormat,isRecording,chatView,fullScreenMode} = this.state
    if(fullScreenMode){
      var screenSize = {
        position:'absolute',zIndex:99,top:Constants.statusBarHeight+85,right:0,left:0,bottom:0,top:Constants.statusBarHeight+55
      }
      var widthHeight = {
        width:width*0.9,
        height:'100%'
      }
    }else{
      var screenSize = {
        position:'absolute',zIndex:99,top:Constants.statusBarHeight+55,right:0,left:0,height:250
      }
      var widthHeight = {
        width:width*0.8,height:'100%'
      }
    }
    return (
    <View style={{flex:1}}>
    {!chatView&&
        <View style={{flex:1,backgroundColor:'#f2f2f2',}}>
              <View style={{height:Constants.statusBarHeight,backgroundColor:themeColor}}>
                  <StatusBar  translucent={true} barStyle="light-content" backgroundColor={themeColor} networkActivityIndicatorVisible={false}    />
              </View>

              {hasPermission === null&&
                  <View />
               }
               {hasPermission === false&&
                   <View style={{flex:1}}>
                      <Text>No access to camera</Text>
                   </View>
               }
               {hasPermission === true&&
                 <View style={{flex:1}}>
                   {!this.state.preview&&
                     <Camera
                     style={styles.camera}
                     type={this.state.cameraFlipDirection}
                     ref={this.handleCameraRef}
                   />
                  }
                   {this.state.preview&&
                     <View style={{flex:1,backgroundColor:'#000'}}>
                       <Video
                       ref={video=>this.playbackInstance = video}
                       source={{uri:this.state.video}}
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
                       style={styles.camera,{ width:'100%',height:'100%' }}
                       />
                     </View>
                  }
                  {this.state.preview&&
                    <View style={{position:'absolute',height:100,bottom: 0,left:0,right:0,}}>
                    <View style={{flex:1,flexDirection:'row',paddingHorizontal:15}}>
                       <View style={{flex:1,justifyContent:'center'}}>
                          <Text style={{color:'#fff',fontSize: 14}}>{this.getTimestamp()}</Text>
                        </View>
                       <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                           <TouchableOpacity onPress={()=>{this.playPause(this.video)}} disabled={this.state.onError} style={{height:60,width:60,borderRadius:30,backgroundColor:themeColor,borderWidth:2,borderColor:'#fff',alignItems:'center',justifyContent:'center'}}>
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
                  </View>}
                  {!this.state.preview&&<View style={{position:'absolute',bottom:0,left:0,right:0,height:100,zIndex:9}}>
                      <View style={{flex:1,flexDirection:'row',paddingHorizontal:15}}>
                         <View style={{flex:1,justifyContent:'center'}}>
                             {isRecording&&this.state.hide&&<Text style={{color:'#fff',fontSize:16,fontWeight:'700'}}>{duration} {timeFormat}</Text>}
                         </View>
                         <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            {
                            //   !this.state.isRecording&&<TouchableOpacity onPress={()=>{this.onRecord()}} style={{height:60,width:60,borderRadius:30,backgroundColor:themeColor,borderWidth:2,borderColor:'#fff',alignItems:'center',justifyContent:'center'}}>
                            // </TouchableOpacity>
                           }
                            {this.state.isRecording&&this.state.hide&&<TouchableOpacity onPress={()=>{this.stopRecording()}} style={{height:60,width:60,borderRadius:30,backgroundColor:themeColor,borderWidth:2,borderColor:'#fff',alignItems:'center',justifyContent:'center'}}>
                                {!this.state.pauseRecord&&
                                  <View style={{height:25,width:25,backgroundColor:'#fff'}} />
                                }

                            </TouchableOpacity>
                           }
                         </View>
                         <View style={{flex:1,alignItems:'flex-end',justifyContent:'center',}}>
                            {
                              // !this.state.isRecording&&
                              // <TouchableOpacity onPress={()=>{this.switchCamera()}}>
                              //   <MaterialIcons name="switch-camera" size={44} color="#fff" />
                              // </TouchableOpacity>
                           }
                            {!this.state.isRecording&&this.state.pauseRecord&&
                              <TouchableOpacity onPress={()=>{this.addVideo()}}>
                                <MaterialCommunityIcons name="send" size={32} color="#fff" />
                              </TouchableOpacity>
                           }
                         </View>
                      </View>
                   </View>
                 }
                   {this.renderTimer()}
                 </View>
               }
        </View>
      }
    {chatView&&
           <View style={{flex: 1,}}>
             <View style={{height:Constants.statusBarHeight,backgroundColor:themeColor}}>
                 <StatusBar  translucent={true} barStyle="light-content" backgroundColor={themeColor} networkActivityIndicatorVisible={false}    />
             </View>
             {this.renderHeader()}
             <View style={{}}>
               <FlatList style={{}} contentContainerStyle={{}}
               data={this.state.list}
               inverted

               keyExtractor={(item,index) => {
                 return index.toString();
               }}
               showsHorizontalScrollIndicator={false}
               nestedScrollEnabled={true}
               renderItem={({item, index}) =>{
                 if(item.frm==this.state.myContact.pk){
                   var type = 'out'
                 }else{
                   var type = 'in'
                 }
                 var attachment = item.attach
                 var img = item.thumbnail!=null?SERVER_URL+item.thumbnail:''
                 if(this.state.dataLoad&&index==0){
                   return(
                     <View style={{width:width,alignItems:type=='in'?'flex-start':'flex-end',justifyContent:'flex-start',paddingVertical:10,paddingBottom:index==0?Constants.statusBarHeight+130:0,paddingTop:index==this.state.list.length-1?30:10}}>
                       <View  style={{paddingLeft:type=='in'?15:0,paddingRight:type=='out'?15:0,width:(width/2)+15,height:(width/2)+15,borderTopRightRadius:type=='out'?30:0,borderBottomLeftRadius:type=='out'?30:0,borderTopLeftRadius:type=='in'?30:0,borderBottomRightRadius:type=='in'?30:0,alignItems:'center',justifyContent:'center'}}>
                           <ActivityIndicator size="large" color="red" />
                       </View>
                      </View>
                   )
                 }else{
                   return(
                     <View style={{width:width,alignItems:type=='in'?'flex-start':'flex-end',justifyContent:'flex-start',paddingVertical:10,paddingBottom:index==0?Constants.statusBarHeight+130:0,paddingTop:index==this.state.list.length-1?30:10}}>
                       <TouchableOpacity onPress={()=>{this.playVideoPlayer(item)}} style={{paddingLeft:type=='in'?15:0,paddingRight:type=='out'?15:0,width:(width/2)+15,height:(width/2)+15,borderTopRightRadius:type=='out'?30:0,borderBottomLeftRadius:type=='out'?30:0,borderTopLeftRadius:type=='in'?30:0,borderBottomRightRadius:type=='in'?30:0,}}>
                         <Image source={img.length>0?{uri:img}:null} style={{flex:1,width:'100%',height:'100%',resizeMode:'cover',backgroundColor:'#fff',borderTopRightRadius:type=='out'?30:0,borderBottomLeftRadius:type=='out'?30:0,borderTopLeftRadius:type=='in'?30:0,borderBottomRightRadius:type=='in'?30:0}} />
                         <View style={{position:'absolute',top:0,right:0,left:0,bottom:0}}>
                            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                                <View style={{width:50,height:50,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.4)',borderRadius:25,}}>
                                   <MaterialIcons name="play-arrow" size={40} color="red" />
                                </View>
                            </View>
                         </View>
                       </TouchableOpacity>
                      </View>
                   )
                 }

               }}
               extraData={this.state.list}
               />
             </View>
             <View style={{position:'absolute',bottom:15,width:50,right:15,height:50,zIndex:9,}}>
               <TouchableOpacity style={{flex:1,backgroundColor:themeColor,alignItems:'center',justifyContent:'center',borderRadius:25}} onPress={()=>{this.startRecording()}}>
                   <FontAwesome5 name="video" size={28} color="#fff" />
               </TouchableOpacity>
             </View>
           </View>
         }

         {this.state.playVideo&&
           <View style={styles.shadow,screenSize}>
             <View style={{flex:1,}}>
             {this.state.onError&&
               <View style={{flex:1,alignItems: 'center',justifyContent: 'center',backgroundColor: '#000'}}>
                 <Text style={{color:'#fff',fontSize: 14,fontWeight: '400'}}>{this.state.errText}</Text>
               </View>
             }
             {!this.state.onError&&this.state.details!=null&&
               <View style={{width:'100%',height:'100%',backgroundColor:'#000' }}>
               <TouchableWithoutFeedback onPress={()=>{this.changeScreenMode()}}>
                <View>
                {!this.state.fileDownload&&
                <View style={{opacity:this.state.optionsShow?0.5:1}}>
                 <Video
                 ref={video=>this.playbackInstance = video}
                 source={{uri:this.state.details.localFile==undefined?SERVER_URL+this.state.details.attach:this.state.details.localFile}}
                 rate={1.0}
                 volume={1.0}
                 isMuted={true}
                 onLoadStart={()=>{this.setState({loading:true})}}
                 onLoadEnd={()=>{this.setState({playVideo:false})}}
                 onLoad={(status)=>{this.setState({loading:false})}}
                 onError={()=>this.onError()}
                 isLooping={false}
                 onPlaybackStatusUpdate={(playbackStatus) => this.onPlaybackStatusUpdate(playbackStatus)}
                 resizeMode='cover'
                 shouldPlay={true}
                 style={{width:'100%',height:'100%' }}
                 />
                </View>}
                {this.state.fileDownload&&
                  <View style={{width:'100%',height:'100%'}}>
                    <View style={{position:'absolute',top:0,bottom: 0,left:0,right:0,alignItems: 'center',justifyContent: 'center',}}>
                    <ActivityIndicator size="small" color="#fff" />
                    <TouchableOpacity onPress={()=>{this.setState({playVideo:false})}} style={{position:'absolute',opacity:0.6,height:40,width:40,borderRadius:20,top: 10,right:10,backgroundColor:'#000',zIndex:9}}>
                       <View style={{flex:1,justifyContent:'center',alignItems:'center',zIndex:99}}>
                          <MaterialIcons name="close" size={28} color="#fff" />
                       </View>
                    </TouchableOpacity>
                    </View>
                  </View>
                }
               {!this.state.fileDownload&&this.state.loading&&
                 <View style={{alignItems: 'center',justifyContent: 'center',position:'absolute',top:0,bottom: 0,left:0,right:0,}}>
                 <ActivityIndicator size="small" color="#fff" />
                 <TouchableOpacity onPress={()=>{this.setState({playVideo:false})}} style={{position:'absolute',opacity:0.6,height:40,width:40,borderRadius:20,top: 10,right:10,backgroundColor:'#000',zIndex:9}}>
                    <View style={{flex:1,justifyContent:'center',alignItems:'center',zIndex:99}}>
                       <MaterialIcons name="close" size={28} color="#fff" />
                    </View>
                 </TouchableOpacity>
                 </View>
               }
               {!this.state.fileDownload&&!this.state.loading&&
                 <View style={{position:'absolute',top:0,bottom: 0,left:0,right:0,}}>
                    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                        {this.state.optionsShow&&
                          <TouchableOpacity onPress={()=>{this.playPause(this.video)}} disabled={this.state.onError} style={{height:60,width:60,borderRadius:30,backgroundColor:themeColor,borderWidth:2,borderColor:'#fff',alignItems:'center',justifyContent:'center'}}>
                          {this.state.isPause&&
                            <MaterialIcons name="pause" size={40} color="#fff" />
                          }
                          {!this.state.isPause&&
                            <MaterialIcons name="play-arrow" size={40} color="#fff" />
                          }
                        </TouchableOpacity>
                      }
                      <View style={{position:'absolute',height:40,bottom: 0,left:0,right:0,}}>
                        <View style={{flex:1,flexDirection:'row',paddingHorizontal:15}}>
                           <View style={{flex:1,justifyContent:'center'}}>
                              <Text style={{color:'#fff',fontSize: 14}}>{this.getTimestamp()}</Text>
                            </View>
                         </View>
                      </View>
                      <TouchableOpacity onPress={()=>{this.setState({playVideo:false})}} style={{position:'absolute',opacity:0.6,height:40,width:40,borderRadius:20,top: 10,right:10,backgroundColor:'#000',zIndex:9}}>
                         <View style={{flex:1,justifyContent:'center',alignItems:'center',zIndex:99}}>
                            <MaterialIcons name="close" size={28} color="#fff" />
                         </View>
                      </TouchableOpacity>

                    </View>
                 </View>
               }
               </View>
               </TouchableWithoutFeedback>
               </View>

             }
             </View>
         </View>
       }

      </View>
    )

  }
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
    const uri = this.state.video
    const name = this.state.video.split('/').pop();
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
      var publish = false
      if(this.props.callee!=null&&this.props.callee.status=='online'){
        publish = true
        // this.state.connection.session.publish(strMobile, [{'from':this.state.myContact.number.toString(),'to':strMobile,attach:null,
        // thumbnail:null}] , {}, {
        //     acknowledge: true
        // })
         var url = SERVER_URL + '/sendExternalMessage/?from='+this.state.myContact.number+'&to='+strMobile
      }else{
         var url = SERVER_URL + '/sendExternalMessage/?from='+this.state.myContact.number+'&to='+strMobile+'&notify=1'
        formdata.append("notify",true);
      }

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
      var list = this.state.list
      var obj = {
        frm:this.state.myContact.pk,
        attach:null,
        thumbnail:null
      }
      list.push(obj)
      this.setState({list:list})
      this.setState({chatView:true,dataLoad:true})
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Referer': '/sendExternalMessage/?from='+this.state.myContact.number+'&to='+strMobile,
        },
        body:formdata
        })
        .then((response) =>{
          if(response.status==200||response.status==201){
            return response.json()
          }else{
            return undefined
          }
        })
        .then((responseJson) => {
           if(responseJson!=undefined){
             var obj = {
               frm:this.state.myContact.pk,
               attach:responseJson.url,
               thumbnail:responseJson.thumbnail
             }
             list[0] = obj
             if(publish){
               this.state.connection.session.publish(strMobile, [{'from':this.state.myContact.number.toString(),'to':strMobile,attach:responseJson.url,
               thumbnail:responseJson.thumbnail}] , {}, {
                   acknowledge: true
               })
             }
             this.setState({list:list,dataLoad:false})
             // this.downLoadFile(responseJson.url)
             // this.reload()
             // this.props.navigation.state.params.onGoBack()
             // this.props.navigation.goBack()
           }else{
              if(publish){
                 this.state.connection.session.publish(strMobile, [{'from':this.state.myContact.number.toString(),'to':strMobile,attach:null,
                 thumbnail:null}] , {}, {
                     acknowledge: true
                 })
               }
             list.splice(list.length-1)
             this.setState({list:list,dataLoad:false})
             ToastAndroid.showWithGravity(
               'Some thing went wrong',
               ToastAndroid.SHORT,
               ToastAndroid.CENTER,
             )
             return
           }
        })
        .catch((error) => {
          list.splice(list.length-1)
          this.setState({list:list,dataLoad:false})
          ToastAndroid.showWithGravity(
            'Some thing went wrong',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          )
          return
        });
  }

  downLoadFile=async(response)=>{
    var url = SERVER_URL+response
    var urlFile = response.split('/')
    var fileName = urlFile[urlFile.length-1]
    var uriFile = FileSystem.documentDirectory + 'zingoo'
    var directory = await FileSystem.getInfoAsync(uriFile)

    if(directory.exists){
      var fileInfo =await FileSystem.getInfoAsync(uriFile+'/'+fileName)
      if(!fileInfo.exists){
        var details = item
        details.localFile = null
        this.setState({selectedVideo:item,details:item,fullScreenMode:false,playVideo:true})
        LayoutAnimation.easeInEaseOut()
        FileSystem.downloadAsync(
         url,
         uriFile+'/'+fileName
       )
         .then(({ uri }) => {
           details.localFile = uri
           this.setState({selectedVideo:item,details:item,})
           return
         })
         .catch(error => {
           return
         });
      }else{
        var details = item
        details.localFile = uriFile+'/'+fileName
        this.setState({selectedVideo:item,details:item,fullScreenMode:false,playVideo:true})
        LayoutAnimation.easeInEaseOut()
      }
    }else{
       var dirName = await FileSystem.makeDirectoryAsync(uriFile, {intermediates:true})
       var fileInfo =await FileSystem.getInfoAsync(uriFile+'/'+fileName)
       if(!fileInfo.exists){
         this.setState({selectedVideo:item,details:item,fullScreenMode:false,playVideo:true})
         LayoutAnimation.easeInEaseOut()
         FileSystem.downloadAsync(
          url,
          uriFile+'/'+fileName
        )
          .then(({ uri }) => {
            return
          })
          .catch(error => {
            return
          });
       }else{
         var details = item
         details.localFile = uriFile+'/'+fileName
         this.setState({selectedVideo:item,details:item,fullScreenMode:false,playVideo:true})
         LayoutAnimation.easeInEaseOut()
       }
    }

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
  halfscreen:{
    position:'absolute',zIndex:99,top:Constants.statusBarHeight+85,right:20,width:width*0.8,height:200
  },
  fullscreen:{
    position:'absolute',zIndex:99,top:Constants.statusBarHeight+85,right:width*0.1,left:width*0.1,width:width*0.8,height:200,bottom:30
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
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
      callee: state.cartItems.callee,
      receivedMessage: state.cartItems.receivedMessage,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addVideo:  (args) => dispatch(actions.addVideo(args)),
    setCallee:  (args) => dispatch(actions.setCallee(args)),
    setReceivedMessage:  (args) => dispatch(actions.receivedMessage(args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

// {this.state.pauseRecord&&
//   <MaterialIcons name="play-arrow" size={40} color="#fff" />
// }
