/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * sign
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
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

var SignaturePad = require('react-native-signature-pad');

export default class Signaturepad extends Component{

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
      type : this.props.type,
      loading: false,
      base64Icon: null,
      key: Math.floor(Math.random(100) * 100),
      signs: {}
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

    //get the whichever item details
    getDetails = () =>{

      AsyncStorage.getItem(TableKeys.SIGNATURES, (err, result) => {
        let signatures = JSON.parse(result) || {};

        if(signatures.hasOwnProperty(this.state.property_id)){

          let signs = signatures[this.state.property_id];

          let base64Icon = null;
          if(this.state.type == 'Tenant'){
            base64Icon = signs['tenant_url'] || null;
          }
          else if(this.state.type == 'Lanlord' ){
            base64Icon = signs['lanlord_url'] || null;
          }
          else if(this.state.type == 'Clerk' ){
            base64Icon = signs['clerk_url'] || null;
          }

          this.setState({
            signs,
            base64Icon
          });

        }


      });

    }

  //save details of feedback
    handleSave = (showMsg = true) =>{

      AsyncStorage.getItem(TableKeys.SIGNATURES, (err, result) => {
        let signatures = JSON.parse(result) || {};

        let data_signatures = {};

        if(signatures.hasOwnProperty(this.state.property_id)){
          data_signatures = this.state.signs;

          if(this.state.base64Icon){

            if(this.state.type == 'Tenant'){
              data_signatures['tenant_url'] = this.state.base64Icon;
            }
            else if(this.state.type == 'Lanlord' ){
              data_signatures['lanlord_url'] = this.state.base64Icon;
            }
            else if(this.state.type == 'Clerk' ){
              data_signatures['clerk_url'] = this.state.base64Icon;
            }

          }

        }
        else{

          data_signatures = {
            sign_id: helper.generateUid(),
            property_id: this.state.property_id,
            comment: '',
            tenant_url: (this.state.type == 'Tenant'? this.state.base64Icon : ''),
            lanlord_url: (this.state.type == 'Lanlord'? this.state.base64Icon : ''),
            clerk_url: (this.state.type == 'Clerk'? this.state.base64Icon : ''),
            mb_createdAt: new Date().toLocaleDateString(),
            sync: 1
          };

        }

        signatures[this.state.property_id] = data_signatures;

        AsyncStorage.setItem(TableKeys.SIGNATURES, JSON.stringify(signatures), () => {
          //saved proprty info
          console.log("saved singantes tbl");

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


      });


    }

    _signaturePadError = (error) => {
      console.error(error);
    };

    _signaturePadChange = ({base64DataUrl}) => {
       console.log("Got new signature: " + base64DataUrl);
       this.setState({
         base64Icon: base64DataUrl
       });

    };

   clearCanvas = ()  =>{

     this.setState({
       base64Icon: null,
       key: Math.floor(Math.random(100) * 100)
     });
   }


  render(){

    return(
        <View style={{ flex: 1, flexDirection: "column" }}>
            <Text style={styles.divTxt}>{this.state.type} - Sign here</Text>
            <View style={{height: ( (SCREENHEIGHT / 2) - 50) }}>
            <SignaturePad onError={this._signaturePadError}
                        onChange={this._signaturePadChange}
                        style={{flex: 1, backgroundColor: 'white'}} key={this.state.key}/>
            </View>
            <Text style={[styles.divTxt, {textAlign: 'right'}] } onPress={()=>this.clearCanvas()}>Clear</Text>
            {this.state.base64Icon &&
              <Image style={{width: SCREENWIDTH, height: ( (SCREENHEIGHT / 2) - 100) , resizeMode: 'contain'}} source={{uri: this.state.base64Icon}}/>
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
    alignItems: 'center',
    flexDirection: "column"
  },
  signature: {
      flex: 1,
      borderColor: 'red',
      borderWidth: 1,
      width: SCREENWIDTH
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
  divider:{
    marginLeft: 25,
    marginRight: 25,
    height: 1,
    backgroundColor: 'rgba(99,175,203,0.3)',
  },
  helpTxt:{
    color: '#8ED0D6',
    fontSize: 13,
  },


});
