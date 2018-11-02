/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * Login page
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
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';
import helper from '../helper/helper';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class Login extends Component{


  constructor(props){
    super(props);

    this.state = {
      username: '',
      password: '',
      isLogin: false,
      isSending: false,
      platform: 'ios'
    };

  }

  componentDidMount() {

     this.setState({
       platform: Platform.OS
     });

  }

  //getting company template
  getCompanyTemplate(token){

    /*
    fetch(
        config.ENDPOINT_URL + 'company/getTemplate',
        {
        method: 'POST',
        headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'multipart/form-data',
                  'Origin': '',
                  'Host': 'propertyground.co.uk',
                  'timeout': 10 * 60,
                  'Authorization': token
        },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log("getting comapny template");
      console.log(responseJson);

      if( responseJson.hasOwnProperty("status") && responseJson.status == 1 ){
        // AsyncStorage.setItem(AppKeys.LOGINKEY, JSON.stringify(pgauth), () => {
        //   console.log('login token stored');
        // });

        if(responseJson.hasOwnProperty("data")){

          let data = responseJson.data;

          if(data.hasOwnProperty("master")){
            //we go master data
            AsyncStorage.setItem(TableKeys.COMPANY_MASTERITEM_LINK, JSON.stringify(data.master), () => {
              console.log('master table stored');
            });
          }

          if(data.hasOwnProperty("sub")){
            //we go sub data
            AsyncStorage.setItem(TableKeys.COMPANY_SUBITEM_LINK, JSON.stringify(data.sub), () => {
              console.log('sub table stored');
            });
          }

          if(data.hasOwnProperty("meter")){
            //we go meter data
            AsyncStorage.setItem(TableKeys.COMPANY_METER_LINK, JSON.stringify(data.meter), () => {
              console.log('meter table stored');
            });
          }

          if(data.hasOwnProperty("general")){
            //we go general data
            AsyncStorage.setItem(TableKeys.COMPANY_GENERAL_CONDITION_LINK, JSON.stringify(data.general), () => {
              console.log('general table stored');
            });
          }


        }

      }

    })
    .catch((error) => {
      console.error(error);
    });

    */

    helper.syncTemplate(token);
  }

  // open react website
  openPgWeb = (action) =>{
    // let url = encodeURI(action);
    // Linking.openURL(url).catch(err => console.error('An error occurred', err));

    switch (action) {
      case 'SIGNUP':
        this.props.navigator.showModal({
            screen: "PropertyGround.SignUp",
            title: 'Sign up',
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
             }
        });

        break;
      case 'FORGOTPASSWORD':

        this.props.navigator.showModal({
            screen: "PropertyGround.ForgetPassword",
            title: 'Forgot password',
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
             }
        });

        break;
      default:
    }



  }

  doLogin=()=>{

    console.log("login");


    if(this.state.username && this.state.password){

      this.setState({
        isSending: true
      });

      let formData = new FormData();
      formData.append("email", this.state.username);
      formData.append("password", this.state.password);

      fetch(
          config.ENDPOINT_URL + 'auth/authenticate',
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
        console.log("login success call ");
        console.log(responseJson);

        var keys = Object.keys(responseJson).map(function(x){ return x.toUpperCase() });

        if( keys.indexOf( ("token").toUpperCase() )  != -1 ){

          this.getCompanyTemplate('Bearer ' + responseJson.token);

          //TODO get Inspections from server

          let userDetails = {
              user_id : responseJson.user.id,
              email :  responseJson.user.email,
              company_id : responseJson.user.company_id,
              type : responseJson.user.type,
              first_name : responseJson.user.first_name,
              last_name : responseJson.user.last_name,
              contact : responseJson.user.contact,
              createdAt: responseJson.user.createdAt,
              updatedAt: responseJson.user.updatedAt
          };

          auth["AUTHTOKEN"] = 'Bearer ' + responseJson.token;
          auth["ISLOGIN"] =  true;
          auth["USER"] =  userDetails;

          let pgauth = {
            token: 'Bearer ' + responseJson.token,
            isLogin: true,
            user: userDetails
          };

          console.log("pgauth");
          console.log(pgauth);
          console.log("-------------------");


          AsyncStorage.setItem(AppKeys.LOGINKEY, JSON.stringify(pgauth), () => {
            console.log('login token stored');

            this.setState({
              isSending: false
            });

            this.props.navigator.dismissModal({
              animationType: 'slide-down'
            });

          });



        }
        else{

          this.setState({
            isSending: false
          });

        }


      })
      .catch((error) => {
          console.error(error);

          this.setState({
            isSending: false
          });
      });


    }
    else{
        Alert.alert(
         'PropertyGround',
         'Username or password cannot be blank!'
        );
    }

  }

  renderIos = () =>{

    return(
      <KeyboardAvoidingView
      behavior="position">
          <ScrollView>
          <View style={styles.fill}>

            <Image source={require('../images/pg_logo.png')} style={styles.pg_logo}/>
            <Text style={styles.inventoryTxt}>INVENTORY</Text>
            <Text style={styles.helpTxt}>PropertyGround Login</Text>
            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({username:text})}
              placeholder="Enter your email"
              placeholderTextColor="#757575"
              clearButtonMode="while-editing"
              keyboardType="email-address"
              underlineColorAndroid='transparent'
            />
            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({password:text})}
              placeholder="Enter password"
              placeholderTextColor="#757575"
              clearButtonMode="while-editing"
              secureTextEntry= {true}
              underlineColorAndroid='transparent'
            />
            <TouchableHighlight  underlayColor='transparent' style={styles.loginWrapper} onPress={this.doLogin}>
              <Text style={styles.loginBtn}>Login</Text>
            </TouchableHighlight>

            {this.state.isSending &&
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: SCREENWIDTH, margin: 10 }} >
                <ActivityIndicator animating  size='small' />
              </View>
            }


            <View style={styles.otherActionsBtnWrapper}>
              <TouchableHighlight  underlayColor='transparent' onPress={()=>this.openPgWeb('SIGNUP') }><Text style={styles.otherActionsBtn}>Sign up</Text></TouchableHighlight>
              <TouchableHighlight  underlayColor='transparent' onPress={()=>this.openPgWeb('FORGOTPASSWORD') }><Text style={styles.otherActionsBtn}>Forgot password</Text></TouchableHighlight>
            </View>

          </View>
          </ScrollView>
      </KeyboardAvoidingView>
    );

  }


  renderAndroid = () =>{

    return(
          <ScrollView>
          <View style={styles.fill}>
            <Image source={require('../images/pg_logo.png')} style={styles.pg_logo}/>
            <Text style={styles.inventoryTxt}>INVENTORY</Text>
            <Text style={styles.helpTxt}>PropertyGround Login</Text>
            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({username:text})}
              placeholder="Enter your email"
              placeholderTextColor="#757575"
              clearButtonMode="while-editing"
              keyboardType="email-address"
              underlineColorAndroid='transparent'
            />
            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.setState({password:text})}
              placeholder="Enter password"
              placeholderTextColor="#757575"
              clearButtonMode="while-editing"
              secureTextEntry= {true}
              underlineColorAndroid='transparent'
            />
            <TouchableHighlight  underlayColor='transparent' style={styles.loginWrapper} onPress={this.doLogin}>
              <Text style={styles.loginBtn}>Login</Text>
            </TouchableHighlight>

            {this.state.isSending &&
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: SCREENWIDTH, margin: 10 }} >
                <ActivityIndicator animating  size='small' />
              </View>
            }


            <View style={styles.otherActionsBtnWrapper}>
              <TouchableHighlight  underlayColor='transparent' onPress={()=>this.openPgWeb('SIGNUP') }><Text style={styles.otherActionsBtn}>Sign up</Text></TouchableHighlight>
              <TouchableHighlight  underlayColor='transparent' onPress={()=>this.openPgWeb('FORGOTPASSWORD') }><Text style={styles.otherActionsBtn}>Forgot password</Text></TouchableHighlight>
            </View>

          </View>
          </ScrollView>
    );

  }


  render(){


    return(

      <View>
        {this.state.platform == 'ios' &&
          this.renderIos()
        }
        {this.state.platform == 'android' &&
          this.renderAndroid()
        }

      </View>


    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    flexDirection: "column",
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  txtInput: {
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.16)',
    borderRadius: 10,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#FFFFFF',
    width: SCREENWIDTH - 50,
    marginTop: 10,
    marginBottom: 10
  },
  pg_logo:{
    width: 150,
    resizeMode: "contain"
  },
  inventoryTxt:{
    fontSize: 45,
    fontWeight: '700',
    color: "#0E275D",
    marginBottom: 20
  },
  helpTxt:{
    color: "grey"
  },
  loginWrapper:{
    marginTop: 20,
    width: SCREENWIDTH - 50
  },
  loginBtn:{
    color: "#ffffff",
    backgroundColor: "#00BDDB",
    padding: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700"
  },
  otherActionsBtnWrapper:{
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: '85%'
    // position: "absolute",
    // bottom: 0,
    // left: 0,
    //padding: 20,
    //width: SCREENWIDTH - 50
  },
  otherActionsBtn:{
    color: "#00BDDB",
    marginTop: 20,
    fontSize: 16
    // marginRight: 20
  }

});
