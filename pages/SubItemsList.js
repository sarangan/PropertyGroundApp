/**
 * Sanppar React Native App
 * https://sph.com.sg
 * @sara
 * General condition page
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

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class SubItemsList extends Component{

  static navigatorButtons = {
  //  rightButtons: [
  //    {
  //      title: 'Save',
  //      id: 'save'
  //    },
  //  ],

 };

  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      subitems : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
      prop_master_id: this.props.master_id
    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      // if (event.id == 'save') {
      //
      //   this.hanldeSave(true);
      //
      // }

    }
  }

  componentDidMount(){

    MessageBarManager.registerMessageBar(this.refs.alert);

    if(this.state.property_id){
      this.getSubItemsList();
    }

  }

  componentWillUnmount () {
    this.hanldeSave(false);
    // Remove the alert located on this master page from te manager
    MessageBarManager.unregisterMessageBar();
  }

  //save data
  hanldeSave=(showMsg = false)=>{

    this.setState({
      loading: true
    });

  }

  getSubItemsList =()=>{
    console.log('general condition link');
    this.setState({
      loading: true
    });

    AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
      let property_subitem_link = JSON.parse(result) || [];


        console.log('getting sub items');
        console.log(property_subitem_link[this.state.prop_master_id]);
        console.log(this.state.prop_master_id);


        if(property_subitem_link.hasOwnProperty(this.state.prop_master_id) ){

          let sub_items = property_subitem_link[this.state.prop_master_id];
          this.setState({
            loading: false,
            subitems: sub_items,
            refreshing: false,
          });
        }
        else{

          this.setState({
            loading: false,
            refreshing: false,
          });

        }


    });

  }

  //open subitem
  openLink = (item) =>{

    this.props.navigator.push({
      screen: 'PropertyGround.SingleItem',
      title: item.item_name,
      animated: true,
      animationType: 'fade',
      backButtonTitle: "Back",
      passProps: {
        item: item
      },
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
         this.getSubItemsList();

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

  getPhotoStatus = (item) =>{
    let photo = '';
    photo = 'no images'

    return photo;
  }

  //render actionBar
  renderActionBar = () =>{
    return(

        <View style={styles.actionBar}>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Copy</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/copy.png')} >
              </Image>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Remove</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/delete.png')} >
              </Image>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem}
            >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Rename</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/edit.png')} >
              </Image>
            </View>
          </TouchableHighlight>

      </View>

      );

  };

  _renderItem = ({item}) => (
    <TouchableHighlight underlayColor='transparent' aspectRatio={1} onPress={()=>this.openLink(item)}>

          <View style={styles.rowWrapper}>
            <View  style={styles.listContainer} >
              <Text style={styles.title}>{item.item_name}</Text>
              <View style={styles.imagePhotosWrapper}>
                {item.type == 'GENERAL' &&
                  <View style={styles.roundBoxWrapper}>
                  <View style={styles.roundBox}>
                    <Image
                      source={require('../images/gen_chat.png')}
                      style = {styles.genIcons}
                    />
                  </View>
                  <View style={styles.roundBox}>
                    <Image
                      source={require('../images/gen_camera.png')}
                      style = {styles.genIcons}
                    />
                  </View>
                  <View style={styles.roundBox}>
                    <Image
                      source={require('../images/gen_voice.png')}
                      style = {styles.genIcons}
                    />
                  </View>
                </View>
                }
                {item.type == 'ITEM' &&
                  <View style={styles.imagePhotosWrapper}>
                    <Text style={styles.photoTxt}>{this.getPhotoStatus(item)}</Text>
                    <Image
                      source={require('../images/arrow_right.png')}
                      style = {styles.arrowRight}
                    />
                  </View>
                }
              </View>

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
          data={this.state.subitems}
          keyExtractor={_keyExtractor}
          renderItem={this._renderItem}
          ListFooterComponent={this.renderFooter}
          ItemSeparatorComponent={this.renderSeparator}
          extraData={this.state}
          ListEmptyComponent={this.renderEmptyData}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
        />
        <MessageBarAlert ref='alert' />
        <View style={styles.footer}>
          {this.renderActionBar()}
        </View>
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
    backgroundColor: '#F9F9F9',
    paddingBottom: 40
  },
  list: {
    justifyContent: 'center',
    flexDirection: 'column',
    width: SCREENWIDTH
  },
  rowWrapper:{
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
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
    fontWeight: "700",
    color: "#475566"
  },
  photoTxt:{
    fontSize: 13,
    fontWeight: "700",
    color: "#D9D9D9"
  },
  imagePhotosWrapper:{
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  arrowRight:{
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginLeft: 10
  },
  genIcons:{
    width: 22,
    height: 22,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  roundBoxWrapper:{
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  roundBox:{
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#86C9D5',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footer:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#FDFDFD',
    borderTopWidth: 1,
    borderTopColor: '#FDFDFD',
    width: SCREENWIDTH,
    height: 50,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  actionBar:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: SCREENWIDTH,
    height: 40,
    backgroundColor: '#F9F9F9'
  },
  actionBarItem:{
    // width: 30,
    // height: 30
    alignContent: 'center',
  },
  actionBarIcon: {
    alignSelf: 'center',
    width: 15,
    height: 15
  },
  actionBarRefine:{
    color: '#ffffff',
    backgroundColor: '#333333',
    fontSize: 10,
    padding: 3
  },
  actionBarDivder:{
    width: 7,
    height: 20,
    resizeMode: 'cover'
  },
  actionBarIconSticky: {
    width: 25,
    height: 25
  },
  actionBarTxt:{
    // paddingBottom:1,
    // paddingTop:2,
    marginRight: 2,
    color: '#333333'
  },

});
