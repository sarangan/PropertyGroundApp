/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * Singlew item page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableHighlight,
  ScrollView,
  Image,
  Text,
  Alert,
  ActivityIndicator,
  AsyncStorage,
  FlatList
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import Simage from "../components/Simage";
import PGCamera from "../components/PGCamera";

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;
var RNFS = require('react-native-fs');

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;
const GRIDWIDTH = Dimensions.get('window').width / 3;
GRIDWIDTH = 120;//GRIDWIDTH - 5;

export default class GeneralPhoto extends Component{

  static navigatorButtons = {
     rightButtons: [
       {
         title: 'Close',
         id: 'close'
       }
     ],
     leftButtons: [
        {
          title: 'Back',
          id: 'close'
        }
      ],

   };


  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      property_id: this.props.property_id,
      loading: false,
      photos: [],
      item_id: this.props.general_id,
      parent_id: this.props.prop_master_id,
      type: 'GENERAL',
      isCamera: false,
      canSelect: false,
      selected: [],
    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'close') {
        //this.handleSave(true);
        this.props.navigator.dismissModal({
          animationType: 'slide-down'
        });

      }


    }
  }

 componentWillUnmount () {
   // Remove the alert located on this master page from te manager
   MessageBarManager.unregisterMessageBar();
 }

  componentDidMount(){

    this.getDetails();
    MessageBarManager.registerMessageBar(this.refs.alert);

  }

  //get the whichever item details
  getDetails = () =>{

    if(this.state.property_id && this.state.item_id){

      this.setState({
        loading: true
      });

      // get photos
      AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
        let photos = JSON.parse(result) || {};

        if(photos.hasOwnProperty(this.state.property_id) ){

          let property_photos = photos[this.state.property_id];

          if(property_photos.hasOwnProperty(this.state.parent_id) ){

            let master_photos = property_photos[this.state.parent_id];

            if(master_photos.hasOwnProperty(this.state.item_id) ){

              this.setState({
                photos: master_photos[this.state.item_id],
                loading: false,
                refreshing: false,
              });

            }
            else{
              this.setState({
                loading: false,
                refreshing: false,
                photos: []
              });
            }

          }
          else{
            this.setState({
              loading: false,
              refreshing: false,
              photos: []
            });
          }

        }
        else{
          this.setState({
            loading: false,
            refreshing: false,
            photos: []
          });
        }

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
      let master_photos = property_photos[this.state.parent_id] || { };
      //let sub_photos = master_photos[this.state.item_id] || { this.state.item_id: [] };

      let photos_array = this.state.photos;
      let photo_data = {
        photo_id: helper.generateUid(),
        property_id: this.state.property_id,
        item_id: this.state.item_id,
        parent_id: this.state.parent_id,
        type: this.state.type,
        img_url: photo_url,
        mb_createdAt:  new Date().toLocaleDateString(),
        sync: 1
      };
      photos_array.push(photo_data);

      //sub_photos[this.state.item_id] = photos_array;
      master_photos[this.state.item_id] = photos_array;
      property_photos[this.state.parent_id] = master_photos;
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
            index: index,
            property_id: this.state.property_id,
            item_id : this.state.item_id,
            parent_id: this.state.parent_id,
            showDelete: true
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

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 10,
          marginTop: 10,
          marginBottom: 10,
          flex: 1,
          alignSelf: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          width: SCREENWIDTH
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

  renderFormx = () =>{
    return(

      <View style={styles.fill}>
        <ScrollView>

          <View style={styles.photoDivTxt}>
            <Text style={styles.photoTxt}>Photos</Text>
            <TouchableHighlight underlayColor="transparent" onPress={()=>this.getDetails()} >
              <Image style={{width: 20, height: 20, resizeMode: 'contain', paddingLeft: 10, paddingRight: 10}} source={require('../images/reload.png')} />
            </TouchableHighlight>

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

        <TouchableHighlight style={styles.roundBox} underlayColor="transparent" onPress={()=>this.openCamera()}>
          <Image
            source={require('../images/gen_camera.png')}
            style = {styles.genIcons}
          />
        </TouchableHighlight>

      </View>

    );
  }

  renderCamera =() =>{
    return(
      <PGCamera close={this.closeCamera} capture={this.snapPhoto}/>
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
  divTxt:{
    backgroundColor: "#F7F7F9",
    color: "#81C5D3",
    fontSize: 15,
    fontWeight: "600",
    //width: SCREENWIDTH,
    textAlign: "left",
    padding: 10,
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
    alignSelf: 'center',
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
  listGrid: {
   justifyContent: 'flex-start',
   flexDirection: 'column',
   //flexDirection: 'row',
   //flexWrap: 'wrap',
   alignContent: 'flex-start',
   alignSelf: 'flex-start',
  },
  rowContainer: {
     justifyContent: 'center',
     alignItems: 'center',
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
  selectIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18
  }

});
