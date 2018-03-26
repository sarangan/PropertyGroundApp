/**
 * PropertyGround React Native App
 * @sara
 * Sign up page
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


export default class SignUp extends Component {

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
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      contact: '',
      company_name: '',
      address: '',
      telephone: '',
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


  checkPwd = (str) => {
      if (str.length < 6) {
          return("password too short, must be minimum 6 charecters");
      } else if (str.length > 50) {
          return("password too long, try something you can remember");
      } else if (str.search(/\d/) == -1) {
          return("Password must have atlest one number");
      } else if (str.search(/[a-zA-Z]/) == -1) {
          return("Password must have atleast one letter");
      } else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
          return("Invalid password charecters used");
      }
      return("OK");
  }


  //save details
  doSave = () =>{

    let passvalid = this.checkPwd(this.state.password);

    if(this.state.email && this.state.password && this.state.confirmPassword && this.state.company_name && this.state.first_name ){

      let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if(this.state.password !== this.state.confirmPassword){
        this.setState({
          startSending: false,
        }, ()=> {this.showErr('Password doesn\'t match');} );
      }
      else if(!re.test( this.state.email ) ){
        this.setState({
          startSending: false,
        }, ()=> {this.showErr('Invalid email address!');} );

      }
      else if( passvalid != 'OK' ){

        this.setState({
          startSending: false,
        }, ()=> {this.showErr(passvalid);} );


      }
      else{
        this.setState({
          startSending: true,
        }, ()=>{

          let formData = new FormData();
          formData.append("first_name", this.state.first_name);
          formData.append("last_name", this.state.last_name);
          formData.append("email", this.state.email);
          formData.append("password", this.state.password);
          formData.append("confirmPassword", this.state.confirmPassword);
          formData.append("contact", '');
          formData.append("company_name", this.state.company_name);
          formData.append("address", this.state.address);
          formData.append("telephone", this.state.telephone);

          fetch(
              config.ENDPOINT_URL + 'auth/register',
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
            console.log("registration success ");
            console.log(responseJson);

            if(responseJson.hasOwnProperty('status') ){

              this.setState({
                startSending: false,
              }, ()=>{

                if(responseJson['status'] == 1){
                  //success

                  MessageBarManager.showAlert({
                    message: 'Successfully registered!, Please login to access your account',
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

                      this.props.navigator.dismissModal({
                        animationType: 'slide-down'
                      });

                    }
                  });



                }
                else {
                  this.showErr(responseJson.text);
                }

              })


            }
            else{
              this.showErr('Someting went wrong');
            }

          });


        });


      }


    }
    else{

      this.setState({
          startSending: false
      }, ()=>{

        this.showErr('Please fill fields...');

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

    return (
      <View style={styles.fill}>
        <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-150}>

          <ScrollView>
            <Text style={styles.divTxt}>Account details</Text>

            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({first_name:text})}
              placeholder="First name"
              placeholderTextColor="#A9ACBC"
              underlineColorAndroid='transparent'
            />
            <View style={styles.divider}></View>

            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({last_name:text})}
              placeholder="Last name"
              placeholderTextColor="#A9ACBC"
              underlineColorAndroid='transparent'
            />
            <View style={styles.divider}></View>

            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({email:text})}
              placeholder="Email"
              placeholderTextColor="#A9ACBC"
              underlineColorAndroid='transparent'
            />
            <View style={styles.divider}></View>

            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({password:text})}
              placeholder="Password"
              placeholderTextColor="#A9ACBC"
              underlineColorAndroid='transparent'
              secureTextEntry= {true}
            />
            <View style={styles.divider}></View>

            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({confirmPassword:text})}
              placeholder="Confirm password"
              placeholderTextColor="#A9ACBC"
              underlineColorAndroid='transparent'
              secureTextEntry= {true}
            />

            <Text style={styles.divTxt}>Company details</Text>

            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({company_name:text})}
              placeholder="Company name"
              placeholderTextColor="#A9ACBC"
              underlineColorAndroid='transparent'
            />
            <View style={styles.divider}></View>

            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({address:text})}
              placeholder="Address"
              placeholderTextColor="#A9ACBC"
              underlineColorAndroid='transparent'
            />
            <View style={styles.divider}></View>

            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({telephone:text})}
              placeholder="Contact"
              placeholderTextColor="#A9ACBC"
              underlineColorAndroid='transparent'
            />
            <View style={styles.divider}></View>

            <TouchableHighlight  underlayColor='transparent' style={styles.loginWrapper} onPress={this.doSave}>
              <Text style={styles.loginBtn}>Sign up</Text>
            </TouchableHighlight>

            <View style={{ height: 250 }} />

            </ScrollView>


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
