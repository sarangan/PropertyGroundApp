/**
 * PG React Native App
 * @sara
 * roomlist page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  NativeModules,
  LayoutAnimation,
  View,
  Text,
  Dimensions,
  AsyncStorage,
  FlatList,
  TouchableHighlight,
  TextInput,
  ActivityIndicator,
  Image,
  Switch,
  Animated,
  Easing,
  Alert,
  ScrollView
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import NumberControl from '../components/NumberControl';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import Prompt from 'react-native-prompt';
import KeepAwake from 'react-native-keep-awake';

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;
var RNFS = require('react-native-fs');

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;
const PARALLAX_HEADER_HEIGHT = 250;
const STICKY_HEADER_HEIGHT = 40;

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

export default class RoomList extends Component{

  static navigatorButtons = {
   rightButtons: [
     {
       title: 'Refresh',
       id: 'refresh'
     }
   ],
   leftButtons: [
     {
       //title: 'Back',
       icon: require('../images/back-arrow.png'),
       id: 'cancel'
     }
   ],

 };

  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));


    this.state = {
      roomlist : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
      property: this.props.property,
      imgErr: false,
      height: 0,
      meterlist: [],
      photos: [],
      singantes_list : ['Tenant', 'Lanlord', 'Clerk'],
      sig_height: 0,
      spinValue: new Animated.Value(0),
      meter_spinValue: new Animated.Value(0),
      sync_spinValue : new Animated.Value(0),
      promptVisibleCopy: false,

    };


  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if (event.id == 'refresh') {

        this.getData();

      }
      else if(event.id == 'cancel'){

        this.props.navigator.resetTo({
          screen: 'PropertyGround.Inspections',
          title: 'Inspections',
          animated: true,
          animationType: 'fade',
          navigatorStyle:{
            navBarTextColor: 'white',
            navBarButtonColor: 'white',
            statusBarTextColorScheme: 'light',
            navBarBackgroundColor: '#00BDDB',
            navBarBlur: false,
            screenBackgroundColor: '#FFFFFF',
            navBarTransparent: false,
          },
          passProps: {
          },
        });

      }

    }
  }

  componentDidMount(){
    if(this.state.property_id){
      this.getData();
    }

    MessageBarManager.registerMessageBar(this.refs.alert);

  }

  componentWillUnmount () {

    MessageBarManager.unregisterMessageBar();
  }

  callSortList=()=>{
    this.props.navigator.push({
      screen: 'PropertyGround.SortRoomList',
      title: 'Sort room list',
      animated: true,
      //animationType: 'fade',
      backButtonTitle: "Back",
      passProps: {property_id: this.state.property_id}
    });
  }

  getData = () =>{

    AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
      let photos = JSON.parse(result) || {};

      if(photos.hasOwnProperty(this.state.property_id) ){

        this.setState({
          photos: photos[this.state.property_id]
        }, ()=>{
          this.getRoomlist();
        });

      }
      else{

        this.getRoomlist();
      }

    });

    AsyncStorage.getItem(TableKeys.PROPERTY, (err, result) => {

      let master_properties = JSON.parse(result) || [];

      for(let i =0, l = master_properties.length; i < l ; i++){
        if(this.state.property_id == master_properties[i].property_id ){

          if( master_properties[i].sync == 2){
            KeepAwake.activate();
          }
          else{
            KeepAwake.deactivate();
          }

          this.setState({
            master_property: master_properties[i],
          });
          break;
        }

      }

    });


  }

  openPromptCopy = () =>{

    this.setState({
      promptVisibleCopy: true
    });

  }

  //sync property
  doSync = () =>{

    Alert.alert(
    'Sync property',
    'Are you sure do you want to sync this property?',
        [
          {text: 'No', onPress: () => console.log('Cancel Pressed') },
          {text: 'Yes', onPress: () => this.syncProperty() },
        ],
        { cancelable: false }
      );
  }

  //set the sync flag
  syncProperty = () =>{

    KeepAwake.activate();

    AsyncStorage.getItem(TableKeys.PROPERTY, (err, result) => {
      console.log('get property details');
      let properties = JSON.parse(result) || [];

      let property = {};

      for(let i =0, l = properties.length; i < l ; i++){

        if(properties[i].property_id == this.state.property_id ){
          properties[i].sync = 2; // 1 is is not yet sync  2 is sync start  3 is sync finished
          properties[i].locked = 1; // 1 is locked  0 not locked

          property = properties[i]

          console.log('synced proeprty......');
          console.log(properties[i]);

          break;
        }

      }

        AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(properties), () => {
          this.sync_spin();
          helper.synSrv(property);
        });



    });


  }

  sync_spin() {

    this.state.sync_spinValue.setValue(0)
    Animated.timing(
      this.state.sync_spinValue,
      {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear
      }
    ).start(() => this.sync_spin())

  }

  getRoomlist =()=>{

    this.setState({
      loading: true,
      roomlist: [],
      height: 0,
      meterlist: []
    }, ()=>{

      AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {


        let roomlist = JSON.parse(result) || {};

        if(roomlist.hasOwnProperty(this.state.property_id) ){
          roomlist = roomlist[this.state.property_id];
        }
        else{
          roomlist = [];
        }

        //console.log('roomlist');
        //console.log(roomlist);
        let filter_roomlist = [];

        for(let i = 0, l = roomlist.length; i < l; i++){
          let room = roomlist[i];

          if(room.option == "NUM" && room.type == 'DEFAULT'){ // number control TODO
            //skip default types
          }
          else{
            filter_roomlist.push(room);
          }

        }

        roomlist = filter_roomlist;

        roomlist = roomlist.filter(function(item){
          return (item.status == 1);
        });

         roomlist.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} );
         roomlist.push(
           {
             prop_master_id: '',
             property_id: this.state.property_id,
             com_master_id: '',
             type: 'SIG',
             com_type: '',
             option: '',
             self_prop_master_id: 0,
             name: 'Signatures',
             priority: 0,
             total_num: 0,
             status: 1,
             mb_createdAt: '',
             sync: 1
           }
          );

          roomlist.unshift(
           {
             prop_master_id: '',
             property_id: this.state.property_id,
             com_master_id: '',
             type: 'GENERAL',
             com_type: '',
             option: '',
             self_prop_master_id: 0,
             name: 'General conditions',
             priority: 0,
             total_num: 0,
             status: 1,
             mb_createdAt: '',
             sync: 1
           }
          );

          roomlist.unshift(
           {
             prop_master_id: '',
             property_id: this.state.property_id,
             com_master_id: '',
             type: 'PROP',
             com_type: '',
             option: '',
             self_prop_master_id: 0,
             name: 'Property info',
             priority: 0,
             total_num: 0,
             status: 1,
             mb_createdAt: '',
             sync: 1
           }
          );

        this.setState({
          roomlist: roomlist,
          loading: false,
          refreshing: false
        });

      });

      AsyncStorage.getItem(TableKeys.PROPERTY_METER_LINK, (err, result) => {
        let property_meter_link = JSON.parse(result) || {};
        let meterlist =  property_meter_link[this.state.property_id] || [];
        //console.log('meter list');
        //console.log(meterlist);
        this.setState({
          meterlist
        });
      });

    });



  }

  openReport = () =>{


    this.props.navigator.push({
      screen: 'PropertyGround.Report',
      title: 'Summary Report',
      animated: true,
      animationType: 'fade',
      backButtonTitle: "Back",
      passProps: {
        property_id: this.state.property_id,
        property: this.state.property,
        syncText: this.props.syncText,
        sync: this.props.sync,
        locked: this.props.locked
      },
    });

  }

  //add new room
  handleCopy = (roomname) =>{

    if(roomname.trim().length > 0 ){


        AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {

          let prop_master_items = JSON.parse(result) || {};
          let roomlist = [];
          if(prop_master_items.hasOwnProperty(this.state.property_id) ){
            roomlist = prop_master_items[this.state.property_id];
          }

          let prop_master_id = helper.generateUid();
          for(let i=0, l = roomlist.length; i < l ; i++){
            if( roomlist[i].property_id == this.state.property_id &&  roomlist[i].com_type == 'SUB' && roomlist[i].type == 'DEFAULT' &&  roomlist[i].name == 'Bedroom'){

              console.log('copied room!');

              let new_room = {
                prop_master_id: prop_master_id,
                property_id: this.state.property_id,
                com_master_id: roomlist[i].com_master_id,
                type: 'SELF',
                com_type: roomlist[i].com_type,
                option: roomlist[i].option,
                self_prop_master_id: roomlist[i].prop_master_id,
                name: roomname,
                priority: roomlist[i].priority,
                total_num: roomlist[i].total_num,
                status: 1,
                mb_createdAt: new Date().toLocaleDateString(),
                sync: 1
              };
              roomlist.push(new_room);
              this.addSubitem(prop_master_id, roomlist[i].prop_master_id );

              break;
            }
          }

          prop_master_items[this.state.property_id] = roomlist;

          // saved to store
          AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(prop_master_items), () => {
            console.log('property master table stored');
            console.log(prop_master_items);


            MessageBarManager.showAlert({
              message: 'Successfully saved!',
              alertType: 'success',
              animationType: 'SlideFromTop',
              position: 'top',
              shouldHideOnTap: true,
              stylesheetSuccess : { backgroundColor : '#64c8af', strokeColor : '#64c8af'  },
              messageStyle: {color: '#ffffff', fontWeight: '700', fontSize: 15 },
              duration: 700,
              durationToShow: 0,
              durationToHide: 300,
            });

            this.getRoomlist();


          });

        });

    }
    else{
      MessageBarManager.showAlert({
        message: 'Please enter valid room name!',
        alertType: 'success',
        animationType: 'SlideFromTop',
        position: 'top',
        shouldHideOnTap: true,
        stylesheetSuccess : { backgroundColor : '#ea5c5c', strokeColor : '#ea5c5c' },
        messageStyle: {color: '#ffffff', fontWeight: '700', fontSize: 15 },
        duration: 800,
        durationToShow: 0,
        durationToHide: 300

      });
    }


  }


  // new method
  addSubitem =(prop_master_id, copy_prop_master_id ) =>{

    AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
      let property_subitem_link = JSON.parse(result) || [];


        console.log('getting sub items');
        console.log(property_subitem_link[copy_prop_master_id]);
        console.log(copy_prop_master_id);
        console.log(prop_master_id);


        if(property_subitem_link.hasOwnProperty(copy_prop_master_id) ){

          let sub_items = property_subitem_link[copy_prop_master_id];

            let property_subitem_link_list = [];
            for(let i=0, l = sub_items.length; i < l; i++){

              let prop_subitem_id = helper.generateUid();
              let data_property_subitem_link = {
                prop_subitem_id: prop_subitem_id,
                property_id: this.state.property_id,
                prop_master_id: prop_master_id,
                com_subitem_id: sub_items[i].com_subitem_id,
                com_master_id:  sub_items[i].com_master_id,
                item_name: sub_items[i].item_name,
                type: sub_items[i].type,
                priority: sub_items[i].priority,
                status: 1,
                mb_createdAt: new Date().toLocaleDateString(),
                sync: 1
              };

              property_subitem_link_list.push(data_property_subitem_link);


            }

            AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
              let property_subitem_link = JSON.parse(result) || {};

              property_subitem_link[prop_master_id] = property_subitem_link_list;

              AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(property_subitem_link), () => {
                console.log('property sub table stored');

              });// prop sub item saving end

            });


        }


    });


  }




  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 0,
          //marginTop: 20,
        }}
      >
        <ActivityIndicator animating />
      </View>
    );
  };

  renderSeparator = () => {
   return (
     <View
       style={{
         //flex: 1,
          height: 1,
          alignSelf: 'flex-end',
          // width: '80%',
          // marginRight: 10
          // marginBottom: 1,
          // marginTop: 1,
       }}
     />
   );
 };

  renderHeader = () => {
    return null;
  }

  handleRefresh = () => {
     this.setState(
       {
         refreshing: true,
         //properties: [],
       },
       () => {
         this.getProperties();

       }
     );
   };

  renderEmptyData = () =>{
    return(
      <View style={{ flex: 1, width: SCREENWIDTH,  alignContent:'center', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} >
        <Image style={{ width: 80, height: 80, marginTop: SCREENHEIGHT / 3 }} source={require('../images/nodata.png')} />
      </View>
    );
  }

  getPhotoStatus = (item) =>{
    let photo = '';
    //console.log(item);
    if(item.type == 'SIG' || item.type == 'PROP' || item.type == 'GENERAL'){
        photo = ' ';
    }
    else{
      if(this.state.photos.hasOwnProperty(item.prop_master_id) ){



        let master_photos = this.state.photos[item.prop_master_id];
        if(item.com_type ==  'ITEM'){
          if(master_photos.hasOwnProperty(item.prop_master_id)){

            let num_photos  = master_photos[item.prop_master_id].length;
            photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';

          }
          else{
            photo = 'no images';
          }
        }
        else{


          let num_photos = 0;
          for(let key in master_photos){
            num_photos  += master_photos[key].length;
          }

          photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';
        }


      }
      else{
        photo = 'no images';
      }

    }

    return photo;

  }

  getMeterPhotoStatus = (item, prop_master_id) =>{
    let photo = '';
    //console.log(item);
    if(this.state.photos.hasOwnProperty(prop_master_id) ){

      let master_photos = this.state.photos[prop_master_id];
      if(master_photos.hasOwnProperty(item.prop_meter_id)){

        // let items = Object.keys(master_photos);
        // let num_photos = 0;
        // for(let key in master_photos){
        //   num_photos  += master_photos[key].length;
        // }
        //
        // photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';


        let num_photos = master_photos[item.prop_meter_id].length;
        photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';
      }
      else{
        photo = 'no images';
      }
    }
    else{
      photo = 'no images';
    }

    return photo;

  }

  getAddress(address_1, address_2, city, postalcode ){
      address_1 = encodeURIComponent(address_1);
      address_2 = encodeURIComponent(address_2);
      city = encodeURIComponent(city);
      postalcode = encodeURIComponent(postalcode);
      let adds = "https://maps.googleapis.com/maps/api/staticmap?center=" +  address_1 + " " + postalcode +"&zoom=15&size=300x180&markers=size:mid%7C" + address_1 + " " + postalcode + "&key=AIzaSyAk86Lc4LhpzNywnlyjr0P1MecBjz8GQSk";
    return adds;
  }

  openLink = (item) =>{


    if(item.type == "PROP"){

      this.props.navigator.push({
        screen: 'PropertyGround.EditPropertyInfo',
        title: 'Edit property',
        animated: true,
        animationType: 'fade',
        backButtonTitle: "Back",
        passProps: {
          property_id: this.state.property_id,
          property: this.state.property
        },
      });

    }
    else if(item.type == 'GENERAL'){

      this.props.navigator.push({
        screen: 'PropertyGround.GeneralCondition',
        title: 'General conditions',
        animated: true,
        animationType: 'fade',
        backButtonTitle: "Back",
        passProps: {
          property_id: this.state.property_id,
        },
      });

    }
    else if(item.com_type == 'SUB'){
      console.log('its sub');
      this.props.navigator.push({
        screen: 'PropertyGround.SubItemsList',
        title: item.name,
        animated: true,
        animationType: 'fade',
        backButtonTitle: "Back",
        passProps: {
          property_id: this.state.property_id,
          master_id: item.prop_master_id,
          prop_master_name: item.name,
        },
      });

    }
    else if(item.com_type == 'ITEM'){
      console.log('its single');
      this.props.navigator.push({
        screen: 'PropertyGround.SingleItem',
        title: item.name,
        animated: true,
        animationType: 'fade',
        backButtonTitle: "Back",
        passProps: {
          property_id: this.state.property_id,
          item_id : item.prop_master_id,
          parent_id: item.prop_master_id,
          type : 'ITEM', //SUB ITEM METER GENERAL,
        },
      });

    }
    else if(item.com_type == 'METER'){
      if(this.state.height == 200){

        Animated.timing(
          this.state.meter_spinValue,
               {
                toValue: 0,
                duration: 200,
                easing: Easing.linear
               }
           ).start( ()=>{
             LayoutAnimation.easeInEaseOut();
             this.setState(
               {
                 height: 0
               });
           });

      }
      else{
        Animated.timing(
          this.state.meter_spinValue,
               {
                toValue: 1,
                duration: 200,
                easing: Easing.linear
               }
           ).start( ()=>{
                LayoutAnimation.spring();
                this.setState(
                  {
                    height: 200
                  });

          });
      }
    }
    else if(item.type == 'SIG'){

      if(this.state.sig_height == 140){

        Animated.timing(
          this.state.spinValue,
               {
                toValue: 0,
                duration: 200,
                easing: Easing.linear
               }
           ).start( ()=>{

             LayoutAnimation.easeInEaseOut();
             this.setState(
               {
                 sig_height: 0,

               });

        });


      }
      else{
        Animated.timing(
          this.state.spinValue,
               {
                toValue: 1,
                duration: 200,
                easing: Easing.linear
               }
           ).start( ()=>{

             LayoutAnimation.spring();
             this.setState({
               sig_height: 140
             },()=>{

               //this.scrolllist.scrollToEnd({animated: true});

               //this.scrolllist.scrollToOffset({x: 0, y: 500 });

             });

           });
      }


    }


  }

  openMeter = (meter, room_item) =>{
    console.log(meter);
    this.props.navigator.push({
      screen: 'PropertyGround.MeterItem',
      title: meter.meter_name,
      animated: true,
      animationType: 'fade',
      backButtonTitle: "Back",
      passProps: {
        prop_meter_id: meter.prop_meter_id,
        meter: meter,
        property_id: this.state.property_id,
        prop_master_id: room_item.prop_master_id
      },
    });
  }

  //get sub meters
  getMeters  = (room_item) =>{
      return(
        <View style={{
          overflow: 'hidden',
          flexDirection: 'column',
          flex: 1,
          // justifyContent: 'center',
          // alignItems: 'center',
          height: this.state.height }}>
          {
            this.state.meterlist.map( (item, i) =>{
              return(
                  <TouchableHighlight underlayColor="transparent" style={{paddingLeft: 15, paddingRight: 10, flex: 1, borderBottomColor: '#F0F1F3', borderBottomWidth: 1}}
                    onPress={()=>this.openMeter(item, room_item)} key={i+1}>

                      <View style={styles.rowWrapper}>
                        <View style={[styles.listContainer,{marginTop: 6, flex: 3}]}>
                          <Text style={styles.subtitle}>{item.meter_name}</Text>
                          <View style={{justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row', flex: 1}}>
                            <Text style={styles.photoTxt}>{this.getMeterPhotoStatus(item, room_item.prop_master_id)}</Text>
                            <Image
                              source={require('../images/arrow_right_colored.png')}
                              style = {styles.arrowRight}
                            />
                          </View>
                        </View>
                      </View>

                    </TouchableHighlight>
                    )
            })
          }
        </View>
      );
  }

  getSigns  = (room_item) =>{

      return(
        <View style={{
          overflow: 'hidden',
          flexDirection: 'column',
          flex: 1,
          // justifyContent: 'center',
          // alignItems: 'center',
          height: this.state.sig_height }}>
          {
            this.state.singantes_list.map( (item, i) =>{
              return(
                  <TouchableHighlight underlayColor="transparent" style={{paddingLeft: 15, paddingRight: 10, flex: 1, borderBottomColor: '#F0F1F3', borderBottomWidth: 1}}
                    onPress={()=>this.openSig(item, room_item)} key={i+1}>

                      <View style={styles.rowWrapper}>
                        <View  style={[styles.listContainer,{marginTop: 6, flex: 3}]}>
                          <Text style={styles.subtitle}>{item}</Text>
                          <View style={{justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row', flex: 1}}>
                            <Image
                              source={require('../images/arrow_right_colored.png')}
                              style = {styles.arrowRight}
                            />
                          </View>
                        </View>
                      </View>

                    </TouchableHighlight>
                    )
            })
          }
        </View>
      );
  }

  openSig = (sig, room_item) =>{

    this.props.navigator.push({
      screen: 'PropertyGround.Signaturepad',
      title: 'Signaturepad',
      animated: true,
      animationType: 'fade',
      backButtonTitle: "Back",
      passProps: {
        property_id: this.state.property_id,
        type: sig
      },
    });
  }

  _getArrow = (type, com_type) =>{


       let img = <Image
         source={require('../images/arrow_right.png')}
         style = {styles.arrowRight}
       />

       if(type == 'SIG'){
         let spin = this.state.spinValue.interpolate({
              inputRange: [0,1],
              outputRange: ['0deg', '90deg']
          });

         img = <Animated.Image
           source={require('../images/arrow_right.png')}
           style = {[styles.arrowRight, {transform: [{rotate: spin}] }  ]}
         />
       }

       if(com_type ==  'METER'){
         let spin = this.state.meter_spinValue.interpolate({
              inputRange: [0,1],
              outputRange: ['0deg', '90deg']
          });

         img = <Animated.Image
           source={require('../images/arrow_right.png')}
           style = {[styles.arrowRight, {transform: [{rotate: spin}] }  ]}
         />
       }

    return(img);

  }

  _renderItem = ({item}) => (

    <TouchableHighlight underlayColor='transparent' aspectRatio={1} onPress={()=>this.openLink(item)}>

          <View style={styles.rowWrapper}>
            <View  style={styles.listContainer} >
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.imagePhotosWrapper}>
                <Text style={styles.photoTxt}>{this.getPhotoStatus(item)}</Text>

                {this._getArrow(item.type, item.com_type)}
              </View>

            </View>

            {item.com_type == 'METER' &&
              this.getMeters(item)
            }

            {item.type == 'SIG' &&
              this.getSigns(item)
            }

          </View>

    </TouchableHighlight>

  );

  //render actionBar
  renderActionBar = () =>{

    const spin = this.state.sync_spinValue.interpolate({
       inputRange: [0, 1],
       outputRange: ['0deg', '360deg']
     })

    return(

        <View style={styles.actionBar}>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem} onPress={()=>this.doSync()}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Sync</Text>

              <Animated.Image
                style={[styles.actionBarIcon, { transform: [{rotate: spin}] } ] }
                  source={require('../images/sync.png')}
              />
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem}  onPress={()=>this.openPromptCopy()}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Add room</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/add_room.png')} >
              </Image>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem} onPress={()=>this.openReport()}
            >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Preview</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/preview.png')} >
              </Image>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem} onPress={()=>this.callSortList()}
            >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Sort</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/sort.png')} >
              </Image>
            </View>
          </TouchableHighlight>

      </View>

      );

  };


  renderList(){


    let _keyExtractor = (item, index) => index;
    return(
      <FlatList
        //ref={ ( ref ) => this.scrolllist = ref }
        contentContainerStyle={styles.list}
        data={this.state.roomlist}
        keyExtractor={_keyExtractor}
        renderItem={this._renderItem}
        ListFooterComponent={this.renderFooter}
        ItemSeparatorComponent={this.renderSeparator}
        extraData={this.state}
        ListEmptyComponent={this.renderEmptyData}
      />
    );
  }

  getHeaderImg =()=>{
    let map_url = this.getAddress(this.state.property.address_1 , this.state.property.address_2, this.state.property.city, this.state.property.postalcode);
    //console.log(map_url);
    let img =
    <Image source={{uri: map_url,
                  width: SCREENWIDTH,
                height: PARALLAX_HEADER_HEIGHT}}
                onError= { ()=> this.setState({ imgErr: true}) }
    />;
    return img;

  }

  render(){
     const { onScroll = () => {} } = this.props;

    return(
      <View style={styles.fill}>
        <ParallaxScrollView
            headerBackgroundColor="#F9F9F9"
            backgroundColor="#F9F9F9"
            stickyHeaderHeight={ STICKY_HEADER_HEIGHT }
            parallaxHeaderHeight={ PARALLAX_HEADER_HEIGHT }
            backgroundSpeed={10}
            // backgroundColor="#e8e8e8"
             contentBackgroundColor="#F9F9F9"

            renderBackground={() => (

                <View key="background">

                  {this.state.property.image_url !== '' &&
                    <Image source={{uri: RNFS.DocumentDirectoryPath + '/' + this.state.property.image_url,
                                  width: SCREENWIDTH,
                                height: PARALLAX_HEADER_HEIGHT}}
                    />
                  }

                  {this.state.imgErr == false && this.state.property.image_url == '' &&
                    this.getHeaderImg()
                  }

                  {this.state.imgErr == true && this.state.property.image_url == '' &&
                    <Image
                      source={require('../images/property.png')}
                      style = {{
                        width: SCREENWIDTH,
                        height: PARALLAX_HEADER_HEIGHT }}
                    />
                  }

                  <View style={{position: 'absolute',
                            top: 0,
                            //width: SCREENWIDTH,
                            width: '100%',
                            backgroundColor: 'rgba(0,0,0,.1)',
                            height: PARALLAX_HEADER_HEIGHT}}/>

                </View>


            )}

            renderForeground={() => (
              <View key="parallax-header" style={ styles.parallaxHeader }>
                <Text style={{ width: '100%', position: 'absolute', padding: 10, left: '0%', bottom: '16%', fontWeight: '700', fontSize: 13, color:"#e1e1e1", backgroundColor: 'rgba(129, 197, 211, 0.4)'}}>
                  {this.state.property.address_1}
                </Text>
                {this.renderActionBar()}

              </View>
            )}

            renderStickyHeader={() => (
              <View key="sticky-header" style={styles.stickySection}>

                {this.renderActionBar()}

              </View>
            )}

            >
            <View style={{  flex: 1, }} >


              {this.renderList()}


            </View>
        </ParallaxScrollView>

        <Prompt
            title="Add new room"
            placeholder="Enter your room name here"
            defaultValue={'copy of room'}
            visible={this.state.promptVisibleCopy}
            onCancel={() => this.setState({ promptVisibleCopy: false } )}
            onSubmit={(value) => this.setState({ promptVisibleCopy: false }, ()=>{ this.handleCopy(value); } )}/>

        <MessageBarAlert ref='alert' />


    </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#F9F9F9'
  },
  list: {
    flex: 1,
    //justifyContent: 'center',
    flexDirection: 'column',
    //width: SCREENWIDTH
  },
  rowWrapper:{
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    //width: SCREENWIDTH,
    backgroundColor: '#FFFFFF'
  },
  listContainer:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title:{
    fontSize: 15,
    fontWeight: "700",
    color: "#475566"
  },
  subtitle:{
    fontSize: 14,
    fontWeight: "600",
    color: "#747478"
  },
  photoTxt:{
    fontSize: 13,
    fontWeight: "700",
    color: "#D9D9D9"
  },
  parallaxHeader: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  stickySection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    //paddingTop: 10
  },
  imagePhotosWrapper:{
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  arrowRight:{
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginLeft: 10
  },

  actionBar:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    //width: SCREENWIDTH,
    height: 40,
    backgroundColor: '#F9F9F9',
    paddingLeft: 20,
    paddingRight: 20,

  },
  actionBarItem:{
    // width: 30,
    // height: 30
    alignContent: 'center',
    padding: 5
  },
  actionBarIcon: {
    alignSelf: 'center',
    width: 15,
    height: 15
  },
  actionBarRefine:{
    color: '#ffffff',
    backgroundColor: '#333333',
    fontSize: 10,
    padding: 3
  },
  actionBarDivder:{
    width: 7,
    height: 20,
    resizeMode: 'cover'
  },
  actionBarIconSticky: {
    width: 25,
    height: 25
  },
  actionBarTxt:{
    // paddingBottom:1,
    // paddingTop:2,
    marginRight: 2,
    color: '#333333',
    fontWeight: '600',
    marginRight: 5
  },
});
