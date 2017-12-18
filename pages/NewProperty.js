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

export default class NewProperty extends Component{

  static navigatorButtons = {
     rightButtons: [
       {
         title: 'Save',
         id: 'save'
       }
     ],
    //  leftButtons:[
    //    {
    //      title: 'Cancel',
    //      id: 'cancel'
    //    }
    //  ]

   };


  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {

      reporttypes : [ "Check-in Report", "Check-out Report", "Inventory Report", "Inventory and Check-in Report", "Midterm Inspection Report", "Interim Report", "General Overview Report", "Condition Report"],
      open_modal: false,
      changeColor: false,
      default_report_type: 'Report type',

      property_id: '',
      company_id: '',
      description: '',
      status: 1,

      address_1: '',
      address_2: '',
      city: '',
      postalcode: '',
      report_type: '',
      report_date: '',
      image_url: '',
      locked : 0, // 1 is locked 0 is not locked

      isSending: false,

    };

    this.property_subitem_link= {}; // global obj
  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'save') {
        this.doSave();

      }
      else if(event.id == 'cancel'){

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

    MessageBarManager.registerMessageBar(this.refs.alert);

    this.setState({
      company_id: auth.USER.company_id,
      property_id: helper.generateUid()
    });

  }


  addSubitem =(prop_master_id, company_masteritem_link) =>{
    //-------------------sub item settings--------------------

      // just be carefull here
      AsyncStorage.getItem(TableKeys.COMPANY_SUBITEM_LINK, (err, result) => {

        let company_subitem_link = JSON.parse(result) || [];
        let property_subitem_link_list = [];
        for(let i =0, l = company_subitem_link.length; i < l; i++){

          if(company_masteritem_link.com_master_id == company_subitem_link[i].com_master_id ){
            // we got same company master id
            // will push to sub list related to same master id
            let data_property_subitem_link = {
              prop_subitem_id: helper.generateUid(),
              property_id: this.state.property_id,
              prop_master_id: prop_master_id,
              com_subitem_id: company_subitem_link[i].com_subitem_id,
              com_master_id:  company_subitem_link[i].com_master_id,
              item_name: company_subitem_link[i].item_name,
              type: company_subitem_link[i].type,
              priority: company_subitem_link[i].priority,
              status: 1,
              mb_createdAt: new Date().toLocaleDateString(),
              sync: 1 // 1 is is not yet sync  2 is sync start  3 is sync finished
            };
            property_subitem_link_list.push(data_property_subitem_link);
          }

        }

        //let property_subitem_link = this.state.property_subitem_link;
        this.property_subitem_link[prop_master_id] = property_subitem_link_list;
        // this.setState({
        //   property_subitem_link
        // });

        // now we same to our property sub item list

        /*
        AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
          let property_subitem_link = JSON.parse(result) || {};

          property_subitem_link[prop_master_id] = property_subitem_link_list;

          AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(property_subitem_link), () => {
            console.log('property sub table stored');

          });// prop sub item saving end

        });
        */


      }); //end of sub item get


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

        let data_property = {
          property_id: this.state.property_id,
          company_id: this.state.company_id,
          description: this.state.description,
          status: 1,
          mb_createdAt: new Date().toLocaleDateString(),
          sync: 1
        };
        properties.push(data_property);

        AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(properties), () => {
          //saved proprty
          console.log("saved property tbl");

          //we are going to save to property info table

          AsyncStorage.getItem(TableKeys.PROPERTY_INFO, (err, result) => {

            let properties_info = JSON.parse(result) || [];

            let data_property_info = {
              property_id: this.state.property_id,
              address_1: this.state.address_1,
              address_2: this.state.address_2,
              city: this.state.city,
              postalcode: this.state.postalcode,
              report_type: this.state.report_type,
              report_date: this.state.report_date,
              image_url: this.state.image_url,
              locked: this.state.locked,
              mb_createdAt: new Date().toLocaleDateString(),
              sync: 1
            };
            properties_info.push(data_property_info);

            //----------------create sync table-----------------------
            AsyncStorage.getItem(TableKeys.SYNC, (err, result) => {
              let sync = JSON.parse(result) || {};

              let data_sync = {
                sync_id: helper.generateUid(),
                property_id: this.state.property_id,
                sync: 1,
                send_mail: 1,
                mb_createdAt: new Date().toLocaleDateString(),
              };

              sync[this.state.property_id] = data_sync;

              AsyncStorage.setItem(TableKeys.SYNC, JSON.stringify(sync), () => {
                //saved proprty info
                console.log("saved sync tbl");

              });

            });


            AsyncStorage.setItem(TableKeys.PROPERTY_INFO, JSON.stringify(properties_info), () => {
              //saved proprty info
              console.log("saved property info tbl");

              // save other tables -------------------------

              //-----------singantes--------------------------------------------
              AsyncStorage.getItem(TableKeys.SIGNATURES, (err, result) => {
                let signatures = JSON.parse(result) || {};

                let data_signatures = {
                  sign_id: helper.generateUid(),
                  property_id: this.state.property_id,
                  comment: '',
                  tenant_url: '',
                  lanlord_url: '',
                  clerk_url: '',
                  mb_createdAt: new Date().toLocaleDateString(),
                  sync: 1
                };

                //signatures.push(data_signatures);
                signatures[this.state.property_id] = data_signatures;

                AsyncStorage.setItem(TableKeys.SIGNATURES, JSON.stringify(signatures), () => {
                  //saved proprty info
                  console.log("saved singantes tbl");

                  //--------------------meter---------------------------------------------
                  AsyncStorage.getItem(TableKeys.COMPANY_METER_LINK, (err, result) => {

                    let meter_link = JSON.parse(result) || [];

                    AsyncStorage.getItem(TableKeys.PROPERTY_METER_LINK, (err, result) => {
                      let property_meter_link = JSON.parse(result) || {};
                      let property_meter_link_list = [];
                      for(let i =0, l = meter_link.length; i < l; i++){
                        let data_meter_link = {
                          prop_meter_id: helper.generateUid(),
                          property_id: this.state.property_id,
                          com_meter_id: meter_link[i].com_meter_id,
                          meter_name: meter_link[i].meter_name,
                          reading_value: '',
                          status: 1,
                          mb_createdAt: new Date().toLocaleDateString(),
                          sync: 1
                        };
                        property_meter_link_list.push(data_meter_link);
                      }
                      property_meter_link[this.state.property_id] = property_meter_link_list;

                      AsyncStorage.setItem(TableKeys.PROPERTY_METER_LINK, JSON.stringify(property_meter_link), () => {
                        console.log('property meter table stored');

                        //-------------general_condition_link-----------------------------
                        AsyncStorage.getItem(TableKeys.COMPANY_GENERAL_CONDITION_LINK, (err, result) => {
                          let company_general_condition_link = JSON.parse(result) || [];

                          AsyncStorage.getItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, (err, result) => {
                            let property_general_condition_link = JSON.parse(result) || {};
                            let property_general_condition_link_list = [];
                            for(let i =0, l = company_general_condition_link.length; i < l; i++){
                              let data_property_general_condition_link = {
                                prop_general_id: helper.generateUid(),
                                property_id: this.state.property_id,
                                com_general_id: company_general_condition_link[i].com_general_id,
                                item_name: company_general_condition_link[i].item_name,
                                options: company_general_condition_link[i].options,
                                type: company_general_condition_link[i].type,
                                priority: company_general_condition_link[i].priority,
                                user_input: '',
                                comment: '',
                                status: 1,
                                mb_createdAt: new Date().toLocaleDateString(),
                                sync: 1
                              };
                              property_general_condition_link_list.push(data_property_general_condition_link);
                            }
                            property_general_condition_link[this.state.property_id] = property_general_condition_link_list;

                            AsyncStorage.setItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, JSON.stringify(property_general_condition_link), () => {
                              console.log('property general table stored');

                              //----------------masteritem_link-----------------------------
                              AsyncStorage.getItem(TableKeys.COMPANY_MASTERITEM_LINK, (err, result) => {
                                let company_masteritem_link = JSON.parse(result) || [];

                                AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
                                  this.property_subitem_link = JSON.parse(result) || {};

                                  //take the sub items all first then compile them
                                  // this.setState({
                                  //   property_subitem_link: property_subitem_link
                                  // },()=>{
                                    //here do the master item insert

                                    AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {
                                      let property_masteritem_link = JSON.parse(result) || {};
                                      let property_masteritem_link_list = [];

                                      for(let i =0, l = company_masteritem_link.length; i < l; i++){
                                        let prop_master_id = helper.generateUid();
                                        let data_property_masteritem_link = {
                                          prop_master_id: prop_master_id,
                                          property_id: this.state.property_id,
                                          com_master_id: company_masteritem_link[i].com_master_id,
                                          type: 'DEFAULT',
                                          com_type: company_masteritem_link[i].type,
                                          option: company_masteritem_link[i].option,
                                          self_prop_master_id: 0,
                                          name: company_masteritem_link[i].item_name,
                                          priority: company_masteritem_link[i].priority,
                                          total_num: 0,
                                          status: 1,
                                          mb_createdAt: new Date().toLocaleDateString(),
                                          sync: 1
                                        };
                                        property_masteritem_link_list.push(data_property_masteritem_link);

                                        //----------------subitem-------------------------------

                                        this.addSubitem(prop_master_id, company_masteritem_link[i] );

                                      } //end com master loop


                                      property_masteritem_link[this.state.property_id] = property_masteritem_link_list;

                                      AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(property_masteritem_link), () => {
                                        console.log('property meter table stored');

                                        AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(this.property_subitem_link), () => {
                                          console.log('property sub table stored');


                                          this.setState({
                                            isSending: false,

                                            open_modal: false,
                                            changeColor: false,
                                            default_report_type: 'Report type',

                                            //property_id: '',
                                            //company_id: '',
                                            description: '',
                                            status: 1,

                                            address_1: '',
                                            address_2: '',
                                            city: '',
                                            postalcode: '',
                                            report_type: '',
                                            report_date: '',
                                            image_url: '',
                                            locked : 0,

                                            //property_subitem_link: {}

                                          }, ()=>{

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
                                              onHide: ()=>{

                                                //TODO must clear the text
                                                // this.description.setNativeProps({text: ''});
                                                // this.address_1.setNativeProps({text: ''});
                                                // this.address_2.setNativeProps({text: ''});
                                                // this.city.setNativeProps({text: ''});
                                                // this.postalcode.setNativeProps({text: ''});
                                                // this.report_date.setNativeProps({text: ''});

                                                this.props.navigator.showModal({
                                                    screen: "PropertyGround.AddRoomList",
                                                    title: 'Add room list',
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
                                                      property_id: this.state.property_id
                                                    },
                                                });



                                              },

                                            });

                                          });

                                        });// prop sub item saving end



                                      }); //-------------end of prop master item ------------------------------------


                                    }); // end of prop master get item



                                    // master item insert end
                                  //});



                                });



                              });
                              //--------------------------------------------------------
                            });
                          });
                        });
                        //--------------------------------------------------------

                      });
                    });
                  });
                  //--------------------------------------------------------

                });
              });//--------------------------------------------------------


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
          messageStyle: {color: '#ffffff', fontWeight: '700', fontSize: 15 },
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
          messageStyle: {color: '#ffffff', fontWeight: '700', fontSize: 15 },
          duration: 700,
          durationToShow: 0,
          durationToHide: 300
        });


      }


    }

  }

  //change spinner
  changeReportType = (item, index) =>{

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
      report_type: '',
      default_report_type: 'Report type',
      changeColor: false,
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
        console.log('Response = ', response);

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
            image_url: response.uri
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
            ref={component => this.address_1 = component}
            underlineColorAndroid='transparent'
          />
          <View style={styles.divider}></View>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({address_2:text})}
            placeholder="Address 2"
            placeholderTextColor="#A9ACBC"
            ref={component => this.address_2 = component}
            underlineColorAndroid='transparent'
          />
          <View style={styles.divider}></View>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({city:text})}
            placeholder="City"
            placeholderTextColor="#A9ACBC"
            ref={component => this.city = component}
            underlineColorAndroid='transparent'
          />
          <View style={styles.divider}></View>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({postalcode:text})}
            placeholder="Postal code"
            placeholderTextColor="#A9ACBC"
            ref={component => this.postalcode = component}
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
            ref={component => this.report_date = component}
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
            ref={component => this.description = component}
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
