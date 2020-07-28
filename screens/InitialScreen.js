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
  ToastAndroid,RefreshControl,TouchableWithoutFeedback,TouchableNativeFeedback,Vibration} from 'react-native';
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
import { Notifications } from 'expo';
import wamp from 'wamp.js2';

const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
const themeColor = settings.themeColor

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const WAMP_SERVER = settings.WAMP_SERVER;
const WAMP_PREFIX = settings.WAMP_PREFIX;

class InitialScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {header:null}
  };

  constructor(props) {
    super(props);
    // var myContact = props.navigation.getParam('myContact',null)
    this.state={
        mobile:null,
        otp:null,
        otpDetails:null,
        loader:false,
        contacts:[],
        myContact:null,
        list:[],
        search:false,
        searchText:'',
        searchData:[],
        contactsFull:[],
        listFullData:[],
        modalVisible: false,
        message:'',
        company : 2,
        firstMessage : null,
        uid : null,
        chatThreadPk : null,
        session : null,
        connection : new wamp.Connection({url: WAMP_SERVER, realm: 'default'}),
        companyName : null,
        mascotName : null,
        mascotIcon : null,
        agentPk : null,
        hasCameraPermission: null,
        cameraShow:false,
        messages:[],
        chatWith:null,
        getDisplayPic:null,
        showName:'',
        routeName:'InitialScreen'
      }
      willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
          this.changeScreen()
        }
     );
  }

  changeScreen=()=>{
    this.setState({routeName:'InitialScreen'})
  }

  getOtp=()=>{
    this.setState({loader:true})
    fetch(SERVER_URL + '/generateExternalOTP/?mobile='+this.state.mobile,{
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
      this.setState({otpDetails:responseJson,otp:responseJson.otp})
      this.verifyOtp(responseJson.otp)
      }else{
        return
      }
    })
   .catch((error) => {
     this.setState({loader:false})
     return
   });
  }

  verifyOtp=(otp)=>{
    console.log(otp,SERVER_URL + '/verifyExternalOTP/?mobile='+this.state.mobile+'&otp='+otp,'hhhhhhhhhhh');
    this.setState({loader:true})
    fetch(SERVER_URL + '/verifyExternalOTP/?mobile='+this.state.mobile+'&otp='+otp,{
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
      }
    })
   .then((response) =>{
     console.log(response.status,'assssssssss');
     if(response.status==200||response.status==201){
       return  response.json()
     }else{
       return  undefined
     }
   })
   .then((responseJson) => {
     console.log(responseJson,'agbbbbbbbbb');
     if(responseJson!=undefined){
      this.setState({myContact:responseJson})
      this.getContactsList(responseJson.token)
      }else{
        this.setState({loader:false})
        return
      }
    })
   .catch((error) => {
     this.setState({loader:false})
     return
   });
  }

  getContactsList=(token,number)=>{

    // this.setState({loader:true})
    fetch(SERVER_URL + '/getIM/?token='+token,{
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
       responseJson.forEach((i)=>{
         i.count =0
       })
      this.setState({list:responseJson,listFullData:responseJson})
      this.getContacts()
      }else{
        return
      }
    })
   .catch((error) => {
     this.setState({loader:false})
     return
   });
  }

  supportChat = (args)=>{
    console.log(args[0],'supportChat',this.state.routeName);

    if(this.state.routeName=='InitialScreen'){
      if(args[0].from!=undefined){
        var contacts = this.state.contacts
        var list = this.state.list
        list.forEach((i)=>{
          if(i.mobile == args[0].from){
            i.count = i.count +1
          }
        })
        this.setState({list:list})
        contacts.forEach((i)=>{
          if(i.mobile == args[0].from){
            i.count = i.count +1
          }
        })
        this.setState({contacts:contacts})
      }
    }
    var msg = 'One message received from '+ args[0].from
    ToastAndroid.showWithGravityAndOffset(
      msg,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      200
    )
  }

 //  checkHeartBeat = (args)=>{
 //   console.log(args,'heartBeat');
 // }
 //
 //  checkHeartBeatt = (args)=>{
 //   console.log(args,'checkHeartBeatt');
 // }



  getMyContact=async()=>{
    var myContact = await AsyncStorage.getItem('myContact',null)
    if(JSON.parse(myContact)!=null){
      myContact = JSON.parse(myContact)
      this.setState({mobile:myContact.number,myContact:myContact})

      callProcedure=()=>{
        if (this.state.myContact!=null) {
             if (this.state.connection == null || this.state.connection.session == null || this.state.connection.session.call == null) {
               return
             }
             this.state.connection.session.call(WAMP_PREFIX +'support.checkHeartBeat.' + this.state.myContact.number, ['online']).then(
               (res)=> {
                 console.log(res,'yyyy');
              },
              (err)=> {
                return
             }
            );
           }else {
             return
           }
      }

      this.state.connection.onopen = (session,details)=>{
          this.setState({session : session});
          // setInterval(function () {
          //    try {
          //       callProcedure();
          //    }
          //    catch (e) {
          //      console.error(e.message);
          //    }
          //  }, 2000);
          session.subscribe(myContact.number.toString(), this.supportChat).then(
          (sub) => {
          console.log('subscribing success support.checkHeartBeat');
          },
          (err) => {
            console.log("failed to subscribe: support.checkHeartBeat"+err);
          });

          // session.publish(WAMP_PREFIX +'support.checkHeartBeat', this.checkHeartBeat).then(
          //   function (res) {
          //     console.log("publish to support.checkHeartBeat");
          //   },
          //   function (err) {
          //     console.log("publish failed to subscribe: support.checkHeartBeat");
          //   }
          // );
          //
          // session.register(WAMP_PREFIX +'support.checkHeartBeat.'+myContact.number, this.checkHeartBeat).then(
          //   function (res) {
          //     console.log("register to support.checkHeartBeat",res,'res');
          //   },
          //   function (err) {
          //     console.log("failed to register: support.checkHeartBeat",err);
          //   }
          // );
          //
          // session.call(WAMP_PREFIX +'support.chat', [2, 3]).then(
          //    function (res) {
          //       console.log("Result:", res);
          //    }
          // );
        }

        this.state.connection.open();
        this.getContactsList(myContact.token,myContact.number)
    }
    this.state.connection.onclose = (reason, details)=>{
      console.log(reason,'resfsd');
    }
  }
  // _handleNotification = notification => {
  //   Vibration.vibrate();
  //   console.log(notification,'lllllllll');
  //   this.setState({ notification: notification });
  //   // if(this.state.openNotification!=1)
  //   // this.props.navigation.navigate('InitialScreen')
  // };
  _handleRespondNotification = notification => {
    Vibration.vibrate();
    console.log(notification,'lllllllll');
    this.setState({ notification: notification });
    // if(this.state.openNotification!=1)
    if(notification.origin=='selected'){
      this.props.navigation.navigate('InitialScreen')
    }
  };

  componentDidMount(){
    this.getMyContact()
    // this._notificationSubscription = Notifications.addListener(this._handleNotification);
    this._notificationRespondSubscription = Notifications.addListener(this._handleRespondNotification);
    // this.getContactsList(this.state.myContact.token)
  }

  checkContacts=(contacts)=>{
    var list = this.state.list
    var appendIndexs = []
    contacts.forEach((item,idx)=>{
      if(item.phoneNumbers!=undefined&&item.phoneNumbers.length>0){
        var mobile = item.phoneNumbers[0].number
        var strMobile = mobile.toString()
         if(strMobile.includes('+')){
           strMobile = strMobile.substring(3,strMobile.length)
         }
         var findIndex = null
         list.forEach((listNo,index)=>{
             if(strMobile == listNo.mobile.toString()){
               findIndex = index
             }
         })
         if(findIndex!=null){
           appendIndexs.push(idx)
           list[findIndex].name = item.name
           list[findIndex].dp = item.imageAvailable?item.image.uri:null
           this.setState({list:list})
         }
         item.mobile = strMobile
      }
      item.count = 0
    })
    appendIndexs.forEach((i)=>{
      contacts.splice(i,1)
    })
    return contacts
  }

  askPermission=async()=>{
      let { status } = await Permissions.askAsync(Permissions.CONTACTS);
      if (status === 'granted') {
       this.showContacts()
     } else {
       throw new Error('Contacts permission not granted');
    }
    }
    showContacts=async()=>{
      const { data } = await Contacts.getContactsAsync({
        fields: [  Contacts.Fields.PhoneNumbers,Contacts.Fields.Image ],

      })
    if (data.length > 0) {
      var contacts = this.checkContacts(data)
      this.setState({contacts:contacts,contactsFull:contacts})
    }
    }

    getContacts=async()=>{
      let { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        this.askPermission()
      }else{
        this.showContacts()
      }
    }
    search(){
      var search = !this.state.search
      this.setState({search:!this.state.search})
      LayoutAnimation.easeInEaseOut();
    }

    logout=()=>{
      Alert.alert('Log out','Do you want to logout?',
            [{text: 'Cancel', onPress: () => {
                return null
              }},
              {text: 'Confirm', onPress: () => {
                AsyncStorage.removeItem('myContact')
                AsyncStorage.setItem("login", JSON.stringify(false))
                this.props.navigation.navigate('LogIn')
              }},
          ],
          { cancelable: false }
        )
    }

    renderHeader=()=>{
      return(
        <View style={{height:55,width:width,}}>
        <View style={{flexDirection: 'row',height:55,alignItems: 'center',backgroundColor:themeColor}}>
           <View style={{ flex: 0.7, flexDirection: 'row', justifyContent: 'flex-start', }}>
             <Text  style={{ color:'#fff',fontWeight:'700',fontSize:18,paddingHorizontal:15}} numberOfLines={1}>ZINGOO</Text>
           </View>
           <TouchableOpacity onPress={()=>{this.search()}} style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
              <Feather name="search" size={23} color='#fff' />
           </TouchableOpacity>
           <TouchableOpacity onPress={()=>{this.logout()}} style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
              <Feather name="log-out" size={24} color="#fff" />
           </TouchableOpacity>
         </View>

     </View>
      )
    }

  makeCountZero =(item,index)=>{
    var list = this.state.list
    list[index].count = 0
    this.setState({list:list,routeName:'HomeScreen'})
    this.props.navigation.navigate('HomeScreen',{connection:this.state.connection,myContact:this.state.myContact,toContact:item})
  }



  getServerContacts=()=>{
    return(
      <View>
      <FlatList
          data={this.state.list}
          showsHorizontalScrollIndicator={false}
          extraData={this.state.list}
          style={{}}
          inverted={false}
          scrollToEnd={true}
          horizontal={false}
          nestedScrollEnabled={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index})=>{
         return(
           <Card containerStyle={[{ width: width,margin:0,padding:5,borderWidth:0}]}>
              <TouchableOpacity style={{flex:1,flexDirection:'row',marginVertical:3}} onPress={()=>{this.makeCountZero(item,index)}}>
                  <View style={{flex:0.2,justifyContent:'center',alignItems:'center'}}>
                  {item.dp!=null&&
                    <Image source={{uri:item.dp}} style={{ width:40,height:40,borderRadius:10,backgroundColor:'#f2f2f2',borderWidth:0,borderColor: "#f2f2f2"}}/>
                  }
                  {item.dp==null&&
                    <View style={{width:40,height:40,borderRadius:10,backgroundColor:'#000',borderWidth:0,borderColor: "#f2f2f2",justifyContent:'center',alignItems:'center'}}>
                      <Text style={{fontSize:25,color:'#fff',fontWeight:'600'}}>{item.name!=null?(item.name.length>0?item.name.charAt(0).toUpperCase():''):item.mobile.charAt(0)}</Text>
                    </View>
                  }
                  </View>
                  <View style={{flex:item.count==0?0.8:0.7,}}>
                    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                      <View style={{flexDirection:'row',}}>
                        <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
                          <Text   style={{ color:'#000',fontSize:16,fontWeight:'600'}} numberOfLines={1}>{item.name!=null?item.name:''}</Text>
                        </View>
                      </View>
                      <View style={{flexDirection:'row',}}>
                        <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
                          <Text   style={{ color:'#000',fontSize:14,}} numberOfLines={1}>{item.mobile}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {item.count>0&&
                    <View style={{flex:0.1,alignItems:'center',justifyContent:'center'}}>
                       <View style={{width:20,height:20,backgroundColor:'#32CD32',alignItems:'center',justifyContent:'center',borderRadius:10}}>
                          <Text style={{color:'#fff',fontSize:12}}>{item.count}</Text>
                       </View>
                    </View>
                  }
              </TouchableOpacity>
            </Card>
       ) }}
       />
      </View>
    )
  }

  goToHome=(item,index)=>{
    console.log(item);
    var list = this.state.contacts
    list[index].count = 0
    this.setState({contacts:list})
    if(item.phoneNumbers==undefined){
      ToastAndroid.showWithGravity(
        'No Mobile Number found',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      )
      return
    }else{
      this.setState({routeName:'HomeScreen'})
      this.props.navigation.navigate('HomeScreen',{connection:this.state.connection,myContact:this.state.myContact,toContact:item})
    }
  }

  searchData=(text)=>{
      var searchText = text
      var arr=[]
      var data=[]
      this.setState({searchText:text})
      if(text.length>0){
        var initialData = this.state.contactsFull
        var filterData = initialData.filter((item,idx)=>{
            if(new RegExp(searchText , 'gi' ).test(item.name)){
              return item
            }
            if(item.phoneNumbers!=undefined&&item.phoneNumbers.length>0){
              if(new RegExp(searchText , 'gi' ).test(item.phoneNumbers[0].number)){
                return item
              }
            }

        })
        var initialData1 = this.state.listFullData
        var filterData1 = initialData1.filter((item,idx)=>{
            if(new RegExp(searchText , 'gi' ).test(item.mobile)||new RegExp(searchText , 'gi' ).test(item.name)){
              return item
            }
        })
        this.setState({contacts:filterData,list:filterData1,})
      }else{
        var initialData = this.state.contactsFull
        var initialData1 = this.state.listFullData
        this.setState({contacts:initialData,list:initialData1,})
      }

  }

  render() {

    return (
     <View style={{flex:1}}>
         <View style={{height:Constants.statusBarHeight,backgroundColor:themeColor}}>
             <StatusBar  translucent={true} barStyle="light-content" backgroundColor={themeColor} networkActivityIndicatorVisible={false}    />
         </View>
         {this.renderHeader()}
         {this.state.search&&
         <View style={{width:width,flexDirection:'row',backgroundColor:'#fff',alignItems: 'center',paddingVertical:0,backgroundColor:'#fff'}}>
           <View style={{flex:1,marginHorizontal:0}}>
             <SearchBar
             ref={input => { this.inputRef = input && input.focus()}}
             placeholder="Search Contacts"
             onChangeText={(text)=>{this.searchData(text)}}
             searchIcon={{
               size:30
             }}
             clearIcon={{
               size:30
             }}
             value={this.state.searchText}
             containerStyle={{borderWidth:1,borderRadius:10,backgroundColor:'#fff',borderColor:'#fff',borderBottomColor: '#fff',borderTopColor:'#fff'}}
             inputContainerStyle={{borderWidth:1,backgroundColor:'#f2f2f2',borderColor:'#f2f2f2',borderBottomWidth:1,borderBottomColor: '#fff',borderTopColor:'#fff'}}
             />
           </View>
         </View>
       }
         {this.state.loader&&
           <View style={{flex:1,backgroundColor:'#ffff',alignItems:'center',justifyContent:'center'}}>
              <ActivityIndicator color={themeColor} size='large'/>
           </View>
         }
         {!this.state.loader&&
           <View style={{flex:1,backgroundColor:'#ffff'}}>

           <ScrollView contentContainerStyle={{paddingVertical:20,paddingTop:this.state.search?0:10}}>
                   <View style={{flex:1,backgroundColor:'#fff'}}>
                   <View style={{}}>
                   {this.getServerContacts()}
                   <FlatList
                       data={this.state.contacts}
                       showsHorizontalScrollIndicator={false}
                       extraData={this.state.contacts}
                       style={{}}
                       inverted={false}
                       scrollToEnd={true}
                       horizontal={false}
                       nestedScrollEnabled={true}
                       keyExtractor={(item, index) => index.toString()}
                       renderItem={({item, index})=>{
                      return(
                        <Card containerStyle={[{ width: width,margin:0,padding:5,borderWidth:0}]}>
                           <TouchableOpacity style={{flex:1,flexDirection:'row',marginVertical:3}} onPress={()=>{this.goToHome(item,index)}}>
                               <View style={{flex:0.2,justifyContent:'center',alignItems:'center'}}>
                               {item.imageAvailable&&
                                 <Image source={{uri:item.image.uri}} style={{ width:40,height:40,borderRadius:10,backgroundColor:'#f2f2f2',borderWidth:0,borderColor: "#f2f2f2"}}/>
                               }
                               {!item.imageAvailable&&
                                 <View style={{width:40,height:40,borderRadius:10,backgroundColor:'#000',borderWidth:0,borderColor: "#f2f2f2",justifyContent:'center',alignItems:'center'}}>
                                   <Text style={{fontSize:25,color:'#fff',fontWeight:'600'}}>{item.name.length>0?item.name.charAt(0).toUpperCase():''}</Text>
                                 </View>
                               }
                               </View>
                               <View style={{flex:item.count==0?0.8:0.7,}}>
                                 <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                                   <View style={{flexDirection:'row',}}>
                                     <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
                                       <Text   style={{ color:'#000',fontSize:16,fontWeight:'600'}} numberOfLines={1}>{item.name}</Text>
                                     </View>
                                   </View>
                                   <View style={{flexDirection:'row',}}>
                                     <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
                                     {item.phoneNumbers!=undefined&&item.phoneNumbers.length>0&&
                                       <Text   style={{ color:'#000',fontSize:14,}} numberOfLines={1}>{item.phoneNumbers[0].number}</Text>
                                     }
                                     </View>
                                   </View>
                                 </View>
                               </View>
                               {item.count>0&&
                                 <View style={{flex:0.1,alignItems:'center',justifyContent:'center'}}>
                                    <View style={{width:20,height:20,backgroundColor:'#32CD32',alignItems:'center',justifyContent:'center',borderRadius:10}}>
                                       <Text style={{color:'#fff',fontSize:12}}>{item.count}</Text>
                                    </View>
                                 </View>
                               }
                           </TouchableOpacity>
                         </Card>
                    ) }}
                    />
                   </View>
                    </View>
                </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(InitialScreen);
