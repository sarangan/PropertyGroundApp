/**
 * PropertyGround React Native App
 * @sara
 * About us page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableHighlight,
  Image,
  ScrollView
} from 'react-native';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class About extends Component{


  constructor(props){
    super(props);

    this.state = {

    };
  }

  componentWillMount(){

  }

  render(){
    return(
      <View style={styles.fill}>

          <Image style={styles.aboutBg} source={require('../images/about_bg.jpg')} />

          <View style={styles.content}>
            <ScrollView>
              <Text style={styles.txt}>
                Property Ground  are a new and dynamic company offering a property marketing package that enhances an  estate agent’s ability to promote their property before being viewed by their clients. We are specialists in our field and our services include 360 vitual tours, state of the art photography, comprehensive floor plans, EPC’s and inventories. Our unique packages are designed to cater for your individual needs and are offered to you at unbeatable prices.
              </Text>
              <Text style={styles.subTxt}>
                An app by <Text style={styles.linkTxt}>PropertyGround.</Text>
              </Text>
            </ScrollView>
          </View>

        </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    flexDirection: "column",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#011430'
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    //backgroundColor: '#FF2B2A',
    width: SCREENWIDTH,
    height: SCREENHEIGHT,
    backgroundColor: 'transparent',
  },
  aboutBg:{
    width: SCREENWIDTH,
    height: SCREENWIDTH / 2,
    resizeMode: 'cover'
  },
  txt:{
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23
    //fontWeight: '500',
    //textShadowColor: "#F5F5F5",
    //textShadowOffset: {width: 0.5, height: 0.5}
  },
  subTxt:{
    marginTop: 15,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23
  },
  linkTxt:{
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#e1e1e1'
  }

});
