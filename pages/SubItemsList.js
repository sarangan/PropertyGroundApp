/**
 * PG React Native App
 * https://sph.com.sg
 * @sara
 * sub items list page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  AsyncStorage,
  FlatList,
  TouchableHighlight,
  TextInput,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import Prompt from 'react-native-prompt';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class SubItemsList extends Component{

  static navigatorButtons = {
    rightButtons: [
      {
        title: 'Refresh',
        id: 'refresh'
      }
    ],

 };

  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      subitems : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
      prop_master_id: this.props.master_id,
      prop_master_name: this.props.prop_master_name,
      promptVisible: false,
      promptVisibleCopy: false,
      photos: []
    };

    this.property_subitem_feedback = {};

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if (event.id == 'refresh') {

        this.getData();

      }

    }
  }

  componentDidMount(){

    MessageBarManager.registerMessageBar(this.refs.alert);

    if(this.state.property_id){
      this.getData();
    }

  }

  componentWillUnmount () {
    this.hanldeSave(false);
    // Remove the alert located on this master page from te manager
    MessageBarManager.unregisterMessageBar();
  }

  //save data
  hanldeSave=(showMsg = false)=>{

    this.setState({
      loading: true
    });

  }

  getData = () =>{

    AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
      let photos = JSON.parse(result) || {};

      if(photos.hasOwnProperty(this.state.property_id) ){

         if(photos[this.state.property_id].hasOwnProperty(this.state.prop_master_id) ){

           this.setState({
             photos: photos[this.state.property_id][this.state.prop_master_id]
           }, ()=>{
             this.getSubItemsList();
           });

         }
         else{
             this.getSubItemsList();
         }


      }
      else{

        this.getSubItemsList();
      }

    });


  }

  getSubItemsList =()=>{
    console.log('general condition link');
    this.setState({
      loading: true
    });

    AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
      let property_subitem_link = JSON.parse(result) || [];


        console.log('getting sub items');
        console.log(property_subitem_link[this.state.prop_master_id]);
        console.log(this.state.prop_master_id);


        if(property_subitem_link.hasOwnProperty(this.state.prop_master_id) ){

          let sub_items = property_subitem_link[this.state.prop_master_id];
          this.setState({
            loading: false,
            subitems: sub_items,
            refreshing: false,
          });
        }
        else{

          this.setState({
            loading: false,
            refreshing: false,
          });

        }


    });

  }

  //open subitem
  openLink = (item) =>{

    if(item.type != 'GENERAL'){
      this.props.navigator.push({
        screen: 'PropertyGround.SingleItem',
        title: item.item_name,
        animated: true,
        animationType: 'fade',
        backButtonTitle: "Back",
        passProps: {
          property_id: this.state.property_id,
          item_id : item.prop_subitem_id,
          parent_id: this.state.prop_master_id,
          type : 'SUB', //SUB ITEM METER GENERAL,
        },
      });
    }


  }

  openGenComment = (item) =>{
    console.log(item);

    this.props.navigator.showModal({
        screen: "PropertyGround.GeneralComment",
        title: 'General comments',
        animationType: 'slide-up',
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
          property_id: this.state.property_id,
          general_id : item.prop_subitem_id,
          prop_master_id: item.prop_master_id,
        },
    });

  }

  openGenPhotos = (item) =>{

    this.props.navigator.showModal({
        screen: "PropertyGround.GeneralPhoto",
        title: 'General photos',
        animationType: 'slide-up',
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
          property_id: this.state.property_id,
          general_id : item.prop_subitem_id,
          prop_master_id: item.prop_master_id,
        },
    });

  }

  openGenAudio = (item) =>{
    console.log(item);

    this.props.navigator.showModal({
        screen: "PropertyGround.GeneralAudio",
        title: 'Audios',
        animationType: 'slide-up',
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
          property_id: this.state.property_id,
          general_id : item.prop_subitem_id,
          prop_master_id: item.prop_master_id,
        },
    });

  }

  // rename master item
  handleRename =(roomname)=>{


    if(roomname.trim().length > 0 ){

      console.log(roomname);

      AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {

        let prop_master_items = JSON.parse(result) || {};
        let roomlist = [];
        if(prop_master_items.hasOwnProperty(this.state.property_id) ){
          roomlist = prop_master_items[this.state.property_id];
        }

        for(let i=0, l = roomlist.length; i < l ; i++){
          if(roomlist[i].prop_master_id == this.state.prop_master_id){
            roomlist[i].name = roomname;
            break;
          }
        }

        prop_master_items[this.state.property_id] = roomlist;

        // saved to store
        AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(prop_master_items), () => {
          console.log('property master table stored');

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


  handleDelete = () =>{
    Alert.alert(
    'Remove room',
    'Are you sure do you want to remove this room?',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed') },
          {text: 'OK', onPress: () => this.removeRoom() },
        ],
        { cancelable: false }
      );

  }

  removeRoom = () =>{

    if(this.state.prop_master_id ){


      AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {

        let prop_master_items = JSON.parse(result) || {};
        let roomlist = [];
        if(prop_master_items.hasOwnProperty(this.state.property_id) ){
          roomlist = prop_master_items[this.state.property_id];
        }

        for(let i=0, l = roomlist.length; i < l ; i++){
          if(roomlist[i].prop_master_id == this.state.prop_master_id){
            roomlist.splice(i, 1);
            break;
          }
        }

        prop_master_items[this.state.property_id] = roomlist;

        // saved to store
        AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(prop_master_items), () => {
          console.log('property master table stored');

          MessageBarManager.showAlert({
            message: 'Successfully removed! Please refresh the roomlist',
            alertType: 'success',
            animationType: 'SlideFromTop',
            position: 'top',
            shouldHideOnTap: true,
            stylesheetSuccess : { backgroundColor : '#64c8af', strokeColor : '#64c8af'  },
            messageStyle: {color: '#ffffff', fontWeight: '700', fontSize: 15 },
            duration: 800,
            durationToShow: 0,
            durationToHide: 300,
            onHide: ()=>{
                this.props.navigator.pop({
                  animated: true,
                  animationType: 'fade',
                });
            }
          });


        });

      });

    }
    else{
      MessageBarManager.showAlert({
        message: 'Could not remove the room!',
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

  openPrompt = () =>{

    this.setState({
      promptVisible: true
    });

  }

  handleCopy = (roomname) =>{

    if(roomname.trim().length > 0 ){

      AsyncStorage.getItem(TableKeys.PROPERTY_FEEDBACK, (err, result) => {
        this.property_subitem_feedback = JSON.parse(result) || {};

        AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {

          let prop_master_items = JSON.parse(result) || {};
          let roomlist = [];
          if(prop_master_items.hasOwnProperty(this.state.property_id) ){
            roomlist = prop_master_items[this.state.property_id];
          }

          let prop_master_id = helper.generateUid();
          for(let i=0, l = roomlist.length; i < l ; i++){
            if(roomlist[i].prop_master_id == this.state.prop_master_id){
              let new_room = {
                prop_master_id: prop_master_id,
                property_id: this.state.property_id,
                com_master_id: roomlist[i].com_master_id,
                type: roomlist[i].type,
                com_type: roomlist[i].com_type,
                option: roomlist[i].option,
                self_prop_master_id: roomlist[i].self_prop_master_id,
                name: roomname,
                priority: roomlist[i].priority,
                total_num: roomlist[i].total_num,
                status: 1,
                mb_createdAt: new Date().toLocaleDateString(),
                sync: 1
              };
              roomlist.push(new_room);
              this.addSubitem(prop_master_id );

              break;
            }
          }

          prop_master_items[this.state.property_id] = roomlist;

          // saved to store
          AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(prop_master_items), () => {
            console.log('property master table stored');

            //save feedback
            AsyncStorage.setItem(TableKeys.PROPERTY_FEEDBACK, JSON.stringify(this.property_subitem_feedback), () => {
              console.log('property feedback saved');
              console.log(this.property_subitem_feedback);
            });

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


          });

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
  addSubitem =(prop_master_id ) =>{

      let property_subitem_link_list = [];
      for(let i=0, l = this.state.subitems.length; i < l; i++){

        let prop_subitem_id = helper.generateUid();
        let data_property_subitem_link = {
          prop_subitem_id: prop_subitem_id,
          property_id: this.state.property_id,
          prop_master_id: prop_master_id,
          com_subitem_id: this.state.subitems[i].com_subitem_id,
          com_master_id:  this.state.subitems[i].com_master_id,
          item_name: this.state.subitems[i].item_name,
          type: this.state.subitems[i].type,
          priority: this.state.subitems[i].priority,
          status: 1,
          mb_createdAt: new Date().toLocaleDateString(),
          sync: 1
        };

        property_subitem_link_list.push(data_property_subitem_link);
        if( this.state.subitems[i].type == 'GENERAL'){
          this.copyGeneralFeedback( prop_subitem_id, prop_master_id, this.state.subitems[i].prop_subitem_id );
        }
        else{
          this.copyFeedback( prop_subitem_id, prop_master_id, this.state.subitems[i].prop_subitem_id );
        }


      }

      AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
        let property_subitem_link = JSON.parse(result) || {};

        property_subitem_link[prop_master_id] = property_subitem_link_list;

        AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(property_subitem_link), () => {
          console.log('property sub table stored');
        });// prop sub item saving end

      });


  }

  // copt general feedback
  copyGeneralFeedback = ( prop_subitem_id, prop_master_id, original_sub_item_id ) =>{

    AsyncStorage.getItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, (err, result) => {
      let property_sub_feedback_general = JSON.parse(result) || {};

      if(property_sub_feedback_general.hasOwnProperty(this.state.property_id) ){

        let feedbacks = property_sub_feedback_general[this.state.property_id];

        if(feedbacks.hasOwnProperty(original_sub_item_id) ){ //same item id
          console.log("==========found sub item =================");

          console.log()
          console.log(feedbacks[original_sub_item_id].comment)

          let gen_id = helper.generateUid();
          let feedback = {
            prop_sub_feedback_general_id: gen_id,
            property_id: this.state.property_id,
            item_id: prop_subitem_id,
            parent_id: prop_master_id,
            comment: feedbacks[original_sub_item_id].comment,
            mb_createdAt:  new Date().toLocaleDateString(),
            sync: 1
          }
          feedbacks[prop_subitem_id] = feedback;

          property_sub_feedback_general[this.state.property_id] = feedbacks;

          AsyncStorage.setItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, JSON.stringify(property_sub_feedback_general), () => {
            console.log('general property feedback saved');
            console.log(property_sub_feedback_general);

          });


        }
      }
    });

  }

  // feedback copy
  copyFeedback = (prop_subitem_id, prop_master_id, original_sub_item_id) =>{

    let feedbacks = {}; // for this property id
    if (this.property_subitem_feedback.hasOwnProperty(this.state.property_id) ){
      feedbacks =  this.property_subitem_feedback[this.state.property_id];
    }

    for (var item_id in feedbacks) {
      if (feedbacks.hasOwnProperty(item_id)) {

        if(item_id == original_sub_item_id ){ // yes its our feedback

          let feedback = {
            prop_feedback_id: helper.generateUid(),
            property_id: this.state.property_id,
            item_id: prop_subitem_id,
            parent_id: prop_master_id,
            option: feedbacks[item_id].option,
            description: feedbacks[item_id].description,
            comment: feedbacks[item_id].comment,
            type: feedbacks[item_id].type,
            mb_createdAt:  new Date().toLocaleDateString(),
            sync: 1
          }

          feedbacks[prop_subitem_id] = feedback;
          this.property_subitem_feedback[this.state.property_id] = feedbacks;
        }

      }
    }

  }

  openPromptCopy = () =>{

    this.setState({
      promptVisibleCopy: true
    });

  }

  getPhotoStatus = (item) =>{
    let photo = '';
    //console.log(item);
    if(this.state.photos.hasOwnProperty(item.prop_subitem_id)){

      let num_photos  = this.state.photos[item.prop_subitem_id].length;
      photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';

    }
    else{
      photo = 'no images';
    }

    return photo;

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
          height: 2,
          alignSelf: 'flex-end',
          width: '100%',
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
         this.getData();

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

  //render actionBar
  renderActionBar = () =>{
    return(

        <View style={styles.actionBar}>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem} onPress={()=>this.openPromptCopy()}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Copy</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/copy.png')} >
              </Image>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem} onPress={()=>this.handleDelete()}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Remove</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/delete.png')} >
              </Image>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem} onPress={()=>this.openPrompt()}
            >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Rename</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/edit.png')} >
              </Image>
            </View>
          </TouchableHighlight>

      </View>

      );

  };

  _renderItem = ({item}) => (
    <TouchableHighlight underlayColor='transparent' aspectRatio={1} onPress={()=>this.openLink(item)}>

          <View style={styles.rowWrapper}>
            <View  style={styles.listContainer} >
              <Text style={styles.title}>{item.item_name}</Text>
              <View style={styles.imagePhotosWrapper}>
                {item.type == 'GENERAL' &&
                  <View style={styles.roundBoxWrapper}>
                      <TouchableHighlight style={styles.roundBox} underlayColor='transparent'  onPress={()=>this.openGenComment(item)}>
                        <Image
                          source={require('../images/gen_chat.png')}
                          style = {styles.genIcons}
                        />
                      </TouchableHighlight>
                      <TouchableHighlight style={styles.roundBox} underlayColor='transparent' onPress={()=>this.openGenPhotos(item)}>
                        <Image
                          source={require('../images/gen_camera.png')}
                          style = {styles.genIcons}
                        />
                      </TouchableHighlight>
                      <TouchableHighlight underlayColor='transparent' style={styles.roundBox} onPress={()=>this.openGenAudio(item)} >
                        <Image
                          source={require('../images/gen_voice.png')}
                          style = {styles.genIcons}
                        />
                      </TouchableHighlight>
                  </View>
                }
                {item.type == 'ITEM' &&
                  <View style={styles.imagePhotosWrapper}>
                    <Text style={styles.photoTxt}>{this.getPhotoStatus(item)}</Text>
                    <Image
                      source={require('../images/arrow_right.png')}
                      style = {styles.arrowRight}
                    />
                  </View>
                }
              </View>

            </View>

          </View>

    </TouchableHighlight>
  );

  render(){
    let _keyExtractor = (item, index) => index;
    return(
      <View style={styles.fill}>

        <FlatList
          contentContainerStyle={styles.list}
          data={this.state.subitems}
          keyExtractor={_keyExtractor}
          renderItem={this._renderItem}
          ListFooterComponent={this.renderFooter}
          ItemSeparatorComponent={this.renderSeparator}
          extraData={this.state}
          ListEmptyComponent={this.renderEmptyData}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
        />
        <MessageBarAlert ref='alert' />
        <View style={styles.footer}>
          {this.renderActionBar()}
        </View>
        <Prompt
            title="Rename room"
            placeholder="Enter your room name here"
            defaultValue={this.state.prop_master_name}
            visible={this.state.promptVisible}
            onCancel={() => this.setState({ promptVisible: false } )}
            onSubmit={(value) => this.setState({ promptVisible: false }, ()=>{ this.handleRename(value); } )}/>

        <Prompt
            title="Copy room"
            placeholder="Enter your room name here"
            defaultValue={'copy of ' +  this.state.prop_master_name}
            visible={this.state.promptVisibleCopy}
            onCancel={() => this.setState({ promptVisibleCopy: false } )}
            onSubmit={(value) => this.setState({ promptVisibleCopy: false }, ()=>{ this.handleCopy(value); } )}/>

      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingBottom: 40
  },
  list: {
    justifyContent: 'center',
    flexDirection: 'column',
    width: SCREENWIDTH
  },
  rowWrapper:{
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    width: SCREENWIDTH,
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
  photoTxt:{
    fontSize: 13,
    fontWeight: "700",
    color: "#D9D9D9"
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
  genIcons:{
    width: 22,
    height: 22,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  roundBoxWrapper:{
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  roundBox:{
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#86C9D5',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footer:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#FDFDFD',
    borderTopWidth: 1,
    borderTopColor: '#FDFDFD',
    width: SCREENWIDTH,
    height: 50,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  actionBar:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: SCREENWIDTH,
    height: 40,
    backgroundColor: '#F9F9F9'
  },
  actionBarItem:{
    // width: 30,
    // height: 30
    alignContent: 'center',
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
    color: '#333333'
  },

});
