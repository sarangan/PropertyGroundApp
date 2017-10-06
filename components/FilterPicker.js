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
  Animated,
  Picker,
  Dimensions,
  TouchableHighlight
} from 'react-native';

var SCREENWIDTH = Dimensions.get('window').width;
var SCREENHEIGHT = Dimensions.get('window').height;

export default class FilterPicker extends Component {


  constructor(props){
    super(props);
    this.state = {
      offSet: new Animated.Value(SCREENWIDTH),
    }

  }

  componentDidMount(){
     Animated.timing(this.state.offSet, {
        duration: 300,
        toValue: 0
      }).start()
  }

  closeModal = () => {
    console.log('closing');
     Animated.timing(this.state.offSet, {
        duration: 300,
        toValue: SCREENHEIGHT
     }).start(()=>{
       this.props.closeModal();
     });

  }

  cancelModal =  () => {
    Animated.timing(this.state.offSet, {
       duration: 300,
       toValue: SCREENHEIGHT
    }).start(()=>{
      this.props.cancelModal();
    });
  }

  render() {

    return (

      <Animated.View style={{ transform: [{translateY: this.state.offSet}],
        backgroundColor:'#FCFCFD', flex: 1 }}
      >
          <View style={styles.closeButtonContainer}>

            <TouchableHighlight onPress={this.cancelModal} underlayColor="transparent" style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableHighlight>

            <TouchableHighlight onPress={this.closeModal} underlayColor="transparent" style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableHighlight>
          </View>

          <View style={styles.pickerWrapper}>

            <Picker selectedValue= {this.props.current_value}
              onValueChange={(itemValue, itemIndex) => this.props.changeValue(itemValue, itemIndex)}
              style={styles.pickerWrapper}
              >

                {this.props.data.map((item) => (
                  <Picker.Item
                    key={item}
                    value={item}
                    label={item}
                  />
                ))}

             </Picker>

          </View>

      </Animated.View>

    );
  }
}

const styles = StyleSheet.create({
  showtimeContainer: {
   borderTopColor: '#ededed',
    borderTopWidth:1
  },
  showtime: {
    padding:20,
    textAlign: 'center'
  },
  button: {
    marginTop:25,
    marginBottom:25
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: '#F4F4F6',
    borderTopWidth: 1,
    paddingRight:3,
    paddingLeft: 3,
    backgroundColor:'#FFFFFF'
  },
  closeButton: {
   paddingRight:10,
    paddingTop:10,
    paddingBottom:10
  },
  buttonText: {
   textAlign: 'center'
  },
  closeButtonText: {
   color: '#027afe',
   fontSize: 14,
  },
  pickerWrapper:{
    marginBottom: 30
  },
});
