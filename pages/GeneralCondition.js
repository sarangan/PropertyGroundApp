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
  Switch
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

export default class GeneralCondition extends Component{

  static navigatorButtons = {
   rightButtons: [
     {
       title: 'Save',
       id: 'save'
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
    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if (event.id == 'save') {

        this.hanldeSave();

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
    MessageBarManager.unregisterMessageBar();
  }

  //save data
  hanldeSave=()=>{

  }

  getConditionsList =()=>{
    console.log('general condition link');
    this.setState({
      loading: true
    });

    AsyncStorage.getItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, (err, result) => {
      let company_general_condition_link = JSON.parse(result) || [];

        if(company_general_condition_link.hasOwnProperty(this.state.property_id) ){

          this.setState({
            loading: false,
            conditionsList: company_general_condition_link[this.state.property_id]
          });

        }

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

    <TouchableHighlight underlayColor='transparent' aspectRatio={1} >

          <View style={styles.rowWrapper}>
            <View  style={styles.listContainer} >
              <View>
              <Text style={styles.title}>{item.item_name}</Text>

              <View style={styles.dropdownWrapper}>
                <Text style={styles.optionTxt}>opetions</Text>
                <Image source={require('../images/dropdown.png')} style={styles.dropdown_img}/>
              </View>

              </View>
              <Image style={{width: 30, resizeMode: 'contain', height: 30 }} source={require('../images/no_comment.png')} />
            </View>

          </View>

    </TouchableHighlight>
  );

  render(){
    let _keyExtractor = (item, index) => index;

    return(
      <View style={styles.fill}>

        <FlatList
          contentContainerStyle={styles.list}
          data={this.state.conditionsList}
          keyExtractor={_keyExtractor}
          renderItem={this._renderItem}
          ListFooterComponent={this.renderFooter}
          ItemSeparatorComponent={this.renderSeparator}
          extraData={this.state}
          ListEmptyComponent={this.renderEmptyData}
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
    justifyContent: 'center',
    flexDirection: 'column',
    width: SCREENWIDTH
  },
  rowWrapper:{
    padding: 10,
    paddingTop: 12,
    paddingBottom: 12,
    width: SCREENWIDTH,
    backgroundColor: '#FFFFFF'
  },
  listContainer:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title:{
    fontSize: 15,
    fontWeight: "600",
    color: "#475566"
  },
  optionTxt:{
    fontSize: 15,
    fontWeight: "600",
    color: "#A9ACBC",
  },
  dropdown_img:{
    width: 20,
    resizeMode: 'contain',
    height: 20
  },
  dropdownWrapper:{
    flex: 1,
    width: SCREENWIDTH - 85,
    borderTopColor: '#F8F8FA',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginTop: 15,
    paddingTop: 5
  }

});
