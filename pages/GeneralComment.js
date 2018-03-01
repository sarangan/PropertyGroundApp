/**
 * PG React Native App
 * @sara
 * General comment
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
  KeyboardAvoidingView
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class GeneralComment extends Component{

  static navigatorButtons = {
     rightButtons: [
       {
         title: 'Save',
         id: 'save'
       }
     ],
      leftButtons:[
        {
          title: 'Cancel',
          id: 'cancel'
        }
      ]

   };


  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      property_id: this.props.property_id,
      loading: false,
      prop_sub_feedback_general_id: '',
      feedback: {},
      general_id: this.props.general_id,
      prop_master_id: this.props.prop_master_id,
      comment: '',
      startEdit : false
    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'save') {
        this.handleSave(true);
      }
      else if(event.id == 'cancel'){
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
 }

  componentDidMount(){
    this.getDetails();
    MessageBarManager.registerMessageBar(this.refs.alert);

  }

  //get the general feedback
  //get the whichever item details
  getDetails = () =>{

    console.log('gen id');
    console.log(this.state.general_id);

    if(this.state.property_id && this.state.general_id){

      this.setState({
        loading: true
      });

      AsyncStorage.getItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, (err, result) => {
        let property_sub_feedback_general = JSON.parse(result) || {};

        if(property_sub_feedback_general.hasOwnProperty(this.state.property_id) ){

          let feedbacks = property_sub_feedback_general[this.state.property_id];

          if(feedbacks.hasOwnProperty(this.state.general_id) ){ //same item id
              this.setState({
                prop_sub_feedback_general_id: feedbacks[this.state.general_id].prop_sub_feedback_general_id,
                feedback: feedbacks[this.state.general_id],
                comment: feedbacks[this.state.general_id].comment,
              });
          }

          this.setState({
            loading: false,
            refreshing: false,
          });

        }
        else{

          this.setState({
            loading: false,
            refreshing: false,
            feedback: {}
          });

        }


      });



    }

  }

  //save details of feedback
  handleSave = (showMsg = true) =>{

    if(this.state.property_id && this.state.general_id){

      this.setState({
        loading: true
      });

      AsyncStorage.getItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, (err, result) => {
        let property_sub_feedback_general = JSON.parse(result) || {};

        let feedback = {
          prop_sub_feedback_general_id: this.state.prop_sub_feedback_general_id ? this.state.prop_sub_feedback_general_id: helper.generateUid(),
          property_id: this.state.property_id,
          item_id: this.state.general_id,
          parent_id: this.state.prop_master_id,
          comment: this.state.comment,
          mb_createdAt:  new Date().toLocaleDateString(),
          sync: 1
        }

        let feedbacks = {};
        if (property_sub_feedback_general.hasOwnProperty(this.state.property_id) ){
          feedbacks =  property_sub_feedback_general[this.state.property_id];
        }

        feedbacks[this.state.general_id] = feedback;

        property_sub_feedback_general[this.state.property_id] = feedbacks;

        // saved to store
        AsyncStorage.setItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, JSON.stringify(property_sub_feedback_general), () => {
          console.log('property feedback saved');
          console.log(property_sub_feedback_general);

          if(showMsg == true){
            MessageBarManager.showAlert({
              message: 'Successfully saved!',
              alertType: 'success',
              animationType: 'SlideFromTop',
              position: 'top',
              shouldHideOnTap: true,
              stylesheetSuccess : { backgroundColor : '#64c8af', strokeColor : '#64c8af'  },
              messageStyle: {color: '#ffffff', fontWeight: '700', fontSize: 15 },
              duration: 700,
              durationToShow: 0,
              durationToHide: 300,
            });
          }


        });

          this.setState({
            loading: false,
            refreshing: false,
            startEdit: false
          });

      });

    }

  }



  render(){

    return(
      <View style={styles.fill}>
      <KeyboardAvoidingView behavior="position">
          <Text style={styles.divTxt}>Comment</Text>

          <TextInput
            style={styles.txtInput}
            onChangeText={(text) => this.setState({comment:text, startEdit: true})}
            placeholder="Any comments?"
            placeholderTextColor="#A9ACBC"
            multiline = {true}
            numberOfLines = {10}
            value={this.state.comment}
            underlineColorAndroid='transparent'
          />

        <MessageBarAlert ref='alert' />
        </KeyboardAvoidingView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    justifyContent: 'flex-start',
    //alignItems: 'flex-start'
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
    flex: 1,
    maxHeight: 40

    //width: '100%'
  },
  txtInput:{
    //height: 45,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#FFFFFF',
    //width: SCREENWIDTH - 10,
    marginTop: 10,
    fontSize: 15,
    height: '60%',
  },
  selectTxt:{
    height: 45,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#FFFFFF',
    //width: SCREENWIDTH - 10,
    marginTop: 10,
    color: '#e1e5ea',
    fontSize: 15,
    alignSelf: 'flex-start',

  },
  divider:{
    marginLeft: 25,
    marginRight: 25,
    height: 1,
    backgroundColor: 'rgba(99,175,203,0.3)',
  },
  helpTxt:{
    color: '#8ED0D6',
    fontSize: 13,
  },


});
