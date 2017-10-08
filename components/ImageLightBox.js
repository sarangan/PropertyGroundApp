/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * Image light box to show larger image
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text,
  TouchableHighlight,
  Share
} from 'react-native';

import TImage from 'react-native-transformable-image';
import Swiper from 'react-native-swiper';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;


export default class ImageLightBox extends Component {

  constructor(props){
    super(props);
    this.state ={
      images: JSON.parse(this.props.images),
      index: this.props.index? this.props.index: 0,
      pageIndex: this.props.index? this.props.index: 0,
    };

    console.log(JSON.parse(this.props.images));
  }

  //close the light box
  dismissImgBox=()=>{
    this.props.navigator.dismissLightBox();
  }

  //share image
  shareImg=()=>{

    this.props.navigator.dismissLightBox();

    let img = this.state.images[this.state.pageIndex];

    Share.share({
      message: 'Shared via Snappar',
      title: 'Snappar',
      url: img
    }, {
      dialogTitle: 'Snappar - Share image',
    })
    .then(
        this._showResult
    )
    .catch(err => console.log(err))

  }

  getSlids =() =>{

    let slides= [];

    for(let i=0, l = this.state.images.length; i < l ; i++){
      let img = this.state.images[i];
      slides.push(
            <View style={styles.container} key={i}>

              <TImage
                source={{ uri: img}}
                style={{width:  SCREENWIDTH - 50, height:  SCREENHEIGHT - 100, }}
              >
              </TImage>

            </View>
        );

    }

    return slides;

  }

  onSwipe = (index) => {
    console.log('index changed', index);
  }


  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };

    return (
      <View style={ [styles.container, { width: SCREENWIDTH, height: SCREENHEIGHT } ]}>

          <TouchableHighlight underlayColor="transparent" onPress={this.dismissImgBox} style={styles.actionCloseWrapper}>
            <Image style={styles.actionCloseImg} source={require('../images/back.png')} />
          </TouchableHighlight>

          <TouchableHighlight underlayColor="transparent" onPress={()=>this.shareImg()} style={styles.actionShareWrapper}>
            <Image style={styles.actionShareImg} source={require('../images/share_img.png')} />
          </TouchableHighlight>

            <Swiper showsButtons={false} showsPagination={true}
              dot={<View style={{backgroundColor: 'rgba(129,197,211,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
              activeDot={<View style={{backgroundColor: '#ffffff', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
              paginationStyle={{
                bottom: '1%', left: '0%'
              }}
              loop={true}
              index={this.state.index}
              autoplay={true}
              autoplayTimeout={6}
              onMomentumScrollEnd={(event, state) => {
              this.setState({
                pageIndex: state.index,
              });
              console.log(state.index);
            }}

            >
              {this.getSlids()}
            </Swiper>




      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
  },
  imageWrapper:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50
  },
  actionCloseWrapper:{
    // position: 'absolute',
    // right: 5,
    // top: 25,
    alignSelf: 'flex-start',
    padding: 10,
    marginTop: 15
  },
  actionCloseBtn:{
    padding: 20,
    color: '#FFFFFF',
    fontSize: 12,
  },
  actionCloseImg:{
    width: 30,
    height: 30,
  },
  actionShareWrapper:{
    position: 'absolute',
    top: '1%',
    right: '0%',
    zIndex: 12,
    padding: 20,
  },

  actionShareImg:{
    width: 27,
    height: 27,
  }
});
