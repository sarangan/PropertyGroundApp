/**
 * PropertyGround React Native App
 * @sara
 * Forget password page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  ActivityIndicator,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';

import config from '../keys/config';

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;
const SCREENWIDTH = Dimensions.get('window').width;

export default class ForgetPassword extends Component{

  static navigatorButtons = {
     rightButtons: [
       {
         title: 'Cancel',
         id: 'cancel'
       }
     ],

   };


  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      email: '',
      startSending: false
    };

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

  componentDidMount(){
    MessageBarManager.registerMessageBar(this.refs.alert);
  }

  componentWillUnmount () {
    // Remove the alert located on this master page from te manager
    MessageBarManager.unregisterMessageBar();
  }

  //save details
  doSave = () =>{

    if(this.state.email){

      let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if(!re.test( this.state.email ) ){
        this.setState({
          startSending: false,
        }, ()=> {this.showErr('Invalid email address!');} );

      }
      else{

        this.setState({
          startSending: false,
        }, ()=>{

          let formData = new FormData();
          formData.append("email", this.state.email);

          fetch(
              config.ENDPOINT_URL + 'auth/forgetpassword',
              {
              method: 'POST',
              headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                        'Origin': '',
                        'Host': 'propertyground.co.uk',
                        'timeout': 10 * 60
              },
              body: formData
          })
          .then((response) => response.json())
          .then((responseJson) => {
            console.log("reset success ");
            console.log(responseJson);

            this.setState({
              startSending: false,
            }, ()=>{

              if(responseJson.hasOwnProperty('status') ){

                if(responseJson.status == 1){

                  MessageBarManager.showAlert({
                    message: 'Your password has been reset successfully, new password will be sent your email shortly.',
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
                      // this.props.navigator.dismissModal({
                      //   animationType: 'slide-down'
                      // });
                    }
                  });

                }
                else{
                  this.showErr('Someting went wrong when resetting your password');
                }

              }else{
                this.showErr('Someting went wrong when resetting your password');
              }

            });


          });


        });

      }



    }
    else{
      this.setState({
        startSending: false,
      }, ()=>{
          this.showErr('Please provide email!');
      });

    }

  }

  //show errors and infos
  showErr = (err) =>{
    MessageBarManager.showAlert({
      message: err ,
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

  render(){

    return(
      <View style={styles.fill}>
        <KeyboardAvoidingView behavior="position">
          <Text style={styles.divTxt}>Forgot password</Text>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({email:text})}
            placeholder="Enter your Email"
            placeholderTextColor="#A9ACBC"
            underlineColorAndroid='transparent'
          />
          <View style={styles.divider}></View>

          <TouchableHighlight  underlayColor='transparent' style={styles.loginWrapper} onPress={this.doSave}>
            <Text style={styles.loginBtn}>Recover</Text>
          </TouchableHighlight>

        </KeyboardAvoidingView>

        {this.state.startSending &&
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
  },
  divTxt:{
    backgroundColor: "#F7F7F9",
    color: "#81C5D3",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "left",
    padding: 10,
  },
  divider:{
    marginLeft: 25,
    marginRight: 25,
    height: 1,
    backgroundColor: 'rgba(99,175,203,0.3)',
  },
  txtInput:{
    height: 45,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#FFFFFF',
    //width: SCREENWIDTH - 10,
    marginTop: 10,
    fontSize: 15,
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
  loginWrapper:{
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 20,
    alignSelf: 'center',
    width: '100%'
  },
  loginBtn:{
    color: "#ffffff",
    backgroundColor: "#00BDDB",
    padding: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700"
  },
});
