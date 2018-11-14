/**
 * @sara
 * left side drawer menu
 */
import React, { Component } from 'react';
import {
	Text,
	View,
	Image,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
	Linking,
  AsyncStorage,
	Alert,
	ScrollView,
	Platform
} from 'react-native';

import {homeNavigator} from '../pages/Inspections';
import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class Drawer extends Component {
	constructor(props) {
		super(props);

    this.state = {
      menu: [
        {
          name: 'About us',
          type: 'PAGE',
					action: 'ABOUT',
					icon: require('../images/menu_about.png')
        },
				{
          name: 'Settings',
          type: 'PAGE',
					action: 'SETTINGS',
					icon: require('../images/menu_settings.png')
        },
        {
          name: 'Privacy Policy',
          type: 'URL',
					action: 'http://www.propertyground.com/privacy-policy/',
					icon: require('../images/menu_privacy.png')
        },
        {
          name: 'Terms and Conditions',
					type: 'URL',
					action: 'http://www.propertyground.com/terms-of-service/',
					icon: require('../images/menu_terms.png')
        },
				{
          name: 'Help',
          type: 'PAGE',
					action: 'HELP',
					icon: require('../images/menu_help.png')
        },

        {
          name: 'Contact us',
          type: 'MAIL',
					action: 'CONTACT',
					icon: require('../images/menu_mail.png')
        },
        {
          name: 'Logout',
          type: 'ACTION',
					action: 'LOGOUT',
					icon: require('../images/menu_logout.png')
        }

      ],
			version: '1.0'

    };
	}


	componentDidMount(){
		if(Platform.OS == 'ios'){
			this.setState({
				version: "1.6"
			});
		}
		else{
			this.setState({
				version: "1.0"
			});
		}
	}



	_toggleDrawer() {
		this.props.navigator.toggleDrawer({
			to: 'closed',
			side: 'left',
			animated: true
		});
	}


	takeAction(menu){

		const navigatorStyle = {
		  navBarTextColor: 'white',
		  navBarButtonColor: 'white',
	    navBarBackgroundColor: '#00BDDB',//'#1F4065',//'#00BDDB',//'#3F88DE',
	    screenBackgroundColor: '#FFFFFF',

	    navBarTranslucent: false,
	    navBarTransparent: false,
	    drawUnderNavBar: false,
	    navBarBlur: false,
	    navBarHidden: false,

	    orientation: 'portrait',
	    statusBarTextColorScheme: 'light',
	    statusBarTextColorSchemeSingleScreen: 'light',
	    statusBarHideWithNavBar: false,
	    statusBarHidden: false,
	  };

		if(menu.type == "URL" ){
			this._toggleDrawer();
			let url = encodeURI(menu.action);

			Linking.openURL(url).catch(err => console.error('An error occurred', err));

		}
		else if(menu.type == "MAIL"){

			this._toggleDrawer();
			let url = encodeURI("mailto:info@propertyground.com?subject=PropertyGround Inventory App");

			Linking.openURL(url).catch(err => console.error('An error occurred', err));

		}
		else if(menu.type == "PAGE"){
			this._toggleDrawer();
			if(menu.action == "ABOUT"){
				homeNavigator.push({
	        screen: 'PropertyGround.About',
	        title: 'About us',
	        animated: true,
	        //animationType: 'fade',
	        passProps: { },
					navigatorStyle
	      });
			}
			else if(menu.action == "HELP"){

				this.props.navigator.showModal({
	          screen: "PropertyGround.Guide",
	          title: '',
	          animationType: 'slide-up',
	          navigatorStyle:{
							navBarHidden: true,
							navBarTextColor: 'white',
						  navBarButtonColor: 'white',
					    navBarBackgroundColor: '#00BDDB',//'#1F4065',//'#00BDDB',//'#3F88DE',
					    screenBackgroundColor: '#FFFFFF',

					    navBarTranslucent: false,
					    navBarTransparent: false,
					    drawUnderNavBar: false,
					    navBarBlur: false,

					    orientation: 'portrait',
					    statusBarTextColorScheme: 'light',
					    statusBarTextColorSchemeSingleScreen: 'light',
					    statusBarHideWithNavBar: false,
					    statusBarHidden: false,
	          },
	          passProps: {
	           }
	      });

			}
			else if(menu.action == "SETTINGS"){
				homeNavigator.push({
	        screen: 'PropertyGround.Settings',
	        title: 'Settings',
	        animated: true,
	        //animationType: 'fade',
	        passProps: { },
					navigatorStyle
	      });
			}

		}
    else if(menu.type == "ACTION"){

        Alert.alert(
            'PropertyGround',
            'Are you sure, Do you want to logout? you will loose your local data!',
            [
              {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'Yes', onPress: () =>{

                let keys = [AppKeys.LOGINKEY];
                AsyncStorage.multiRemove(keys, (err) => {
                  auth["AUTHTOKEN"] = '';
                  auth["ISLOGIN"] =  false;
                  auth["USER"] =  {};

                  this.clearStorage();

                  this.props.navigator.showModal({
                      screen: "PropertyGround.Login",
                      title: 'PropertyGround',
                      animationType: 'slide-up',
                      navigatorStyle:{
                        navBarHidden: true,
												navBarTextColor: 'white',
											  navBarButtonColor: 'white',
										    navBarBackgroundColor: '#00BDDB',//'#1F4065',//'#00BDDB',//'#3F88DE',
										    screenBackgroundColor: '#FFFFFF',

										    navBarTranslucent: false,
										    navBarTransparent: false,
										    drawUnderNavBar: false,
										    navBarBlur: false,

										    orientation: 'portrait',
										    statusBarTextColorScheme: 'light',
										    statusBarTextColorSchemeSingleScreen: 'light',
										    statusBarHideWithNavBar: false,
										    statusBarHidden: false,
                      },
                      passProps: {
                       }
                  });

                });

              }},
            ],
            { cancelable: false }
          )

    }

	}

  getMenus(){
    let menus = [];
    for(let i =0, l = this.state.menu.length; i < l; i++){
      menus.push(
        <TouchableHighlight underlayColor="transparent" onPress={this.takeAction.bind(this, this.state.menu[i]) } key={i}>
						<View style={styles.drawerListItem}>
							<Image style={ styles.menuIcon } source={ this.state.menu[i].icon } />
	            <Text style={styles.drawerListItemText}>
	              {this.state.menu[i].name}
	            </Text>
	          </View>
        </TouchableHighlight>
      )
    }
    return(
      menus
    );
  }

  clearStorage = () =>{

    let keys = [
      TableKeys.PROPERTY,
      TableKeys.PROPERTY_INFO,
      TableKeys.PROPERTY_MASTERITEM_LINK,
      TableKeys.PROPERTY_SUBITEM_LINK,
      TableKeys.PROPERTY_SUBITEM_LINK,
      TableKeys.PROPERTY_GENERAL_CONDITION_LINK,
      TableKeys.PROPERTY_METER_LINK,
      TableKeys.PROPERTY_FEEDBACK,
      TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL,
      TableKeys.PROPERTY_SUB_VOICE_GENERAL,
      TableKeys.SIGNATURES,
      TableKeys.PHOTOS,
      TableKeys.SYNC,
      TableKeys.COMPANY_GENERAL_CONDITION_LINK,
      TableKeys.COMPANY_METER_LINK,
      TableKeys.COMPANY_SUBITEM_LINK,
      TableKeys.COMPANY_MASTERITEM_LINK
    ];
    AsyncStorage.multiRemove(keys, (err) => {
      // keys k1 & k2 removed, if they existed
      // do most stuff after removal (if you want)
    });


  }


	render() {

		return (

        <View style={styles.container}>
					<ScrollView>


          <View style={styles.drawerList}>

            {
              this.getMenus()
            }

          </View>

					<View style={styles.applogopowerwrapper}>

						<View style={styles.appNameWrapper}>

							<Image style={styles.pgLogo} source={require('../images/pg_logo.png')} />
							<Text style={styles._version}>
	              {`Version ${this.state.version}`}
	            </Text>

	          </View>

						<View style={styles.powertxtWrapper}>
							<Text style={styles.powertxt}>
								PropertyGround
							</Text>
						</View>

					</View>

					</ScrollView>

        </View>


		);
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    height: SCREENHEIGHT,
    paddingTop: 50,
    paddingBottom: 30,
    flexDirection: 'column',
    backgroundColor: '#011430'
  },
  drawerList: {
    justifyContent: 'flex-start',
  },
  drawerListIcon: {
    width: 27
  },
  drawerListItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'flex-start',
    alignSelf: 'flex-start',
    paddingTop: 20,
		paddingBottom: 30,
		marginLeft: 15,
		marginRight: 15,
		// borderBottomWidth: 0.5,
		// borderColor: '#f7f7f7'
  },
  drawerListItemText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    paddingLeft: 15,
    flex: 1,
    flexDirection: 'row',

  },
  linearGradient: {
    // top: 0,
    // left: 0,
    // right: 0,
    // height: 248,
    // position: 'absolute'
    flex: 1
  },

	appNameWrapper:{
		//flex: 1,
		flexDirection: 'row',
		alignContent: 'flex-start',
		alignItems: 'center',
	},
	appNameS:{
		color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    paddingLeft: 15,
    backgroundColor: 'transparent',
    //marginBottom: 2,
		//paddingTop: 6,
	},
  appName:{
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    paddingLeft: 0,
    backgroundColor: 'transparent',
    marginBottom: 2,
		letterSpacing: 0.5
  },
  _version: {
    color: '#FAFAFA',
    fontSize: 10,
		fontWeight: '600',
    //paddingLeft: 3,
    backgroundColor: 'transparent',
		paddingTop: 12
  },
	menuIcon:{
		width: 22,
		height: 22,
	},
	applogopowerwrapper:{
		flexDirection: 'column',
		alignContent: 'flex-start',
		alignItems: 'flex-start',
		alignSelf: 'flex-start',
	},
	powertxtWrapper:{
		paddingLeft: 15,
	},
	powertxt: {
    color: '#FAFAFA',
    fontSize: 9,
		fontWeight: '600',
    paddingLeft: 3,
    backgroundColor: 'transparent',
  },
	pgLogo:{
    width: 80,
		height: 80,
    resizeMode: 'contain',
		marginLeft: 15,
  }
});
