/**
 * PropertyGround React Native App
 * @sara
 * this is the extended version of Image
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
  ImageBackground
} from 'react-native';

export default class Simage extends Component{

  constructor(props){
    super(props);

    this.state ={
      isLoading: true,
      errImg : false
    }
  }




  renderLoading =() =>{

    if(this.state.errImg == false ){
      return(
        <ImageBackground
          onLoadStart={(e) => this.setState({isLoading: true}) }
          onLoadEnd={ ()=> this.setState({ isLoading: false}) }
          onError= { ()=> this.setState({ errImg: true}) }
          source={{ uri: this.props.source}}
          style={[this.props.style, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <ActivityIndicator animating={ this.state.isLoading }/>
          {this.props.children}
        </ImageBackground>
      );
    }
    else{
      return(
        <ImageBackground
          source={require('../images/err_image.png')}
          style={[this.props.style, { justifyContent: 'center', alignItems: 'center', resizeMode: 'contain' }]}
        >
          {this.props.children}
        </ImageBackground>
      );
    }

  }


  render(){
    let img = this.renderLoading();
    return(
      img
    );

  }
}


const styles = StyleSheet.create({
  content: {
    flex: 1,
  }
});
