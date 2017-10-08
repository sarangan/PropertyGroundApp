/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * Camera
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Dimensions,
  NativeModules,
  ImagePickerIOS,
  Animated,
  Easing,
} from 'react-native';
import Camera from 'react-native-camera';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class PGCamera extends Component{

  constructor(props){
    super(props);

    this.state = {
      isBackCamera: true,
      cameraType : Camera.constants.Type.back,
      flash: 1, // 1 auto, 2 flash off, 3 flash on
      flashMode: Camera.constants.FlashMode.off,
      imagePath: '',
      spinValue: new Animated.Value(0),
      startCapture: false
    };

  }


  snapPhoto(){

    const options = {};
     //options.location = ...

      this.camera.capture({metadata: options})
        .then(
         (data) => {
          // console.log(data);
           this.setState({
             imagePath: data.path,
             spinValue: new Animated.Value(0),
             startCapture: false
           }, ()=>{
             // call the method TODO
             this.props.capture(this.state.imagePath);

           });


         }
        )
        .catch( (err) =>{
         console.error(err);
        });

  }

  takePicture() {

    this.setState({
      startCapture: true
    }, ()=>{

      Animated.timing(
        this.state.spinValue,
             {
              toValue: 1,
              duration: 200,
              easing: Easing.linear
             }
         ).start( ()=>{

           this.snapPhoto();
         } );

    });

  }

  callPhotoLib(){

    ImagePickerIOS.openSelectDialog({}, imageUri => {
      console.log(imageUri);

      this.setState({ imagePath: imageUri }, ()=>{
        //call method TODO
         this.props.capture(this.state.imagePath);
      });
    }, error => console.log(error));


  }

  //this is to switch front and back camera
  handleSwitchCameraFace(){
    if(this.state.isBackCamera == true){
      this.setState({
        isBackCamera : false,
        cameraType: Camera.constants.Type.front,
        flash : 1,
        flashMode: Camera.constants.FlashMode.off
      });
    }
    else{
      this.setState({
        isBackCamera : true,
        cameraType: Camera.constants.Type.back,
        flash : 1,
        flashMode: Camera.constants.FlashMode.off
      });
    }

  }

  //this is to handle flashMode
  handleSwitchFlash(){
   let next_flash = this.state.flash;
   next_flash += 1;

   if(next_flash > 3){
     next_flash = 1;
   }

   switch (next_flash) {

     case 1: {
       this.setState({
        flash : next_flash,
        flashMode: Camera.constants.FlashMode.off
       });
       break;
     }
     case 2: {
       this.setState({
        flash : next_flash,
        flashMode: Camera.constants.FlashMode.on
       });
       break;
     }
     case 3: {
       this.setState({
        flash : next_flash,
        flashMode: Camera.constants.FlashMode.auto
       });
       break;
     }
     default: {
       this.setState({
        flash : 1,
        flashMode: Camera.constants.FlashMode.off
       });
       break;
     }

   }

  }

  //switch flash icons
  getFlashIcon(){
   let img = <Image style={ styles.cameraActionTopIcon } source={require('../images/flash.png')} />;
   switch (this.state.flash) {
     case 1:{
       img = <Image style={ styles.cameraActionTopIcon } source={require('../images/flash-off.png')} />;
       break;
     }
     case 2:{
       img = <Image style={ styles.cameraActionTopIcon } source={require('../images/flash-on.png')} />;
       break;
     }
     case 3:{
       img = <Image style={ styles.cameraActionTopIcon } source={require('../images/flash.png')} />;
       break;
     }
     default:
       img = <Image style={ styles.cameraActionTopIcon } source={require('../images/flash-off.png')} />;
   }

   return img;

  }

  //get front camera icon
  getFrontCameraIcon(){
   let img = <Image style={ styles.cameraActionTopIcon } source={require('../images/camera-front-off.png')} />;
   if(this.state.isBackCamera == false){
     img = <Image style={ styles.cameraActionTopIcon } source={require('../images/camera-front-off.png')} />;
   }
   else{
     img = <Image style={ styles.cameraActionTopIcon } source={require('../images/camera-front-off.png')} />;
   }
   return img;
  }

  //render crop image module
  renderCropImage(){
   return(
     <View style={styles.imageWrapper}>
       <Image style={styles.captureImg}  source={{ uri: this.state.imagePath }}>
       </Image>
     </View>
   );
  }

  //render camera module
  renderCamera(){
    let spin = this.state.spinValue.interpolate({
           inputRange: [0,1],
           outputRange: ['0deg', '360deg']
       });

     let camera = require('../images/camera_btn.png');
     if(this.state.startCapture == true){
       camera = require('../images/camera-close.png');
     }

    return(
      <Camera
        ref={(cam) => {
          this.camera = cam;
        }}
        style={styles.cameraPreview}
        aspect={Camera.constants.Aspect.fill}
        captureTarget={Camera.constants.CaptureTarget.disk}
        type={this.state.cameraType}
        flashMode={this.state.flashMode}
        captureQuality={Camera.constants.CaptureQuality.medium}
        //onFocusChanged={() => {}}
       //  onFocusChanged={() => {}}
          onZoomChanged={() => {}}
       //   defaultTouchToFocus
       //defaultOnFocusComponent={true}
       //mirrorImage={false}
      >
        <View style={styles.camActionTopBar}>
          <TouchableWithoutFeedback style={styles.camActionItem} onPress={this.handleSwitchFlash.bind(this)}>
            {this.getFlashIcon()}
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback style={styles.camActionItem} onPress={this.handleSwitchCameraFace.bind(this)}>
            {this.getFrontCameraIcon()}
          </TouchableWithoutFeedback>
        </View>


        <View style={styles.actionbarWrapper}>

          <View style={styles.camActionBar}>

              <View style={styles.camActionItem}>
                <TouchableWithoutFeedback onPress={this.callPhotoLib.bind(this)}>
                  <Image style={ styles.camActionIcon } source={require('../images/gallery.png')} />
                </TouchableWithoutFeedback>
                <Text style={ styles.camActionText } onPress={this.callPhotoLib.bind(this)}>Photos</Text>
              </View>

              <TouchableWithoutFeedback  style={styles.camActionItem} onPress={this.takePicture.bind(this)}>
                <Animated.Image style={ [styles.camActionCameraIcon, {transform: [{rotate: spin}] } ] } source={ camera } />
              </TouchableWithoutFeedback>

              <View style={styles.camActionItem}>
                <TouchableWithoutFeedback onPress={this.props.close}>
                  <Image style={ styles.camActionIcon } source={require('../images/close_camera.png')} />
                </TouchableWithoutFeedback>
                <Text style={ styles.camActionText }>Close</Text>
              </View>

          </View>

       </View>

      </Camera>
    )

  }

  render() {
   return (
     <View style={styles.container}>
         {this.renderCamera()}
     </View>
   );
 }


}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  cameraPreview: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  camActionTopBar:{
    flex: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end'
  },
  cameraActionTopIcon: {
    padding: 12,
    marginRight: 20,
    //marginTop: 80,
    marginTop: 10,
    width: 15,
    height: 15
  },

  actionbarWrapper:{
    flex: 1,
    flexDirection: 'column',
    justifyContent:'flex-end',
  },
  camActionBar:{
    flex: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flexWrap: 'nowrap',
    //alignSelf: 'stretch',
    alignContent: 'center',
    //backgroundColor: '#ffffff',
    paddingBottom: 15,
    width: SCREENWIDTH
  },
  camActionItem:{
    flex: 0,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  camActionIcon: {
    flex: 0,
    width: 30,
    height: 30
  },
  camActionCameraIcon: {
    flex: 0,
    width: 60,
    height: 60,
    marginLeft: 20,
    //paddingRight: 20
    //marginBottom: 25
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  captureImg: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: SCREENHEIGHT,
    width: SCREENWIDTH
  },
  camActionText:{
    color: '#ffffff'
  }
});
