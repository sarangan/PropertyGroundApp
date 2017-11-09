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


export default class GeneralAudiox extends Component{

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
      firstCall: true

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
   this.handleSave(false);
   // Remove the alert located on this master page from te manager
   MessageBarManager.unregisterMessageBar();

   clearInterval(this._progressInterval);
 }

  componentDidMount(){
    this.getDetails();
    MessageBarManager.registerMessageBar(this.refs.alert);

    this.player = null;
    this.recorder = null;
    this.lastSeek = 0;

    this._reloadRecorder();

  }

  _updateState(err) {


    this.setState({
      recordButton: this.recorder  && this.recorder.isRecording ? 'Stop' : 'Record',
      recordButtonDisabled: !this.recorder || (this.player && !this.player.isStopped),
    });
  }

  //get the meter feedback
  //get the whichever item details
  getDetails = () =>{

    console.log('gen id');
    console.log(this.state.general_id);

    if(this.state.property_id && this.state.general_id){

      this.setState({
        loading: true
      });

    }

  }


  _reloadRecorder() {
    if (this.recorder) {
      this.recorder.destroy();
    }

    let filename = helper.generateUid() + '.mp4';

    this.recorder = new Recorder(filename, {
      bitrate: 256000,
      channels: 2,
      sampleRate: 44100,
      quality: 'max'
      //format: 'ac3', // autodetected
      //encoder: 'aac', // autodetected
    }).prepare((err, fsPath) => {
      console.log('fsPath', fsPath);


      if (err) {
        console.log('error at reloadRecorder():');
        console.log(err);
      }
      else{
        if(this.state.firstCall){
          this.setState({firstCall: false });
        }
        else{
          let audios = this.state.audios;
          let audiosfiles = this.state.audiosfiles;
          audios.push(fsPath);
          audiosfiles.push(filename)
          this.setState({
            audios
          });

        }

      }

      this._updateState();
    });

    this._updateState();
  }

  _toggleRecord(){

    this.recorder.toggleRecord((err, stopped) => {
      if (err) {
        this.setState({
          error: err.message
        });
      }
      if (stopped){
        this._reloadRecorder();
      }

      this._updateState();
    });
  }


  //save details of feedback
  handleSave = (showMsg = true) =>{

    if(this.state.property_id && this.state.general_id){

      this.setState({
        loading: true
      });


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
