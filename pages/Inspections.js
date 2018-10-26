/**
 * PropertyGround React Native App
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
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';

import KeepAwake from 'react-native-keep-awake';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import SyncImg from '../components/SyncImg';
import Sync from '../helper/Sync';

import SyncStore from "../stores/SyncStore";

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export let homeNavigator = null; // to use in drawer

export default class Inspections extends Component{

  static navigatorButtons = {
   rightButtons: [
     {
       title: 'Add new',
       id: 'property'
     }
   ],
   leftButtons: [
     {
       icon: require('../images/hamburger_menu.png'),
       id: 'menu'
     }
   ],

 };

  constructor(props){
    super(props);
    homeNavigator = this.props.navigator;
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      properties : [],
      master_properties: [],
      loading: false,
      refreshing: false
    };

    this.getSyncStatus = this.getSyncStatus.bind(this);
  }


  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if (event.id == 'property') {

        this.addNewProperty();

      }
      else if( event.id == 'refresh' ){
          this.getProperties();
      }
      else if (event.id == 'menu') {

        this.props.navigator.toggleDrawer({
         side: 'left',
         animated: true
       });

      }

    }
  }

  addNewProperty =() =>{
    this.props.navigator.push({
      screen: 'PropertyGround.NewProperty',
      title: 'Add new property',
      animated: true,
      //animationType: 'fade',
       backButtonTitle: "Back",
      passProps: {}
    });
  }

  componentWillMount() {

    AsyncStorage.getItem(AppKeys.SHOWGUIDE, (err, result) => {
      //console.log('show guide');
      //console.log(result);
      if(result){
        //user already saw it
      }
      else{
        this.showGuide();
      }
    });

    SyncStore.on("change", this.getSyncStatus);
  }

  componentWillUnmount(){
    console.log('unmonting now')
    SyncStore.removeListener("change", this.getSyncStatus);
    clearInterval(this._interval);
  }


  componentDidMount(){

    // let keys = [TableKeys.PROPERTY, TableKeys.PROPERTY_INFO, TableKeys.SIGNATURES, TableKeys.PROPERTY_MASTERITEM_LINK, TableKeys.PROPERTY_SUBITEM_LINK, TableKeys.PROPERTY_GENERAL_CONDITION_LINK, TableKeys.PROPERTY_METER_LINK];
    // AsyncStorage.multiRemove(keys, (err) => {
    //   // keys k1 & k2 removed, if they existed
    //   // do most stuff after removal (if you want)
    // });

    this.getProperties();
  }

  showGuide = () =>{

    this.props.navigator.showModal({
       screen: "PropertyGround.Guide",
       title: '',
       animationType: 'slide-up',
       navigatorStyle:{
         navBarHidden: true,
       },
   });

  }

  //checking sync
  checkSync = () =>{


      let nosync = false;

      for(let i =0, l = this.state.master_properties.length; i < l ; i++){

        // console.log(this.state.master_properties[i].property_id);
        // console.log(this.state.master_properties[i].sync);

        if(this.state.master_properties[i].sync == 2 ){
          nosync = true;
          helper.synSrv(this.state.master_properties[i]);

          let master_properties = this.state.master_properties;
          Sync.getNonUpdatedNumbers( master_properties[i].property_id, master_properties[i]).then( (total)=>{
            master_properties[i].total_updated_items = total;
            this.setState({
              master_properties
            });
          });

        }

      }

      if(!nosync){
        KeepAwake.deactivate();
        //console.log('clearing interval');
        //clearInterval(this._interval); //TODO
      }
      else{
        KeepAwake.activate();

        this._interval = setInterval(() => { //TODO
          this.checkSynced();
        }, 3000);

      }

  }


  checkSynced = () =>{

    let nosync = false;


      AsyncStorage.getItem(TableKeys.PROPERTY, (err, result) => {

        let master_properties = JSON.parse(result) || [];

        //console.log(master_properties);

        this.setState({
          master_properties: master_properties,
        }, ()=>{


          for(let i =0, l = this.state.master_properties.length; i < l ; i++){

            if(this.state.master_properties[i].sync == 2 ){
              nosync = true;
              //helper.checkSynSrv( i , this.state.master_properties);

              let master_properties = this.state.master_properties;
              Sync.getTotalItems( master_properties[i].property_id).then( (total)=>{
                master_properties[i].total_items = total;
                this.setState({
                  master_properties
                });
              });

              Sync.getNonUpdatedNumbers( master_properties[i].property_id, master_properties[i]).then( (total)=>{

                console.log("i am getting total numbers : " , total);

                master_properties[i].total_updated_items = total;
                this.setState({
                  master_properties
                });
              });


            }

          }

          if(!nosync){
            KeepAwake.deactivate();
            //console.log('clearing interval');
            clearInterval(this._interval); //TODO
          }
          else{
            KeepAwake.activate();
          }



        });


    }); // end of astore







  }



  //get synced status
  getSyncStatus(){

   let property_id = SyncStore.getSyncedProperty();

   console.log('synced finihsed from ui thread');
   console.log(property_id);
   this.getProperties(true);
   //clearInterval(this._interval);

 }


  getProperties =(nosync = false)=>{

    AsyncStorage.getItem(AppKeys.LOGINKEY, (err, result) => {
      console.log('get login details');
      console.log(JSON.parse(result));
      if(result){
        //user already saw it

        //console.log(result);

        let pgauth = JSON.parse(result) || {};

        if(pgauth.hasOwnProperty("user") && pgauth.hasOwnProperty("token") ){
          auth["AUTHTOKEN"] = pgauth.token;
          auth["ISLOGIN"] =  true;
          auth["USER"] =  pgauth.user;


          this.setState({
            loading: true
          });
          AsyncStorage.getItem(TableKeys.PROPERTY_INFO, (err, result) => {

            let properties_info = JSON.parse(result) || [];

            AsyncStorage.getItem(TableKeys.PROPERTY, (err, result) => {

              let master_properties = JSON.parse(result) || [];

              //console.log(master_properties);

              this.setState({
                properties: properties_info,
                master_properties: master_properties,
                loading: false,
                refreshing: false
              }, ()=>{


                nosync = false;
                for(let i =0, l = this.state.master_properties.length; i < l ; i++){

                  if(this.state.master_properties[i].sync == 2 ){
                    nosync = true;
                  }

                  let master_properties = this.state.master_properties;
                  Sync.getTotalItems( master_properties[i].property_id).then( (total)=>{
                    master_properties[i].total_items = total;
                    this.setState({
                      master_properties
                    });
                  });


                }
                console.log("going to start process");
                //console.log(nosync);

                if(nosync){
                  KeepAwake.activate();
                  this.checkSync();
                  // this._interval = setInterval(() => { //TODO
                  //   this.checkSync();
                  // }, 30000);

                }

              });

            });




          });

        }
        else{

          this.props.navigator.showModal({
  	          screen: "PropertyGround.Login",
  	          title: 'PropertyGround',
  	          animationType: 'slide-up',
  	          navigatorStyle:{
  							navBarHidden: true,
  	          },
  	          passProps: {
  	           }
  	      });

        }


      }
      else{
        //console.log("no login yet ");

        this.props.navigator.showModal({
	          screen: "PropertyGround.Login",
	          title: 'PropertyGround',
	          animationType: 'slide-up',
	          navigatorStyle:{
							navBarHidden: true,
	          },
	          passProps: {
	           }
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

  //open property view
  handlePropOpen(item){
    //console.log(item);

    AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {
      let property_masteritem_link = JSON.parse(result) || {};

      if(property_masteritem_link.hasOwnProperty(item.property_id) ){
        property_masteritem_link = property_masteritem_link[item.property_id];
      }
      else{
        property_masteritem_link = [];
      }

      let isTotalRoomsMore = false;
      for(let i = 0, l = property_masteritem_link.length; i < l ; i++){
        let prop = property_masteritem_link[i];
          //we are from same property
          if(prop.total_num > 0 && prop.option == 'NUM'){
            isTotalRoomsMore = true;
            break;
          }

      }

      if(this.getLockText(item.property_id) == 1 ){

        this.props.navigator.push({
          screen: 'PropertyGround.Report',
          title: 'Summary Report',
          animated: true,
          animationType: 'fade',
          backButtonTitle: "Back",
          passProps: {
            property_id: item.property_id,
            property: item,
            syncText: this.getSyncText(item.property_id),
            sync: this.findSyncStatus(item.property_id),
            locked: this.getLockText(item.property_id)
          },
        });

      }
      else if(isTotalRoomsMore){
        // ok to show room list TODO

        this.props.navigator.push({
          screen: 'PropertyGround.RoomList',
          title: 'Room list',
          animated: true,
          animationType: 'fade',
          backButtonTitle: "Back",
          passProps: {
            property_id: item.property_id,
            property: item,
            syncText: this.getSyncText(item.property_id),
            sync: this.findSyncStatus(item.property_id),
            locked: this.getLockText(item.property_id)
          },
        });


      }
      else{
        // lets add some rooms first

        this.props.navigator.push({
            screen: "PropertyGround.AddRoomList",
            title: 'Add room list',
            //animationType: 'slide-up',
            animated: true,
            //animationType: 'fade',
            navigatorStyle:{
              navBarTextColor: 'white',
              navBarButtonColor: 'white',
              statusBarTextColorScheme: 'light',
              navBarBackgroundColor: '#00BDDB',
              navBarBlur: false,
              screenBackgroundColor: '#FFFFFF',
              navBarTransparent: false,
            },
            passProps: {
              property_id: item.property_id
            },
        });

        // this.props.navigator.push({
        //   screen: 'PropertyGround.AddRoomList',
        //   title: 'Add room list',
        //   animated: true,
        //   animationType: 'fade',
        //   backButtonTitle: "Back",
        //   passProps: {
        //     property_id: item.property_id
        //   },
        // });

      }

    });

  }

  renderSeparator = () => {
   return (
     <View
       style={{
          height: 5,
          alignSelf: 'flex-end',
          width: '100%',
          marginBottom: 2,
          marginTop: 2,
          //backgroundColor: '#E8F0F6'
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
         this.getProperties();

       }
     );
   };

  renderEmptyData = () =>{
    return(
      <View style={{ flex: 1, alignContent:'center', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} >
        <Image style={{ width: 80, height: 80, marginTop: SCREENHEIGHT / 3 }} source={require('../images/nodata.png')} />
      </View>
    );
  }

  //get sync text
  getSyncText = (property_id) =>{
    let sync_text = '';
    let sync = 0;
    for(let i =0, l = this.state.master_properties.length; i < l ; i++){
      if(property_id == this.state.master_properties[i].property_id ){
        sync = this.state.master_properties[i].sync;
        break;
      }

    }

    if(sync == 1){
       sync_text = 'Not Sync';
    }
    else if(sync == 2){
      sync_text = 'Syncing';
    }
    else if(sync == 3){
      sync_text = 'Synced';
    }

    return sync_text;

  }

  //check sync status
  findSyncStatus = (property_id) =>{

    let sync = 0;
    for(let i =0, l = this.state.master_properties.length; i < l ; i++){

      if(property_id == this.state.master_properties[i].property_id ){
        sync = this.state.master_properties[i].sync;
        break;
      }

    }

    //console.log(sync);

    return sync;

  }

  //get sync text
  getLockText = (property_id) =>{

    let lock = 0;
    for(let i =0, l = this.state.master_properties.length; i < l ; i++){
      if(property_id == this.state.master_properties[i].property_id ){
        lock = this.state.master_properties[i].locked;
        break;
      }

    }

    return lock;

  }


  getTotalItem = (property_id) =>{

    let total = 0;
    for(let i =0, l = this.state.master_properties.length; i < l ; i++){

      if(property_id == this.state.master_properties[i].property_id ){
        total = this.state.master_properties[i].total_items;
      }
    }
    return total;

  }

  getTotalUpdatedItem = (property_id) =>{

    let total = 0;
    for(let i =0, l = this.state.master_properties.length; i < l ; i++){

      if(property_id == this.state.master_properties[i].property_id ){
        total = Number(this.state.master_properties[i].total_items) - Number(this.state.master_properties[i].total_updated_items);
      }
    }

    if(isNaN(total)){
      total = 0;
    }

    return total;

  }

  //open delete
  openDelete = (property) => {
    //console.log(property);

    if( this.findSyncStatus(property.property_id) == 2){
      //cannot delete still syncing

      Alert.alert(
          'Delete Property',
          'You cannot delete this property while syncing!',
          [
            {text: 'OK', onPress: () => {console.log('OK Pressed');} },
          ],
          { cancelable: false }
      );

    }
    else{


      Alert.alert(
          'Delete Property',
          'Do you want to delete this property?',
          [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'OK', onPress: () => { this.deleteProperty(property.property_id); } },
          ],
          { cancelable: false }
      );

    }

  }


  //delete property
  deleteProperty = (property_id) =>{


    let master_properties = this.state.master_properties;
    let properties = this.state.properties;



    for(let i =0, l = master_properties.length; i < l ; i++){

      if(property_id == master_properties[i].property_id ){

        master_properties.splice(i,1);

        AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(master_properties) , () => {

          for(let j = 0, l = properties.length; j < l ; j++){

            if(property_id == properties[j].property_id ){

                properties.splice(j,1);

                AsyncStorage.setItem(TableKeys.PROPERTY_INFO, JSON.stringify(properties) , () => {

                  this.getProperties();

                });
                break;


            }
          }


        });
        break;


      }

    }

  }



  _renderItem = ({item}) => (

    <TouchableHighlight underlayColor='transparent' aspectRatio={1} onPress={()=>this.handlePropOpen(item)} onLongPress={()=>this.openDelete(item)}>

          <View style={styles.rowWrapper}>

              <View
                style={styles.card }
                >

                <View style={{flex: 0, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={require('../images/property.png')}
                    style = {styles.cardImage}
                  />
                </View>


                <View style={styles.cardDetails}>

                  <View style={[styles.cardGenre, {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start'} ]}>
                    <View style={styles.triangleCorner} />
                    <Text style={styles.storeTxt}>{item.report_type}</Text>
                  </View>

                  <Text
                    style={styles.cardTitle}
                    numberOfLines={2}>
                    {item.address_1 + ' ' + item.address_2}
                  </Text>
                  <Text
                    style={styles.cityTitle}
                    numberOfLines={2}>
                    {item.city + ' ' + item.postalcode}
                  </Text>

                  <View style={styles.cardNumbers}>
                    <View style={styles.cardStar}>
                      <Text style={styles.cardStarRatings}>{item.mb_createdAt}</Text>
                      <Text style={[styles.cardStarRatings, {backgroundColor: '#b8b0b0', color: '#ffffff'}]}>{this.getLockText(item.property_id) == 1? ' Locked ' : ''}</Text>
                      <View style={{flex:0, justifyContent: 'flex-start', flexDirection: 'row'}}>
                        <SyncImg sync={this.findSyncStatus(item.property_id)} key={item.property_id + this.findSyncStatus(item.property_id)}/>
                        <Text style={[styles.cardStarRatings, {color: '#0b8457'}]}>{this.getSyncText(item.property_id)}</Text>
                        {this.findSyncStatus(item.property_id) == 2 &&
                        <Text style={styles.numbers_text}>{this.getTotalUpdatedItem(item.property_id)} / {this.getTotalItem(item.property_id)}</Text>
                        }
                      </View>
                    </View>
                  </View>

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
          data={this.state.properties}
          keyExtractor={_keyExtractor}
          renderItem={this._renderItem}
          ListFooterComponent={this.renderFooter}
          ItemSeparatorComponent={this.renderSeparator}
          extraData={this.state}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
          ListEmptyComponent={this.renderEmptyData}
        />

        <TouchableHighlight style={styles.roundBox} underlayColor="transparent" onPress={()=>this.addNewProperty()}>
          <Image
            source={require('../images/add.png')}
            style = {styles.genIcons}
          />
        </TouchableHighlight>

      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#F9F9F9'
  },
  rowWrapper:{
    flex: 1,
    alignSelf: 'stretch',
    paddingLeft: 5,
    paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 5,
    //width: SCREENWIDTH,
    backgroundColor: '#FFFFFF'
  },
  list: {
    justifyContent: 'center',
    flexDirection: 'column',
    //width: SCREENWIDTH
  },
  card: {
		backgroundColor: '#FFFFFF',
		flexDirection: 'row',
		//paddingRight: 5,
		overflow: 'hidden',
	},
	cardDetails: {
		paddingLeft: 10,
		flex: 1
	},
	cardImage: {
		height: 80,
		width: 80,
    resizeMode: 'cover'
	},
	cardTitle: {
		color: '#605E5F',
		fontSize: 15,
		fontWeight: '600',
		paddingTop: 10,
    paddingRight: 5
	},
  cityTitle: {
		color: '#AEB1C0',
		fontSize: 14,
		fontWeight: '600',
		paddingTop: 10,
    paddingRight: 5
	},
	cardGenre: {
		alignSelf: 'flex-end'
	},
	cardNumbers: {
		flexDirection: 'row',
		marginTop: 10,
    paddingRight: 5
	},
	cardStar: {
    flex: 1,
		flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
	},
	cardStarRatings: {
    color: '#AEB1C0',
    fontSize: 13,
	},
  storeTxt:{
    color: '#FFFFFF',
    backgroundColor: '#81C5D3',
    alignSelf: 'flex-start',
    padding: 3,
    fontSize: 12,
  },
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 16,
    borderTopWidth: 21,
    borderLeftColor: 'transparent',
    borderTopColor: '#81C5D3',
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
  numbers_text: {
    color: '#AEB1C0',
    fontSize: 10,
    marginLeft: 3,
    paddingTop: 2
	},

});
