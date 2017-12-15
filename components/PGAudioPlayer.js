/**
 * PG React Native App
 * https://sph.com.sg
 * @sara
 * Audio player
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableHighlight,
  Image,
  ActivityIndicator,
  Switch,
  Slider,
  Button
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';
import helper from '../helper/helper';

import { Player, MediaStates } from 'react-native-audio-toolkit';
var RNFS = require('react-native-fs');

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class AudioPlayer extends Component{


  constructor(props){
    super(props);

    this.state = {

      playButtonDisabled: true,
      loopButtonStatus: false,
      progress: 0,
      error: null,
      audio: this.props.audio,
      filename : this.props.filename,
      fileExists: false,
      audioIndex: this.props.audioIndex

    };

  }


  componentWillUnmount() {
    clearInterval(this._progressInterval);
  }

  _shouldUpdateProgressBar() {
    // Debounce progress bar update by 200 ms
    return Date.now() - this.lastSeek > 200;
  }

  componentWillMount() {
   this.player = null;
   this.lastSeek = 0;

    // write the file
    RNFS.exists(RNFS.DocumentDirectoryPath + '/' + this.state.filename)
    .then((success) => {
      console.log('FILE exists!');
      this.setState({
        fileExists: true,
      });

    })
    .catch((err) => {
      console.log(err.message);
      this.setState({
        fileExists: false,
        error: 'File does not exist'
      });
    });


   this._reloadPlayer();

   this._progressInterval = setInterval(() => {
     if (this.player && this._shouldUpdateProgressBar()) {
       this.setState({progress: Math.max(0, this.player.currentTime) / this.player.duration});
     }
   }, 100);

  }

   _updateState(err) {
     this.setState({
       playPauseButton: this.player && this.player.isPlaying ? 'Pause' : 'Play',
       stopButtonDisabled: !this.player || !this.player.canStop,
       playButtonDisabled: !this.player || !this.player.canPlay,
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


  _toggleLooping(value) {
    this.setState({
      loopButtonStatus: value
    });
    if (this.player) {
      this.player.looping = value;
    }
  }

  getPlayerImage = () =>{
    let img = <Image
      source={require('../images/audio_play.png')}
      style = {styles.playerIcon}
    />;
    if(this.player && this.player.isPlaying ){
      img = <Image
        source={require('../images/audio_pause.png')}
        style = {styles.playerIcon}
      />
    }


    return (img);
  }

  // delete the audio
  deleteAudio = () =>{
    this.props.delete(this.state.audioIndex, this.state.filename);
  }


  render(){

    return(
      <View style={styles.fill}>

          <View style={styles.playerWrapper}>

            <TouchableHighlight style={styles.playBtnWrapper} underlayColor="transparent" onPress={() => this._playPause()}>
                {this.getPlayerImage()}
            </TouchableHighlight>

            <View style={styles.sliderWrapper}>
              <Slider step={0.0001} disabled={this.state.playButtonDisabled} onValueChange={(percentage) => this._seek(percentage)} value={this.state.progress}/>
              <Text style={styles.voiceName}>{this.state.audio.voice_name}</Text>
              <Text style={styles.errorMessage}>{this.state.error}</Text>
            </View>

            <TouchableHighlight style={styles.playBtnWrapper} underlayColor="transparent" onPress={() => this._stop()}>
              <Image source={require('../images/audio_stop.png')} style = {styles.playerIcon} />
            </TouchableHighlight>

            <TouchableHighlight style={styles.playBtnWrapper} underlayColor="transparent" onPress={() => this.deleteAudio()}>
                <Image source={require('../images/delete.png')} style = {styles.playerIcon} />
            </TouchableHighlight>

          </View>


      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  playerWrapper:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: SCREENWIDTH,
    padding: 10
  },
  playBtnWrapper:{
    flex: 0,
    padding: 10,
    alignSelf: 'flex-start'
  },
  playerIcon:{
    width: 22,
    height: 22,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  sliderWrapper:{
    flexDirection: 'column',
    flex: 5
  },
  voiceName:{
    fontSize: 10,
    textAlign: 'left',
    padding: 2,
    color: '#CDE3EB'
  },
  errorMessage:{
    fontSize: 9,
    textAlign: 'left',
    color: '#EE2B47',
    padding: 2
  }
});
