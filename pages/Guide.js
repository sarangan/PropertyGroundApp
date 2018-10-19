/**
 * PropertyGround React Native App
 * https://sph.com.sg
 * @sara
 * About page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  TouchableHighlight,
  AsyncStorage,
  StatusBar,
  Platform
} from 'react-native';

import Swiper from 'react-native-swiper';
import AppKeys from '../keys/appKeys';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;


export default class Guide extends Component{


  constructor(props){
    super(props);
  }

  componentDidMount(){

  }

  skipTutorial = () =>{

    AsyncStorage.setItem(AppKeys.SHOWGUIDE, '1', () => {
      console.log('guide token stored');

      this.props.navigator.dismissModal({
        animationType: 'slide-down'
      });

    });



  }



  render(){

    return(
        <View style={styles.content}>


          <Swiper showsButtons={false} showsPagination={true}
            dot={<View style={{backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
            activeDot={<View style={{backgroundColor: '#333333', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
            paginationStyle={{
              bottom: '15%', left: '0%'
            }}
            loop={false}
            autoplay={false}
          >
              <View style={styles.swipeWrapper}>
                <Image style={styles.snapparHelpBg} source={require('../images/guide_1.jpg')} />
              </View>

              <View style={styles.swipeWrapper}>
                <Image style={styles.snapparHelpBg} source={require('../images/guide_2.jpg')} />
              </View>

              <View style={styles.swipeWrapper}>
                <Image style={styles.snapparHelpBg} source={require('../images/guide_3.jpg')} />
              </View>

              <View style={styles.swipeWrapper}>
                <Image style={styles.snapparHelpBg} source={require('../images/guide_4.jpg')} />
              </View>

              <View style={styles.swipeWrapper}>
                <Image style={styles.snapparHelpBg} source={require('../images/guide_5.jpg')} />
              </View>

              <View style={styles.swipeWrapper}>
                <Image style={styles.snapparHelpBg} source={require('../images/guide_6.jpg')} />
              </View>

              <View style={styles.swipeWrapper}>
                <Image style={styles.snapparHelpBg} source={require('../images/guide_7.jpg')} />
              </View>

          </Swiper>

          <TouchableHighlight underlayColor="transparent" onPress={this.skipTutorial} style={styles.skipBtn} >
            <Text style={styles.skipBtnTxt} adjustsFontSizeToFit={true}>Skip Tutorial</Text>
          </TouchableHighlight>


      </View>
    );

  }


}


const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#333333',
    //width: SCREENWIDTH,
    //height: SCREENHEIGHT,
  },
  swipeWrapper:{
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    //width: SCREENWIDTH,
    //height: SCREENHEIGHT,
  },
  skipBtn:{
    position: 'absolute',
    bottom: '7%',
    // left: '37%',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnTxt:{
    fontSize: 12,
    //backgroundColor: '#ffffff',
    color: '#333333',
    alignSelf: 'center',
    textAlign: 'center',
    width: 120,
    height: 30,
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: '#333333',
  },
  snapparHelpBg:{
    width: SCREENWIDTH,
    height: SCREENHEIGHT,
    resizeMode: 'cover'
  }

});
