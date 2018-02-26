/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * General condition page
 */
import React, {Component} from 'react';
import {
  NativeModules,
  LayoutAnimation,
  StyleSheet,
  View,
  Text,
  Dimensions,
  AsyncStorage,
  FlatList,
  TouchableHighlight,
  TextInput,
  ActivityIndicator,
  Image,
  Switch,
  KeyboardAvoidingView
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import FilterPicker from "../components/FilterPicker";
import GenCommentBlock from "../components/GenCommentBlock";

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

export default class GeneralCondition extends Component{

  static navigatorButtons = {
   rightButtons: [
     {
       title: 'Save',
       id: 'save'
     },
     {
       title: 'Sort',
       id: 'sort'
     }
   ],

 };

  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      conditionsList : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
      open_modal: false,
      optionsData: [],
      current_gen_id : '',
      current_user_input : '',
    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if (event.id == 'save') {

        this.hanldeSave(true);

      }
      else if(event.id == 'sort'){

        this.props.navigator.push({
          screen: 'PropertyGround.SortGeneralCondition',
          title: 'Sort general condition',
          animated: true,
          //animationType: 'fade',
          backButtonTitle: "Back",
          passProps: {property_id: this.state.property_id}
        });

      }

    }
  }

  componentDidMount(){

    MessageBarManager.registerMessageBar(this.refs.alert);

    if(this.state.property_id){
      this.getConditionsList();
    }

  }

  componentWillUnmount () {
    this.hanldeSave(false);
    // Remove the alert located on this master page from te manager
    MessageBarManager.unregisterMessageBar();
  }

  //save data
  hanldeSave=(showMsg = false)=>{
    console.log('log save ');

    this.setState({
      loading: true
    });

    AsyncStorage.getItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, (err, result) => {
      let property_general_condition_link = JSON.parse(result) || [];

        if(property_general_condition_link.hasOwnProperty(this.state.property_id) ){

          let gen_list = property_general_condition_link[this.state.property_id];

          for(let i=0, l = gen_list.length; i < l ; i++){

            for(let m=0, n = this.state.conditionsList.length; m < n ; m++ ){

              if( gen_list[i].prop_general_id == this.state.conditionsList[m].prop_general_id){

                gen_list[i].user_input = this.state.conditionsList[m].user_input;
                gen_list[i].comment = this.state.conditionsList[m].comment;
                break;
              }
            }

          }

          property_general_condition_link[this.state.property_id] = gen_list;

          AsyncStorage.setItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, JSON.stringify(property_general_condition_link), () => {
            console.log('property general table stored');

            this.setState({
              loading: false,
            });

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

        }

    });


  }

  getConditionsList =()=>{
    console.log('general condition link');
    this.setState({
      loading: true
    });

    AsyncStorage.getItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, (err, result) => {
      let property_general_condition_link = JSON.parse(result) || [];

        if(property_general_condition_link.hasOwnProperty(this.state.property_id) ){

          let gen_list = property_general_condition_link[this.state.property_id];
          gen_list.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} );

          this.setState({
            loading: false,
            conditionsList: gen_list,
            refreshing: false,
          });

        }

    });

  }

  // add comment
  addComment = (text, item) =>{
    console.log(text);
    console.log(item);

    let gen_list = this.state.conditionsList;
    for(let i = 0, l = gen_list.length; i < l; i++){

      if(item.prop_general_id == gen_list[i].prop_general_id){
        // same general data
        gen_list[i].comment =  text;
        gen_list[i].sync = 1;
        this.setState({
          conditionsList: gen_list,
        });
        break;

      }

    }


  }

  //open filter modal
  openFilterModal = (item) =>{
    console.log(item)

    let options = item.options.split(';');
    if(Array.isArray(options)){

      this.setState({
        optionsData: options,
        current_gen_id: item.prop_general_id,
        current_user_input: item.user_input
      }, ()=>{
        this.setState({open_modal: true});
      });

    }

  }

  //change spinner
  changeReportType = (item, index) =>{
    console.log('change item');
    console.log(item);
    if(item){
      this.setState({
          current_user_input: item,
      }, ()=>{

      }

    );
    }

  }

  //close tag modal
  closeReportTypeModal = () =>{
    console.log('clsoing modal');

    this.setState({ open_modal: false }, ()=>{

      let gen_list = this.state.conditionsList;
      for(let i = 0, l = gen_list.length; i < l; i++){

        if(this.state.current_gen_id == gen_list[i].prop_general_id){
          // same general data
          gen_list[i].user_input =  this.state.current_user_input;

          this.setState({
            conditionsList: gen_list,
            current_user_input: '',
            current_gen_id: ''
          });
          break;

        }

      }

    });

  }

  //cancel tag modal
  cancelReportTypeModal = () =>{

    this.setState({
      open_modal: false,
    });

  }

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 0,
          //marginTop: 20,
        }}
      >
        <ActivityIndicator animating />
      </View>
    );
  };

  renderSeparator = () => {
   return (
     <View
       style={{
          height: 2,
          alignSelf: 'flex-end',
          width: '100%',
          // marginBottom: 1,
          // marginTop: 1,
       }}
     />
   );
 };

  renderHeader = () => {
    return null;
  }

  handleRefresh = () => {
     this.setState(
       {
         refreshing: true,
         //properties: [],
       },
       () => {
         this.getConditionsList();

       }
     );
   };

  renderEmptyData = () =>{
    return(
      <View style={{ flex: 1, width: SCREENWIDTH,  alignContent:'center', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} >
        <Image style={{ width: 80, height: 80, marginTop: SCREENHEIGHT / 3 }} source={require('../images/nodata.png')} />
      </View>
    );
  }

  _renderItem = ({item}) => (

    <View>
        <GenCommentBlock item={item} handleOpenFilterModal={this.openFilterModal} handleAddComment={this.addComment} />
    </View>
  );

  renderList=()=>{
    let _keyExtractor = (item, index) => index;
    return(
      <View>
      <KeyboardAvoidingView behavior="position">
        <FlatList
          contentContainerStyle={styles.list}
          data={this.state.conditionsList}
          keyExtractor={_keyExtractor}
          renderItem={this._renderItem}
          ListFooterComponent={this.renderFooter}
          ItemSeparatorComponent={this.renderSeparator}
          extraData={this.state}
          ListEmptyComponent={this.renderEmptyData}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
        />

        { this.state.open_modal &&
          <View style={styles.modalWrapper}>
            <FilterPicker
              closeModal={this.closeReportTypeModal}
              cancelModal={this.cancelReportTypeModal}
              changeValue={this.changeReportType}
              current_value={this.state.current_user_input}
              data ={this.state.optionsData}
            />
          </View>
        }
        </KeyboardAvoidingView>
      </View>
    );
  }

  render(){

    return(
      <View style={styles.fill}>
        {
          this.renderList()
        }
        <MessageBarAlert ref='alert' />

      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9'
  },
  list: {
    justifyContent: 'center',
    flexDirection: 'column',
    width: SCREENWIDTH,
    paddingBottom: 30
  },
  modalWrapper:{
    flex: 1,
    flexDirection: 'row',
    width: SCREENWIDTH,
    backgroundColor: '#FCFCFD',
    padding: 0,
    margin: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },


});
