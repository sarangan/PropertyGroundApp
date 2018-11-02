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
  Button,
  Platform
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';

import { Recorder, MediaStates } from 'react-native-audio-toolkit';
import PGAudioPlayer from '../components/PGAudioPlayer';

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

var RNFS = require('react-native-fs');

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
      item_id: this.props.general_id,
      parent_id: this.props.prop_master_id,
      loading: false,

      recordButtonDisabled: true,

      error: null,
      audios: [],
      filename : helper.generateUid() + '.mp4',
      audioPath : '',
      platform: 'ios'
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

    }


   componentWillMount() {

     this.recorder = null;
     this._reloadRecorder();

   }


   componentDidMount(){
      this.getDetails(); //get all the related audios
      this.setState({
        platform: Platform.OS
      });
   }

   //get the whichever item details
   getDetails = () =>{

     if(this.state.property_id && this.state.item_id){

       this.setState({
         loading: true
       });

       // get photos
       AsyncStorage.getItem(TableKeys.PROPERTY_SUB_VOICE_GENERAL, (err, result) => {
         let audios = JSON.parse(result) || {};

         if(audios.hasOwnProperty(this.state.property_id) ){

           let property_audios = audios[this.state.property_id];

           if(property_audios.hasOwnProperty(this.state.parent_id) ){

             let master_audios = property_audios[this.state.parent_id];

             if(master_audios.hasOwnProperty(this.state.item_id) ){

               this.setState({
                 audios: master_audios[this.state.item_id],
                 loading: false,
               });

             }
             else{
               this.emptyData();
             }

           }
           else{
             this.emptyData();
           }

         }
         else{
           this.emptyData();
         }

       });


     }

   }


   // just to clear stuffs
   emptyData = () =>{
     this.setState({
       loading: false,
       audios: []
     });
   }

   _updateState(err) {
     this.setState({
       recordButtonDisabled: !this.recorder,
     });
   }


  _reloadRecorder() {
    if (this.recorder){
      this.recorder.destroy();
    }

    let filename = helper.generateUid() + '.mp4';
    this.setState({
      filename : filename,
      audioPath : RNFS.DocumentDirectoryPath + '/' + filename
    }, () =>{

      this.recorder = new Recorder(this.state.filename, {
        bitrate: 256000,
        channels: 2,
        sampleRate: 44100,
        quality: 'max'
        //format: 'ac3', // autodetected
        //encoder: 'aac', // autodetected
      });

      this._updateState();

    });

    this._updateState();
  }

  _toggleRecord() {

    this.recorder.toggleRecord((err, stopped) => {
      if (err) {
        this.setState({
          error: err.message
        });
      }
      if (stopped) {
        this.updateAudios(this.state.filename, this.state.audioPath);
        this._reloadRecorder();
      }

      this._updateState();
    });
  }


  // update audios
  updateAudios = (filename, audioPath) =>{

    AsyncStorage.getItem(TableKeys.PROPERTY_SUB_VOICE_GENERAL, (err, result) => {
      let audios = JSON.parse(result) || {};

      let property_audios = audios[this.state.property_id] || {};
      let master_audios = property_audios[this.state.parent_id] || {};

      let audios_array = this.state.audios;

      let filepart = Date.now();
      let voice_name = 'Voice_'+ filepart;

      let audio_data = {
        prop_sub_feedback_general_id: helper.generateUid(),
        property_id: this.state.property_id,
        item_id: this.state.item_id,
        parent_id: this.state.parent_id,
        voice_name: voice_name,
        voice_url: audioPath,
        file_name: filename,
        mb_createdAt:  new Date().toLocaleDateString(),
        sync: 1
      };
      audios_array.push(audio_data);

      master_audios[this.state.item_id] = audios_array;
      property_audios[this.state.parent_id] = master_audios;
      audios[this.state.property_id] = property_audios;

      this.setState({
        audios: audios_array
      }, ()=>{

        // saved to store
        AsyncStorage.setItem(TableKeys.PROPERTY_SUB_VOICE_GENERAL, JSON.stringify(audios), () => {
          console.log('saved audios');
          console.log(audios);
        });

      });


    });

  }


  // delete audio
  deleteAudio = (index, filename) =>{
    console.log(index);


    // create a path you want to delete
    var audiopath = RNFS.DocumentDirectoryPath + '/' + filename;

      RNFS.unlink(audiopath)
      .then(() => {
        console.log('FILE DELETED');

        // now we can update the AsyncStorage

        AsyncStorage.getItem(TableKeys.PROPERTY_SUB_VOICE_GENERAL, (err, result) => {
          let audios = JSON.parse(result) || {};

          let property_audios = audios[this.state.property_id] || {};
          let master_audios = property_audios[this.state.parent_id] || {};

          let audios_array = this.state.audios;
          audios_array.splice(index, 1);

          master_audios[this.state.item_id] = audios_array;
          property_audios[this.state.parent_id] = master_audios;
          audios[this.state.property_id] = property_audios;

          this.setState({
            audios: audios_array
          }, ()=>{

            // saved to store
            AsyncStorage.setItem(TableKeys.PROPERTY_SUB_VOICE_GENERAL, JSON.stringify(audios), () => {
              console.log('saved audios');
              console.log(audios);
            });

          });


        });


      })
      .catch((err) => {
        console.log(err.message);
      });

  }


  getRecordImage = () =>{
    let img = <Image
      source={require('../images/gen_voice.png')}
      style = {styles.genIcons}
    />;

    if(this.recorder && this.recorder.isRecording ){
      img = <Image
        source={require('../images/stop.png')}
        style = {styles.genIcons}
      />
    }
    else {
      img = <Image
        source={require('../images/gen_voice.png')}
        style = {styles.genIcons}
      />
    }

    return (img);
  }


  render(){

    return(
      <View style={styles.fill}>
        {this.recorder && this.recorder.isRecording &&
          <View>
            <Image source={require('../images/recording.gif')} style={styles.recording}/>
          </View>
        }

        {this.state.error &&
          <View>
            <Text style={styles.errorMessage}>{this.state.error}</Text>
          </View>
        }

        <ScrollView>

          <Text style={styles.divTxt}>Audios</Text>

          {
            this.state.audios.map( (item, index) =>{
              return <PGAudioPlayer audio={item} filename={item.file_name} key={index} delete={this.deleteAudio} audioIndex={index} />
            })
          }


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
    //alignItems: 'center'
  },
  divTxt:{
    backgroundColor: "#F7F7F9",
    color: "#81C5D3",
    fontSize: 15,
    fontWeight: "600",
    //width: SCREENWIDTH,
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
    backgroundColor: '#E70000',
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
  recording:{
    width: SCREENWIDTH,
    height: 80,
    resizeMode: 'contain'
  },
  errorMessage: {
   fontSize: 14,
   textAlign: 'left',
   color: '#EE2B47',
   padding: 5
 }

});
