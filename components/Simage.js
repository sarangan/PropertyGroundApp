/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * this is the extended version of Image
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Image
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
        <Image
          onLoadStart={(e) => this.setState({isLoading: true}) }
          onLoadEnd={ ()=> this.setState({ isLoading: false}) }
          onError= { ()=> this.setState({ errImg: true}) }
          source={{ uri: this.props.source}}
          style={[this.props.style, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <ActivityIndicator animating={ this.state.isLoading }/>
          {this.props.sChild}
        </Image>
      );
    }
    else{
      return(
        <Image
          source={require('../images/err_image.png')}
          style={[this.props.style, { justifyContent: 'center', alignItems: 'center', resizeMode: 'contain' }]}
        >
          {this.props.sChild}
        </Image>
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
