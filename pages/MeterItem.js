/**
 * Sanppar React Native App
 * @sara
 * meter item page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableHighlight,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  AsyncStorage,
  FlatList,
  Switch,
  KeyboardAvoidingView
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import FilterPicker from "../components/FilterPicker";
import Simage from "../components/Simage";
import PGCamera from "../components/PGCamera";

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;
var RNFS = require('react-native-fs');

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;
const GRIDWIDTH = Dimensions.get('window').width / 3;
GRIDWIDTH = 120; //GRIDWIDTH - 5;

export default class MeterItem extends Component{

  static navigatorButtons = {
     rightButtons: [
       {
         title: 'Save',
         id: 'save'
       }
     ]

   };


  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      property_id: this.props.property_id,
      loading: false,
      photos: [],
      feedback: {},
      prop_feedback_id: false,
      meter_feedbacks: {},
      reading_value: this.props.meter.reading_value,
      prop_meter_id: this.props.prop_meter_id,
      prop_master_id: this.props.prop_master_id,
      meter:  this.props.meter,
      type: 'METER',
      description: false,
      comment: '',
      isCamera: false,
      canSelect: false,
      selected: [],
    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'save') {
        this.handleSave(true);
      }

    }
  }

 componentWillUnmount () {
   this.handleSave(false);
   // Remove the alert located on this master page from te manager
   MessageBarManager.unregisterMessageBar();
 }

  componentDidMount(){
    this.getDetails();
    MessageBarManager.registerMessageBar(this.refs.alert);

  }

  //get the meter feedback
  //get the whichever item details
  getDetails = () =>{

    if(this.state.property_id && this.state.prop_meter_id){

      this.setState({
        loading: true
      });

      AsyncStorage.getItem(TableKeys.PROPERTY_FEEDBACK, (err, result) => {
        let property_subitem_feedback = JSON.parse(result) || {};

        if(property_subitem_feedback.hasOwnProperty(this.state.property_id) ){

          let feedbacks = property_subitem_feedback[this.state.property_id];

          if(feedbacks.hasOwnProperty(this.state.prop_meter_id) ){ //same item id
              this.setState({
                prop_feedback_id: feedbacks[this.state.prop_meter_id].prop_feedback_id,
                feedback: feedbacks[this.state.prop_meter_id],
                type : feedbacks[this.state.prop_meter_id].type,
                option: feedbacks[this.state.prop_meter_id].option,
                description: feedbacks[this.state.prop_meter_id].description == '1' ? true: false,
                comment: feedbacks[this.state.prop_meter_id].comment,
              });
          }

          AsyncStorage.getItem(TableKeys.PROPERTY_METER_LINK, (err, result) => {
            let property_meter_link = JSON.parse(result) || {};
            let meterlist =  property_meter_link[this.state.property_id] || [];

            for(let i=0, l = meterlist.length; i < l; i++){
              if(meterlist[i].prop_meter_id == this.state.prop_meter_id ){
                this.setState({
                  reading_value : meterlist[i].reading_value
                });
                break;
              }
            }

          });


          this.setState({
            loading: false,
            refreshing: false,
          });
        }
        else{

          this.setState({
            loading: false,
            refreshing: false,
            feedback: {}
          });

        }


      });

      // get photos
      AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
        let photos = JSON.parse(result) || {};
        if(photos.hasOwnProperty(this.state.property_id) ){
          let property_photos = photos[this.state.property_id];
          if(property_photos.hasOwnProperty(this.state.prop_master_id) ){
            let master_photos = property_photos[this.state.prop_master_id];
            if(master_photos.hasOwnProperty(this.state.prop_meter_id) ){
              this.setState({
                photos: master_photos[this.state.prop_meter_id]
              });
            }
          }
        }
      });

    }

  }

  //save details of feedback
  handleSave = (showMsg = true) =>{

    if(this.state.property_id && this.state.prop_meter_id){

      this.setState({
        loading: true
      });

      AsyncStorage.getItem(TableKeys.PROPERTY_FEEDBACK, (err, result) => {
        let property_subitem_feedback = JSON.parse(result) || {};

        let feedback = {
          prop_feedback_id: this.state.prop_feedback_id ? this.state.prop_feedback_id: helper.generateUid(),
          property_id: this.state.property_id,
          item_id: this.state.prop_meter_id,
          parent_id: this.state.prop_master_id,
          option: '',
          description: this.state.description,
          comment: this.state.comment,
          type: this.state.type,
          mb_createdAt:  new Date().toLocaleDateString(),
          sync: 1
        }

        let feedbacks = {};
        if (property_subitem_feedback.hasOwnProperty(this.state.property_id) ){
          feedbacks =  property_subitem_feedback[this.state.property_id];
        }
        feedbacks[this.state.prop_meter_id] = feedback;

        property_subitem_feedback[this.state.property_id] = feedbacks;

        // saved to store
        AsyncStorage.setItem(TableKeys.PROPERTY_FEEDBACK, JSON.stringify(property_subitem_feedback), () => {
          console.log('property feedback saved');
          console.log(property_subitem_feedback);

          AsyncStorage.getItem(TableKeys.PROPERTY_METER_LINK, (err, result) => {
            let property_meter_link = JSON.parse(result) || {};
            let meterlist =  property_meter_link[this.state.property_id] || [];
            console.log('meter list');
            console.log(meterlist);

            for(let i=0, l = meterlist.length; i < l ; i++){
              if(meterlist[i].prop_meter_id == this.state.prop_meter_id ){
                meterlist[i].reading_value = this.state.reading_value;
                meterlist[i].sync = 1;
                property_meter_link[this.state.property_id] =  meterlist;
                AsyncStorage.setItem(TableKeys.PROPERTY_METER_LINK, JSON.stringify(property_meter_link), () => {
                  console.log('property meter table stored');
                  console.log(property_meter_link);
                });
                break;

              }
            }


          });

          if(showMsg == true){
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
          }


        });

          this.setState({
            loading: false,
            refreshing: false,
          });

      });

    }

  }


  openCamera = () =>{
    this.setState({
      isCamera : true
    });
  }

  closeCamera = () =>{
    this.setState({
      isCamera : false
    });
  }

  snapPhoto = (photo_url) =>{
    //console.log(photo_url);

    AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
      let photos = JSON.parse(result) || {};

      let property_photos = photos[this.state.property_id] || {};
      let master_photos = property_photos[this.state.prop_master_id] || { };
      //let sub_photos = master_photos[this.state.item_id] || { this.state.item_id: [] };

      let photos_array = this.state.photos;
      let photo_data = {
        photo_id: helper.generateUid(),
        property_id: this.state.property_id,
        item_id: this.state.prop_meter_id,
        parent_id: this.state.prop_master_id,
        type: this.state.type,
        img_url: photo_url,
        mb_createdAt: new Date().toLocaleDateString(),
        sync: 1
      };
      photos_array.push(photo_data);

      //sub_photos[this.state.item_id] = photos_array;
      master_photos[this.state.prop_meter_id] = photos_array;
      property_photos[this.state.prop_master_id] = master_photos;
      photos[this.state.property_id] = property_photos;

      this.setState({
        photos: photos_array
      }, ()=>{

        // saved to store
        AsyncStorage.setItem(TableKeys.PHOTOS, JSON.stringify(photos), () => {
          console.log('saved photos');
          console.log(photos);
        });

      });



    });

  }

  openImage = (photo) =>{

    let index = 0;//this.state.photos.indexOf(photo);
    let photos = [];
    for(let i =0, l = this.state.photos.length; i < l; i++){
      photos.push(this.state.photos[i].img_url);
      if(this.state.photos[i].photo_id == photo.photo_id){
        index = i;
      }

    }

    if(this.state.canSelect == false){

      this.props.navigator.showLightBox({
        screen: "PropertyGround.ImageLightBox",
          passProps: {
            imagePath: photo,
            images: JSON.stringify(photos),
            index: index
          },
          style: {
           backgroundBlur: "dark",
            //backgroundColor: "#ff000080",
            backgroundColor: "#333333",
            tapBackgroundToDismiss: true
         }
      });

    }
    else{

      // select image
      let selectedItems = this.state.selected;
      let tempIndex = selectedItems.indexOf(photo.photo_id);

      if( tempIndex == -1 ){
        selectedItems.push(photo.photo_id);
      }
      else{
        selectedItems.splice(tempIndex, 1);
      }

      this.setState({
        selected: selectedItems
      });

    }



  }

  deletePhoto = () =>{

    AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
      let photos = JSON.parse(result) || {};

      let property_photos = photos[this.state.property_id] || {};
      let master_photos = property_photos[this.state.parent_id] || { };

      let photos_array = this.state.photos;


      for(let i =0, l = this.state.selected.length; i < l; i++){


       for(let j =0, pl = photos_array.length; j < pl; j++){

          if(this.state.selected[i] == photos_array[j].photo_id ){
            //we found the photo id so can delete it
            photos_array.splice(j, 1);
            break;

          }

       }

      }

      master_photos[this.state.item_id] = photos_array;
      property_photos[this.state.parent_id] = master_photos;
      photos[this.state.property_id] = property_photos;

      this.setState({
        photos: photos_array,
        canSelect: false,
        selected: [],

      }, ()=>{

        // saved to store
        AsyncStorage.setItem(TableKeys.PHOTOS, JSON.stringify(photos), () => {
          console.log('saved photos');
          console.log(photos);
        });

      });



    });

  }

  getSelectImage(item){
    let selectIcon = null;
    if(this.state.canSelect && this.state.selected.indexOf(item.photo_id) != -1 ){
      selectIcon = <Image style={ styles.selectIcon } source={ require('../images/selected_img.png') } />;
    }
    else if(this.state.canSelect == true){
      selectIcon = <Image style={ styles.selectIcon } source={ require('../images/no_select_img.png') } />;
    }
    else if(this.state.canSelect == false){
      selectIcon = null;
    }

    return selectIcon;
  }

  // make it select
  makeItSelect(item){
    console.log('long press');

    this.setState({
      canSelect: true,
      selected: [],
    }, ()=>{
      this.openImage(item);
    });
  }

  cancelSelect = () =>{
    this.setState({
      canSelect: false,
      selected: [],
    });
  }

  selectImage = () =>{
    this.setState({
      canSelect: true,
      selected: [],
    });
  }


  handleSwitchChange =(value)=>{

    this.setState({
      description: value
    });

  }

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 0,
          justifyContent: 'center',
          alignSelf: 'center',
          alignContent: 'center',
          // /width: SCREENWIDTH
          //marginTop: 20,
        }}
      >
        <ActivityIndicator animating />
      </View>
    );
  };

  renderGridSeparator = () =>{

    return(
      <View
        style={{
          height: 5,
          width: "100%"
        }}
      />
    );
  }

  renderGridHeader = () => {
    return null;
  }

  handleRefresh = () => {
  };

  renderEmptyData = () =>{
    return(
      <View style={{ flex: 1, width: SCREENWIDTH,  alignContent:'center', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} >
        <Image style={{ width: 80, height: 80, marginTop: SCREENHEIGHT / 3 }} source={require('../images/nodata.png')} />
      </View>
    );
  }

  _renderItem = ({item}) => (

    <TouchableHighlight style={{margin: 0, flex: 0}}  underlayColor='transparent' aspectRatio={1}  onPress={()=>this.openImage(item)}
      onLongPress={()=>this.makeItSelect(item)}>
        <View style={styles.rowContainer}>
           <Simage
            source={RNFS.DocumentDirectoryPath + '/' + item.img_url}
            style={styles.gridImg}
          >
            {this.getSelectImage(item)}
          </Simage>

        </View>
     </TouchableHighlight>
  );

  getPhotos =() =>{
    let _keyExtractor = (item, index) => index;
    return(


            <View style={styles.camWrapper}>
              <FlatList
                contentContainerStyle={styles.listGrid}
                data={this.state.photos}
                keyExtractor={_keyExtractor}
                renderItem={this._renderItem}
                ItemSeparatorComponent={this.renderGridSeparator}
                ListFooterComponent={this.renderFooter}
                ListHeaderComponent={this.renderGridHeader}
                extraData={this.state}
                horizontal={false}
                ListEmptyComponent={this.renderEmptyData}
                numColumns={3}
              />

            </View>
          );
  }

  renderCamera =() =>{
    return(
      <PGCamera close={this.closeCamera} capture={this.snapPhoto} navigator={this.props.navigator} />
    );
  }


  renderFormx = () =>{
    return(
      <View style={styles.fill}>
        <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-160}>

        <ScrollView>
          <Text style={styles.divTxt}>Meter reading</Text>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({reading_value:text})}
            placeholder="Meter reading"
            placeholderTextColor="#A9ACBC"
            value={this.state.reading_value}
            underlineColorAndroid='transparent'
          />

          <Text style={styles.divTxt}>Need maintenance?</Text>

          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10}}>
              <Text style={{color: '#A9ACBC'}}>Need maintenance</Text>
            <Switch
              onValueChange={(value) => this.handleSwitchChange(value)}
              value={this.state.description } />
          </View>

          <Text style={styles.divTxt}>Comment</Text>

          <TextInput
            style={[styles.txtInput, {height: 100}]}
            onChangeText={(text) => this.setState({comment:text})}
            placeholder="Any comments?"
            placeholderTextColor="#A9ACBC"
            multiline = {true}
            numberOfLines = {7}
            value={this.state.comment}
            underlineColorAndroid='transparent'
          />

          <View style={styles.photoDivTxt}>
            <Text style={styles.photoTxt}>Photos</Text>
            {!this.state.canSelect &&
              <Text style={styles.photoTxt} onPress={()=>this.selectImage()}>Select</Text>
            }
            {this.state.canSelect &&
              <Text style={styles.photoTxt} onPress={()=>this.cancelSelect()}>Cancel</Text>
            }
            {this.state.canSelect &&
              <TouchableHighlight onPress={()=>this.deletePhoto()} underlayColor="transparent">
              <Image style={{width: 20, height: 20, resizeMode: 'contain'}} source={require('../images/delete.png')} />
              </TouchableHighlight>
            }

          </View>
          {this.getPhotos()}

        </ScrollView>


        {this.state.loading &&
          <View style={styles.overlayLoading}>
            <ActivityIndicator animating  size='large' />
          </View>
        }

        <MessageBarAlert ref='alert' />



        </KeyboardAvoidingView>

        <TouchableHighlight style={styles.roundBox} underlayColor="transparent" onPress={()=>this.openCamera()}>
        <Image
          source={require('../images/gen_camera.png')}
          style = {styles.genIcons}
        />
      </TouchableHighlight>

      </View>
    );

  }

  render(){

    if(this.state.isCamera == false){
      return(
        this.renderFormx()
      )
    }
    else{
      return (
        this.renderCamera()
      )
    }

  }

}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    justifyContent: 'flex-start',
    //alignItems: 'center'
  },
  photoDivTxt:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: "#F7F7F9",
    //width: SCREENWIDTH,
    padding: 10,
  },
  photoTxt:{
    backgroundColor: "#F7F7F9",
    color: "#81C5D3",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "left",
    flex: 0,
    justifyContent: 'flex-start'
  },
  divTxt:{
    backgroundColor: "#F7F7F9",
    color: "#81C5D3",
    fontSize: 15,
    fontWeight: "600",
    //width: SCREENWIDTH,
    textAlign: "left",
    padding: 10,
  },
  txtInput:{
    height: 45,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#FFFFFF',
    width: SCREENWIDTH - 10,
    marginTop: 10,
    fontSize: 15,
  },
  selectTxt:{
    height: 45,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#FFFFFF',
    //width: SCREENWIDTH - 10,
    marginTop: 10,
    color: '#e1e5ea',
    fontSize: 15,
    alignSelf: 'flex-start'
  },
  divider:{
    marginLeft: 25,
    marginRight: 25,
    height: 1,
    backgroundColor: 'rgba(99,175,203,0.3)',
  },
  camWrapper:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  camera_img:{
    width: 120,
    resizeMode: "contain",
  },
  helpTxt:{
    color: '#8ED0D6',
    fontSize: 13,
  },
  dropdown_img:{
    width: 20,
    resizeMode: 'contain',
    height: 20
  },
  overlayLoading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(99,175,203,0.5)'
  },
  conditionImgWrapper:{
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  condition_img:{
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginBottom: 10
  },
  /*listGrid: {
   justifyContent: 'flex-start',
   flexDirection: 'row',
   //flexWrap: 'wrap',
   alignContent: 'flex-start',
   alignSelf: 'flex-start',
  },
  */
  listGrid: {
   justifyContent: 'flex-start',
   flexDirection: 'column',
   //flexDirection: 'row',
   //flexWrap: 'wrap',
   alignContent: 'flex-start',
   alignSelf: 'flex-start',
  },
  rowContainer: {
     justifyContent: 'flex-start',
     //alignItems: 'flex-start',
     padding: 5,
     backgroundColor: '#FFFFFF',
     marginRight: 5,
  },
  gridImg: {
    width: GRIDWIDTH-10,
    height: GRIDWIDTH-10,
    resizeMode: 'cover',
  },
  roundBox:{
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3a8bbb',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: '5%',
    right: '2%'
  },
  genIcons:{
    width: 22,
    height: 22,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  selectIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18
  }

});
