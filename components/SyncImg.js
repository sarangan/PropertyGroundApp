/**
 * Propertyground React Native App
 * @sara
 * this is the extended version of Sync image
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  Easing
} from 'react-native';

export default class SyncImg extends Component{

  constructor(props){
    super(props);

    this.state ={
      sync_spinValue : new Animated.Value(0),
    }
  }

  componentDidMount(){

    if(this.props.sync == 2){
      this.sync_spin();
    }

  }

  sync_spin() {

    this.state.sync_spinValue.setValue(0)
    Animated.timing(
      this.state.sync_spinValue,
      {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear
      }
    ).start(() => this.sync_spin())

  }


  renderSpinner = () =>{

    const spin = this.state.sync_spinValue.interpolate({
       inputRange: [0, 1],
       outputRange: ['0deg', '360deg']
     })

     if(this.props.sync == 2){
       return (
         <Animated.Image
             style={[styles.actionBarIcon, { transform: [{rotate: spin}] } ] }
             source={require('../images/sync_list.png')}
         />
       );
     }
     else{
       return null;
     }

  }

  render(){

    return(
      this.renderSpinner()
    );

  }

}


const styles = StyleSheet.create({
  actionBarIcon: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 5
  },
});
