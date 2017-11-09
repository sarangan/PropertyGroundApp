/**
 * PG React Native App
 * https://sph.com.sg
 * @sara
 * General Audio
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableHighlight,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  AsyncStorage,
  Switch,
  Slider,
  Button
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';

import { Player, Recorder, MediaStates } from 'react-native-audio-toolkit';

import PGAudioPlayer from '../components/PGAudioPlayer';

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;


export default class GeneralAudio extends Component{

  static navigatorButtons = {
     rightButtons: [
       {
         title: 'Close',
         id: 'close'
       }
     ],

   };


  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      property_id: this.props.property_id,
      loading: false,
      general_id: this.props.general_id,
      prop_master_id: this.props.prop_master_id,

      recordButton: 'Preparing...',

      playButtonDisabled: true,
      recordButtonDisabled: true,

      loopButtonStatus: false,
      progress: 0,

      error: null,
      audios: [],
      audiosfiles: [],
      firstCall: true,
      filename : helper.generateUid() + '.mp4'

    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if(event.id == 'close'){
        this.props.navigator.dismissModal({
          animationType: 'slide-down'
        });
      }

    }
  }

  componentWillUnmount() {
    //console.log('unmount');
    clearInterval(this._progressInterval);
  }

  _shouldUpdateProgressBar() {
    // Debounce progress bar update by 200 ms
    return Date.now() - this.lastSeek > 200;
  }

 componentWillMount() {
   this.player = null;
   this.recorder = null;
   this.lastSeek = 0;

   this._reloadPlayer();
   this._reloadRecorder();

   this._progressInterval = setInterval(() => {
     if (this.player && this._shouldUpdateProgressBar()) {// && !this._dragging) {
       this.setState({progress: Math.max(0, this.player.currentTime) / this.player.duration});
     }
   }, 100);
 }

 _updateState(err) {
   this.setState({
     playPauseButton:      this.player    && this.player.isPlaying     ? 'Pause' : 'Play',
     recordButton:         this.recorder  && this.recorder.isRecording ? 'Stop' : 'Record',

     stopButtonDisabled:   !this.player   || !this.player.canStop,
     playButtonDisabled:   !this.player   || !this.player.canPlay || this.recorder.isRecording,
     recordButtonDisabled: !this.recorder || (this.player         && !this.player.isStopped),
   });
 }




 _playPause() {
  this.player.playPause((err, playing) => {
    if (err) {
      this.setState({
        error: err.message
      });
    }
    this._updateState();
  });
}

_stop() {
  this.player.stop(() => {
    this._updateState();
  });
}

_seek(percentage) {
  if (!this.player) {
    return;
  }

  this.lastSeek = Date.now();

  let position = percentage * this.player.duration;

  this.player.seek(position, () => {
    this._updateState();
  });
}

_reloadPlayer() {
  if (this.player) {
    this.player.destroy();
  }



  this.player = new Player(this.state.filename, {
    autoDestroy: false
  }).prepare((err) => {
    if (err) {
      console.log('error at _reloadPlayer():');
      console.log(err);
    } else {
      this.player.looping = this.state.loopButtonStatus;
    }

    this._updateState();
  });

  this._updateState();

  this.player.on('ended', () => {
    this._updateState();
  });
  this.player.on('pause', () => {
    this._updateState();
  });
}

_reloadRecorder() {
  if (this.recorder) {
    this.recorder.destroy();
  }

  this.recorder = new Recorder(this.state.filename, {
    bitrate: 256000,
    channels: 2,
    sampleRate: 44100,
    quality: 'max'
    //format: 'ac3', // autodetected
    //encoder: 'aac', // autodetected
  });

  this._updateState();
}

_toggleRecord() {
  if (this.player) {
    this.player.destroy();
  }

  this.recorder.toggleRecord((err, stopped) => {
    if (err) {
      this.setState({
        error: err.message
      });
    }
    if (stopped) {
      this._reloadPlayer();
      this._reloadRecorder();
    }

    this._updateState();
  });
}

_toggleLooping(value) {
  this.setState({
    loopButtonStatus: value
  });
  if (this.player) {
    this.player.looping = value;
  }
}

  getRecordImage = () =>{
    let img = <Image
      source={require('../images/gen_voice.png')}
      style = {styles.genIcons}
    />;

    if(this.state.recordButton == 'Stop'){
      img = <Image
        source={require('../images/stop.png')}
        style = {styles.genIcons}
      />
    }
    else if(this.state.recordButton == 'Record'){
      img = <Image
        source={require('../images/gen_voice.png')}
        style = {styles.genIcons}
      />
    }

    return (img);
  }

  render(){
    console.log(this.state.audios);

    return(
      <View style={styles.fill}>
        <ScrollView>

          <Text style={styles.divTxt}>Audio</Text>

          {/* {
            this.state.audiosfiles.map( (item, index) =>{
              return <PGAudioPlayer filename={item} />
            })
          } */}


          <View style={styles.buttonContainer}>
          <Button disabled={this.state.playButtonDisabled} style={styles.button} onPress={() => this._playPause()} title={this.state.playPauseButton}>

          </Button>
          <Button disabled={this.state.stopButtonDisabled} style={styles.button} onPress={() => this._stop()} title="stop">

          </Button>
        </View>
        <View style={styles.settingsContainer}>
          <Switch
          onValueChange={(value) => this._toggleLooping(value)}
          value={this.state.loopButtonStatus} />
          <Text>Toggle Looping</Text>
        </View>
        <View style={styles.slider}>
          <Slider step={0.0001} disabled={this.state.playButtonDisabled} onValueChange={(percentage) => this._seek(percentage)} value={this.state.progress}/>
        </View>
        <View>
          <Text style={styles.title}>
            Recording
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button disabled={this.state.recordButtonDisabled} style={styles.button} onPress={() => this._toggleRecord()} title={this.state.recordButton}>

          </Button>
        </View>
        <View>
          <Text style={styles.errorMessage}>{this.state.error}</Text>
        </View>


        </ScrollView>

        <MessageBarAlert ref='alert' />

        <TouchableHighlight style={styles.roundBox} underlayColor="transparent" onPress={()=>this._toggleRecord()}>
          {this.getRecordImage()}
        </TouchableHighlight>

      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  divTxt:{
    backgroundColor: "#F7F7F9",
    color: "#81C5D3",
    fontSize: 15,
    fontWeight: "600",
    width: SCREENWIDTH,
    textAlign: "left",
    padding: 10,
  },
  divider:{
    marginLeft: 25,
    marginRight: 25,
    height: 1,
    backgroundColor: 'rgba(99,175,203,0.3)',
  },

  roundBox:{
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3a8bbb',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: '5%',
    right: '2%'
  },
  genIcons:{
    width: 22,
    height: 22,
    resizeMode: 'contain',
    alignSelf: 'center',
  },


  button: {
   padding: 20,
   fontSize: 20,
   backgroundColor: 'white',
 },

 buttonContainer: {
   flex: 1,
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 settingsContainer: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 container: {
   borderRadius: 4,
   borderWidth: 0.5,
   borderColor: '#d6d7da',
 },
 title: {
   fontSize: 19,
   fontWeight: 'bold',
   textAlign: 'center',
   padding: 20,
 },
 errorMessage: {
   fontSize: 15,
   textAlign: 'center',
   padding: 10,
   color: 'red'
 }

});
