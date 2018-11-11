/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * filter using picker control
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  TouchableHighlight,
  Platform
} from 'react-native';

var SCREENWIDTH = Dimensions.get('window').width;
var SCREENHEIGHT = Dimensions.get('window').height;

export default class NumberControl extends Component {


  constructor(props){
    super(props);
    this.state = {
      num: 0
    }

  }

  componentDidMount(){

  }

  addNumber(num){
    let tempNum = Number(this.state.num) + num;
    if(tempNum < 0){
      tempNum = 0;
    }

    this.setState({
      num: tempNum
    }, ()=>{
      this._textInput.setNativeProps({text: String(this.state.num) });
      this.props.handleChange(tempNum, this.props.item);
    });

  }


  render() {

    return (
      <View style={styles.fill}>
        <TouchableHighlight underlayColor='#63afcb' onPress={()=>this.addNumber(-1)} style={[styles.box, {marginRight: 2,} ] }><Text style={styles.btnTxt}>-</Text></TouchableHighlight>
        <TextInput
          style={styles.inNum}
          onChangeText={(text) => this.setState({num:text})}
          multiline = {false}
          numberOfLines = {1}
          value={this.state.num.toString()}
          keyboardType='number-pad'
          placeholder="0"
          placeholderTextColor="#A9ACBC"
          ref={component => this._textInput = component}
          underlineColorAndroid='transparent'
        />
        <TouchableHighlight underlayColor='#63afcb' onPress={()=>this.addNumber(1)} style={[styles.box, {marginLeft: 2,} ] }><Text style={styles.btnTxt}>+</Text></TouchableHighlight>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  fill: {
     flex: 1,
     flexDirection: 'row',
     justifyContent: 'flex-end',
     alignItems: 'center'
  },
  box:{
    padding: 7,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: '#81C5D3'
  },
  btnTxt:{
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  inNum:{
    height: 32,
    width: 32,
    ...Platform.select({
      android: {
        paddingTop: 3
      },
    }),
    borderTopColor: '#e1e1e1',
    borderBottomColor: '#e1e1e1',
    borderLeftColor: '#e1e1e1',
    borderRightColor: '#e1e1e1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    textAlign: 'center'
  }
});
