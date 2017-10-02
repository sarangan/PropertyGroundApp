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
  Dimensions,
  TouchableHighlight,
} from 'react-native';

import tableKeys from '../tableKeys';
import appKeys from '../appKeys';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class Inspections extends Component{


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
        <Text style={styles.aboutTxt}>Property Ground  are a new and dynamic company offering a property marketing package that enhances an  estate agent’s ability to promote their property before being viewed by their clients.

We are specialists in our field and our services include 360 vitual tours, state of the art photography, comprehensive floor plans,   EPC’s and inventories.

Our unique packages are designed to cater for your individual needs and are offered to you at unbeatable prices.
</Text>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  aboutTxt:{
    color: "#000000",
    fontSize: 15,
  }

});
