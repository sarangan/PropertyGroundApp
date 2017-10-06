/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * Inspections page
 */
import React, {Component} from 'react';
import {
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
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import NumberControl from '../components/NumberControl';
import SortableListView from 'react-native-sortable-listview'

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

class RowComponent extends React.Component {
  render() {

      return (

        <TouchableHighlight
          underlayColor={'#F8FCFC'}
          style={styles.rowWrapper}
          {...this.props.sortHandlers}
        >
          <View  style={styles.listContainer} >

            <Image
              source={require('../images/sort_hold.png')}
              style = {styles.arrowRight}
            />
            <Text style={styles.title}>{this.props.data.item_name}</Text>

          </View>

        </TouchableHighlight>
      );


  }
}


export default class SortGeneralCondition extends Component{

  static navigatorButtons = {
   rightButtons: [
     {
       title: 'Save',
       id: 'save'
     }
   ]

 };

  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      conditionsList : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if (event.id == 'save') {

        this.hanldeSave(true);

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
    // Remove the alert located on this master page from te manager
    this.hanldeSave(false);
    MessageBarManager.unregisterMessageBar();
  }

  //save data
  hanldeSave=(showMsg = false)=>{

      let conditionsList = this.state.conditionsList;
      for(let i = 0, l = conditionsList.length; i < l; i++){
        conditionsList[i].priority = (i+1);
      }
      this.setState({
        conditionsList
      });

      AsyncStorage.getItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, (err, result) => {

        let property_general_condition_link = JSON.parse(result) || {};
        property_general_condition_link[this.state.property_id] = conditionsList;

        // saved to store
        AsyncStorage.setItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, JSON.stringify(property_general_condition_link), () => {
          console.log('property meter table stored');
          console.log(property_general_condition_link);

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
                // onHide: ()=>{
                //
                //   this.props.navigator.push({
                //     screen: 'PropertyGround.Inspections',
                //     title: 'Inspections',
                //     animated: true,
                //     animationType: 'fade',
                //      //backButtonTitle: "Back",
                //     passProps: {},
                //
                //   });
                //
                // }

              });
          }

        });

      });

  }


  getConditionsList =()=>{

    this.setState({
      loading: true,
    });

    AsyncStorage.getItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, (err, result) => {


      let conditionsList = JSON.parse(result) || {};

      if(conditionsList.hasOwnProperty(this.state.property_id) ){
        conditionsList = conditionsList[this.state.property_id];
      }
      else{
        conditionsList = [];
      }

      conditionsList.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} );


      this.setState({
        conditionsList: conditionsList,
        loading: false,
        refreshing: false
      }, ()=>{
        MessageBarManager.showAlert({
          message: 'Please long press on item to move up and down',
          alertType: 'success',
          animationType: 'SlideFromTop',
          position: 'top',
          shouldHideOnTap: true,
          stylesheetSuccess : { backgroundColor : '#90C8DB', strokeColor : '#90C8DB'  },
          messageStyle: {color: '#ffffff', fontWeight: '700', fontSize: 15 },
          // duration: 700,
          // durationToShow: 0,
          // durationToHide: 300,
        });
      });

    });


  }



  render(){
    let _keyExtractor = (item, index) => index;

    return(
      <View style={styles.fill}>

        <SortableListView
        style={styles.list}
        // data={data}
        // order={order}
        data={this.state.conditionsList}
        onRowMoved={e => {
          //order.splice(e.to, 0, order.splice(e.from, 1)[0])
          console.log(e);
          let conditionsList = this.state.conditionsList;
          conditionsList.splice(e.to, 0, conditionsList.splice(e.from, 1)[0]);
          this.setState({
            conditionsList
          }, ()=>{
            this.forceUpdate();
          });

        }}
        renderRow={row => <RowComponent data={row} />}
      />

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
    flex: 1,
    // justifyContent: 'center',
    // flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 10,
    width: SCREENWIDTH
  },
  rowWrapper:{
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    //width: SCREENWIDTH,
    backgroundColor: '#FFFFFF',
    marginBottom: 10
    // borderBottomWidth: 2,
    // borderColor: '#F9F9F9',
  },
  listContainer:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  title:{
    fontSize: 15,
    //fontWeight: "700",
    color: "#475566"
  },
  container: {
   flex: 1,
   backgroundColor: '#F5FCFF',
 },
 arrowRight:{
   width: 15,
   height: 15,
   resizeMode: 'contain',
   marginRight: 10
 },
});
