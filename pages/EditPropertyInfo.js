/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * About us page
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
  AsyncStorage
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import FilterPicker from "../components/FilterPicker";
import DatePicker from 'react-native-datepicker';

var ImagePicker = require('react-native-image-picker');

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;


export default class EditPropertyInfo extends Component{

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
      reporttypes : [ "Check-in Report", "Check-out Report", "Inventory Report", "Inventory and Check-in Report", "Midterm Inspection Report", "Interim Report", "General Overview Report", "Condition Report"],
      open_modal: false,
      changeColor:  this.props.property.report_type?true:false,
      property_id: this.props.property_id,
      property: this.props.property,
      company_id: this.props.property.company_id,
      mb_createdAt: this.props.property.mb_createdAt,
      description: '',
      status: 1,

      address_1: this.props.property.address_1,
      address_2: this.props.property.address_2,
      city: this.props.property.city,
      postalcode: this.props.property.postalcode,
      report_type: this.props.property.report_type,
      report_date: this.props.property.report_date,
      image_url: this.props.property.image_url,
      locked : this.props.property.locked,
      default_report_type:this.props.property.report_type?this.props.property.report_type:'Report type',

      isSending: false,

    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'save') {
        this.doSave();
      }

    }
  }

 componentWillUnmount () {
   // Remove the alert located on this master page from te manager
   MessageBarManager.unregisterMessageBar();
 }

  componentDidMount(){
    console.log(this.state.property);

    AsyncStorage.getItem(TableKeys.PROPERTY, (err, result) => {
      console.log('get property details');
      let properties = JSON.parse(result) || [];

      for(let i =0, l = properties.length; i < l ; i++){

        if(properties[i].property_id == this.state.property_id ){
          //we got property id
          this.setState({
              company_id: properties[i].company_id,
              description: properties[i].description,
              mb_createdAt: properties[i].mb_createdAt,
              status: properties[i].status,
          });
          break;
        }

      }
    });

    AsyncStorage.getItem(TableKeys.PROPERTY_INFO, (err, result) => {

      let properties_info = JSON.parse(result) || [];

      for(let i =0, l = properties_info.length; i < l ; i++){

        if(properties_info[i].property_id == this.state.property_id ){

          this.setState({
            address_1: properties_info[i].address_1 || null,
            address_2: properties_info[i].address_2 || null,
            city: properties_info[i].city || null,
            postalcode: properties_info[i].postalcode || null,
            report_type: properties_info[i].report_type || null,
            report_date: properties_info[i].report_date || null,
            image_url: properties_info[i].image_url || '',
            locked : properties_info[i].locked,
            default_report_type:  properties_info[i].report_type,
          });
          break;

        }

      }

    });



    MessageBarManager.registerMessageBar(this.refs.alert);

  }


  //save inital property details
  doSave = () =>{

    this.setState({
      isSending: true
    });

    if(this.state.property_id && this.state.company_id && this.state.address_1 && this.state.report_type){
      //looks ok to save

      AsyncStorage.getItem(TableKeys.PROPERTY, (err, result) => {
        console.log('get property details');
        let properties = JSON.parse(result) || [];

        for(let i =0, l = properties.length; i < l ; i++){

          if(properties[i].property_id == this.state.property_id ){

            let data_property = {
              property_id: this.state.property_id,
              company_id: this.state.company_id,
              description: this.state.description,
              status: properties[i].status,
              mb_createdAt: properties[i].mb_createdAt,
              sync: 1
            };

            properties[i] = data_property;
            break;

          }
        }

        AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(properties), () => {
          //saved proprty
          console.log("saved property tbl");

          //we are going to save to property info table

          AsyncStorage.getItem(TableKeys.PROPERTY_INFO, (err, result) => {

            let properties_info = JSON.parse(result) || [];

            for(let i =0, l = properties_info.length; i < l ; i++){

              if(properties_info[i].property_id == this.state.property_id ){

                let data_property_info = {
                  property_id: this.state.property_id,
                  address_1: this.state.address_1,
                  address_2: this.state.address_2,
                  city: this.state.city,
                  postalcode: this.state.postalcode,
                  report_type: this.state.report_type,
                  report_date: this.state.report_date,
                  image_url: this.state.image_url,
                  locked: properties_info[i].locked,
                  mb_createdAt: properties_info[i].mb_createdAt,
                  sync: 1
                };

                properties_info[i] = data_property_info;
                break;

              }
            }

            AsyncStorage.setItem(TableKeys.PROPERTY_INFO, JSON.stringify(properties_info), () => {
              //saved proprty info
              console.log("saved property info tbl");

              // save other tables -------------------------


              this.setState({
                isSending: false,

              }, ()=>{

                MessageBarManager.showAlert({
                  message: 'Successfully updated!',
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


        });




      });




    }
    else{

      this.setState({
        isSending: false
      });

      //different type of error catching

      if(!this.state.property_id ){ // might get again get from uuid

        this.setState({
          property_id: helper.generateUid()
        }, () => {
          Alert.alert(
           'PropertyGround',
           'Please try again!'
          );
        });


      }
      else if(!this.state.company_id){ // login details does not exit

        console.log("missing login details");

        this.props.navigator.showModal({
            screen: "PropertyGround.Login",
            title: 'PropertyGround',
            animationType: 'slide-up',
            navigatorStyle:{
              navBarHidden: true,
            },
            passProps: {
             }
        });


      }
      else if(!this.state.report_type){
        MessageBarManager.showAlert({
          message: 'Please specify the report type!',
          alertType: 'success',
          animationType: 'SlideFromTop',
          position: 'top',
          shouldHideOnTap: true,
          stylesheetSuccess : { backgroundColor : '#ea5c5c', strokeColor : '#ea5c5c' },
          messageStyle: {color: '#475566', fontWeight: '700', fontSize: 15 },
          duration: 700,
          durationToShow: 0,
          durationToHide: 300

        });
      }
      else{


        MessageBarManager.showAlert({
          message: 'Please provide address of the property!',
          alertType: 'success',
          animationType: 'SlideFromTop',
          position: 'top',
          shouldHideOnTap: true,
          stylesheetSuccess : { backgroundColor : '#ea5c5c', strokeColor : '#ea5c5c' },
          messageStyle: {color: '#475566', fontWeight: '700', fontSize: 15 },
          duration: 700,
          durationToShow: 0,
          durationToHide: 300
        });


      }


    }

  }

  //change spinner
  changeReportType = (item, index) =>{
    console.log('change item');
    console.log(item);
    if(item){
      this.setState({
          default_report_type: item,
          report_type: item,
          changeColor: true
      });
    }

  }

  //close tag modal
  closeReportTypeModal = () =>{

    this.setState({ open_modal: false }, ()=>{

    });
  }

  //cancel tag modal
  cancelReportTypeModal = () =>{

    this.setState({
      open_modal: false,
    });

  }

  handleOpenReportTypeModal = () =>{
    this.setState({
      open_modal: !this.state.open_modal,
    })
  }

  //open camera
  openCamera = () =>{
    var options = {
      title: 'Report image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      },
      //allowsEditing: true
    };

      ImagePicker.showImagePicker(options, (response) => {
        //console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        }
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        }
        else if (response.customButton) {
          //console.log('User tapped custom button: ', response.customButton);
        }
        else {

          this.setState({
            image_url: response.uri//'data:image/jpeg;base64,' + response.data //response.uri
          });

        }
      });



  }

  getImage = () =>{
    let img = <Image source={require('../images/camera.png')} style={styles.camera_img}/>;
    if(this.state.image_url){

      img = <Image source={{ uri: this.state.image_url }} style={{width: SCREENWIDTH, height: SCREENWIDTH * 0.75, resizeMode: 'cover'}} />
    }

    return (img);
  }

  render(){

    return(
      <View style={styles.fill}>
        <ScrollView>
          <Text style={styles.divTxt}>Property details</Text>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({address_1:text})}
            placeholder="Address"
            placeholderTextColor="#A9ACBC"
            value={this.state.address_1}
            underlineColorAndroid='transparent'
          />
          <View style={styles.divider}></View>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({address_2:text})}
            placeholder="Address 2"
            placeholderTextColor="#A9ACBC"
            value={this.state.address_2}
            underlineColorAndroid='transparent'
          />
          <View style={styles.divider}></View>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({city:text})}
            placeholder="City"
            placeholderTextColor="#A9ACBC"
            value={this.state.city}
            underlineColorAndroid='transparent'
          />
          <View style={styles.divider}></View>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({postalcode:text})}
            placeholder="Postal code"
            placeholderTextColor="#A9ACBC"
            value={this.state.postalcode}
            underlineColorAndroid='transparent'
          />


          <Text style={styles.divTxt}>Report details</Text>

          <TouchableHighlight underlayColor='transparent' onPress={this.handleOpenReportTypeModal}>
            <View style={{flex: 1, width: SCREENWIDTH - 25, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap'}}>
              <Text style={ [styles.selectTxt, {color: (this.state.changeColor? "#333333" : "#A9ACBC") } ] }>{this.state.default_report_type}</Text>
              <Image source={require('../images/dropdown.png')} style={styles.dropdown_img}/>
            </View>
          </TouchableHighlight>

          <View style={styles.divider}></View>

          {/* <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({report_date:text})}
            placeholder="Report date (dd/mm/yyyy)"
            placeholderTextColor="#A9ACBC"
            value={this.state.report_date}
            underlineColorAndroid='transparent'
          /> */}

          <DatePicker
              style={{width: SCREENWIDTH - 20, borderWidth: 0, marginTop: 5,
              marginBottom : 5,}}
              date={this.state.report_date}
              mode="date"
              placeholder="Select Report date"
              format="DD-MM-YYYY"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  position: 'absolute',
                  right: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 25,
                  marginRight: 25,
                  height: 45,
                  backgroundColor: '#FFFFFF',
                  fontSize: 15,
                  borderWidth: 0,
                  textAlign: 'left',
                  alignItems: 'flex-start',
                }

              }}
              onDateChange={(date) => {this.setState({report_date: date})}}
          />

          <Text style={styles.divTxt}>Additional info</Text>

          <TextInput
            style={[styles.txtInput, {height: 70}]}
            onChangeText={(text) => this.setState({description:text})}
            placeholder="Description"
            placeholderTextColor="#A9ACBC"
            multiline = {true}
            numberOfLines = {5}
            value={this.state.description}
            underlineColorAndroid='transparent'
          />

          <Text style={styles.divTxt}>Report image</Text>
          <TouchableHighlight underlayColor="transparent" onPress={()=>this.openCamera()}>
            <View style={styles.camWrapper}>
              {this.getImage()}
              <Text style={styles.helpTxt}>Tab here to add cover image</Text>
            </View>
          </TouchableHighlight>

        </ScrollView>

        { this.state.open_modal && this.state.reporttypes.length > 0 &&
          <View style={styles.modalWrapper}>
            <FilterPicker
              closeModal={this.closeReportTypeModal}
              cancelModal={this.cancelReportTypeModal}
              changeValue={this.changeReportType}
              current_value={this.state.report_type}
              data ={this.state.reporttypes}
            />
          </View>
        }

        {this.state.isSending &&
          <View style={styles.overlayLoading}>
            <ActivityIndicator animating  size='large' />
          </View>
        }

        <MessageBarAlert ref='alert' />

      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  divTxt:{
    backgroundColor: "#F7F7F9",
    color: "#81C5D3",
    fontSize: 15,
    fontWeight: "600",
    width: SCREENWIDTH,
    textAlign: "left",
    padding: 10,
  },
  txtInput:{
    height: 45,
    paddingLeft: 25,
    paddingRight: 25,
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
  modalWrapper:{
    flex: 1,
    flexDirection: 'row',
    width: SCREENWIDTH,
    backgroundColor: '#FCFCFD',
    padding: 0,
    margin: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  divider:{
    marginLeft: 25,
    marginRight: 25,
    height: 1,
    backgroundColor: 'rgba(99,175,203,0.3)',
  },
  camWrapper:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

});
