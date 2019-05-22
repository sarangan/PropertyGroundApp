/**
 * PropertyGround React Native App
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
  AsyncStorage,
  Platform
} from 'react-native';

import TImage from 'react-native-transformable-image';
import Swiper from 'react-native-swiper';
import TableKeys from '../keys/tableKeys';
var RNFS = require('react-native-fs');

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;


export default class ImageLightBox extends Component {

  constructor(props){
    super(props);
    this.state ={
      images: JSON.parse(this.props.images),
      index: this.props.index? this.props.index: 0,
      pageIndex: this.props.index? this.props.index: 0,
      property_id: this.props.property_id,
      item_id : this.props.item_id,
      parent_id: this.props.parent_id,
      showDelete: this.props.showDelete,
      platform: 'ios'
    };

    console.log(JSON.parse(this.props.images));
  }

  componentWillMount(){

    this.setState({
      platform: Platform.OS
    });


  }

  componentDidMount(){
    this.setState({
      platform: Platform.OS
    });
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
      message: 'Shared via PropertyGround',
      title: 'PropertyGround',
      url: img
    }, {
      dialogTitle: 'PropertyGround - Share image',
    })
    .then(
        this._showResult
    )
    .catch(err => console.log(err))

  }

  //delete the image from stack
  deleteImg = () =>{

    let index = this.state.pageIndex;
    let images = this.state.images;
    images.splice(index, 1);

    this.setState({
      images
    }, ()=>{

      AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
        let photos = JSON.parse(result) || {};

        let property_photos = photos[this.state.property_id] || {};
        let master_photos = property_photos[this.state.parent_id] || {};

        let photos_array = master_photos[this.state.item_id] || [];

        photos_array.splice(index, 1);

        master_photos[this.state.item_id] = photos_array;
        property_photos[this.state.parent_id] = master_photos;
        photos[this.state.property_id] = property_photos;

        // saved to store
        AsyncStorage.setItem(TableKeys.PHOTOS, JSON.stringify(photos), () => {
          console.log('saved photos');
          console.log(photos);
        });

      });

    })



  }




  getSlids = () =>{

    let slides= [];

    for(let i=0, l = this.state.images.length; i < l ; i++){
      let img = this.state.images[i];

      //console.log("image ", img);

      slides.push(
            <View style={styles.container} key={i}>

                <TImage
                  source={{uri: RNFS.DocumentDirectoryPath + '/' + img }}
                  style={{width:  SCREENWIDTH - 50, height:  SCREENHEIGHT - 100,  }}
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

    console.log(this.state.images[this.state.index]);

    return (
      <View style={ [styles.container, { width: SCREENWIDTH, height: SCREENHEIGHT } ]}>

          <TouchableHighlight underlayColor="transparent" onPress={this.dismissImgBox} style={styles.actionCloseWrapper}>
            <Image style={styles.actionCloseImg} source={require('../images/back.png')} />
          </TouchableHighlight>
          {this.state.showDelete &&
            <TouchableHighlight underlayColor="transparent" onPress={()=>this.deleteImg()} style={styles.actionShareWrapper}>
              <Image style={styles.actionShareImg} source={require('../images/remove.png')} />
            </TouchableHighlight>
          }

          {this.state.platform == 'ios' &&

            <Swiper showsButtons={false} showsPagination={true}
              dot={<View style={{backgroundColor: 'rgba(129,197,211,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
              activeDot={<View style={{backgroundColor: '#ffffff', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
              paginationStyle={{
                bottom: '1%', left: '0%'
              }}
              loop={true}
              index={this.state.index}
              autoplay={true}
              autoplayTimeout={12}
              onMomentumScrollEnd={(event, state) => {
              this.setState({
                pageIndex: state.index,
              });
              console.log(state.index);
            }}

            >
                {this.getSlids()}

            </Swiper>

          }

          {this.state.platform == 'android' &&

              <Image
                source={{ uri: this.state.images[this.state.index]  }}
                style={{width:  SCREENWIDTH - 50, height:  SCREENHEIGHT - 100, resizeMode: 'cover'}}
              />


          }




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
