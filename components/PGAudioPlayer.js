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

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class AudioPlayer extends Component{


  constructor(props){
    super(props);

    this.state = {
      playPauseButton: 'Preparing...',
      recordButton: 'Preparing...',

      stopButtonDisabled: true,
      playButtonDisabled: true,

      loopButtonStatus: false,
      progress: 0,

      filename: this.props.filename,

      error: null
    };

  }

 componentWillUnmount() {

   clearInterval(this._progressInterval);
 }

  componentDidMount(){

    this.player = null;
    this.lastSeek = 0;

    this._reloadPlayer();

    this._progressInterval = setInterval(() => {
      if (this.player && this._shouldUpdateProgressBar()) {// && !this._dragging) {
        this.setState({progress: Math.max(0, this.player.currentTime) / this.player.duration});
      }
    }, 100);

  }

  _shouldUpdateProgressBar() {
    // Debounce progress bar update by 200 ms
    return Date.now() - this.lastSeek > 200;
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

    console.log('reload plauer ')
    console.log(this.state.filename);

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

  getPlayPauseImg = () =>{

    let img = <Image
      source={require('../images/play.png')}
      style = {styles.genIcons}
    />;

    if(this.state.playPauseButton == 'Play'){

      img = <Image
        source={require('../images/play.png')}
        style = {styles.genIcons}
      />
    }
    else if(this.state.playPauseButton == 'Pause'){

      img = <Image
        source={require('../images/pause.png')}
        style = {styles.genIcons}
      />
    }

    return (img);
  }

  render(){

    return(
      <View style={styles.fill}>

            <TouchableHighlight style={styles.roundBox} underlayColor='transparent'  onPress={()=>this._playPause()}
              disabled={this.state.playButtonDisabled} >
              {this.getPlayPauseImg()}
            </TouchableHighlight>

            <TouchableHighlight underlayColor='transparent' style={styles.roundBox} onPress={()=>this._stop()}
              disabled={this.state.stopButtonDisabled} >
              <Image
                source={require('../images/stop.png')}
                style = {styles.genIcons}
              />
            </TouchableHighlight>


          {/* <View style={styles.slider}>
            <Slider step={0.0001} disabled={this.state.playButtonDisabled} onValueChange={(percentage) => this._seek(percentage)} value={this.state.progress}/>
          </View> */}


      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: SCREENWIDTH,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99,175,203,0.3)'
  },
  genIcons:{
    width: 22,
    height: 22,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  roundBox:{
    width: 40,
    height: 40,
    backgroundColor: '#86C9D5',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    height: 10,
    margin: 5,
    marginBottom: 10,
    marginLeft: 20
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
