/**
 * PG React Native App
 * @sara
 * Report page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  NativeModules,
  LayoutAnimation,
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
  Animated,
  Easing,
  Alert
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import NumberControl from '../components/NumberControl';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import Prompt from 'react-native-prompt';
import SyncImg from '../components/SyncImg';
import SingleReportItem from '../components/SingleReportItem';
import SubItemsReportList from '../components/SubItemsReportList';


const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;
const PARALLAX_HEADER_HEIGHT = 250;
const STICKY_HEADER_HEIGHT = 40;

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&  UIManager.setLayoutAnimationEnabledExperimental(true);

export default class Report extends Component{


  constructor(props){
    super(props);

    this.state = {
      roomlist : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
      property: this.props.property,
      imgErr: false,
      height: 0,
      meterlist: [],
      photos: [],
      singantes_list : ['Tenant', 'Lanlord', 'Clerk'],
      sig_height: 0,
      spinValue: new Animated.Value(0),
      meter_spinValue: new Animated.Value(0),
      sync_spinValue : new Animated.Value(0),
      promptVisibleCopy: false,
      conditionsList: [],
      locked: this.props.locked,
      sync: this.props.sync,
      signs: {}

    };


  }


  componentDidMount(){
    if(this.state.property_id){
      this.getData();
      this.getConditionsList();
    }

  }

  componentWillUnmount () {

  }


  getData = () =>{

    AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
      let photos = JSON.parse(result) || {};

      if(photos.hasOwnProperty(this.state.property_id) ){

        this.setState({
          photos: photos[this.state.property_id]
        }, ()=>{
          this.getRoomlist();
        });

      }
      else{

        this.getRoomlist();
      }

    });


  }

  getConditionsList =()=>{
    console.log('general condition link');


    AsyncStorage.getItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, (err, result) => {
      let property_general_condition_link = JSON.parse(result) || [];

        if(property_general_condition_link.hasOwnProperty(this.state.property_id) ){

          let gen_list = property_general_condition_link[this.state.property_id];
          gen_list.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} );

          this.setState({
            conditionsList: gen_list,
          });

        }

    });

  }

  openPromptCopy = () =>{

    this.setState({
      promptVisibleCopy: true
    });

  }

  //sync property
  doUnlock = () =>{

    Alert.alert(
    'Unlock property',
    'Are you sure do you want to ' +  (this.state.locked == 1? 'unlock' : 'lock') + ' this property?',
        [
          {text: 'No', onPress: () => console.log('Cancel Pressed') },
          {text: 'Yes', onPress: () => this.unLockProperty() },
        ],
        { cancelable: false }
      );
  }

  //set the sync flag
  unLockProperty = () =>{

    let sync = 1;
    if(this.state.sync == 2 ){
      sync = 1;
    }
    else if(this.state.sync == 1){
      sync = 2;
    }
    else if(this.state.sync == 3){
      sync = 3; // we cannot switch back to sync
      Alert.alert(
       'PropertyGround',
       'Failed to process this action!'
      );
      return 0;
    }

    AsyncStorage.getItem(TableKeys.PROPERTY, (err, result) => {
      console.log('get property details');
      let properties = JSON.parse(result) || [];

      for(let i =0, l = properties.length; i < l ; i++){

        if(properties[i].property_id == this.state.property_id ){

          let data_property = properties[i];
          data_property.sync =  sync; // 1 is is not yet sync  2 is sync start  3 is sync finished
          data_property.locked = this.state.locked == 1 ? 0 : 1 ; // 1 is locked  0 not locked

          properties[i] = data_property;

          this.setState({
            locked: (this.state.locked == 1 ? 0 : 1),
            sync
          });

          break;

        }
      }

      AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(properties), () => {
        //saved proprty
        console.log("saved property tbl");


      });


    });


  }

  //hard unlock the property
  hardUnlock = () =>{

    let sync = 1;


    AsyncStorage.getItem(TableKeys.PROPERTY, (err, result) => {
      console.log('get property details');
      let properties = JSON.parse(result) || [];

      for(let i =0, l = properties.length; i < l ; i++){

        if(properties[i].property_id == this.state.property_id ){

          let data_property = properties[i];
          data_property.sync =  sync; // 1 is is not yet sync  2 is sync start  3 is sync finished
          data_property.locked = 0 ; // 1 is locked  0 not locked

          properties[i] = data_property;

          this.setState({
            locked: 0,
            sync
          }, ()=>{
            this.getData();
            this.getConditionsList();
          });

          Alert.alert(
           'PropertyGround',
           'Property unlocked!'
          );

          break;

        }
      }

      AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(properties), () => {
        //saved proprty
        console.log("saved property tbl");

      });


    });

  }


  getRoomlist =()=>{

    this.setState({
      loading: true,
      roomlist: [],
      height: 0,
      meterlist: []
    }, ()=>{

      AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {


        let roomlist = JSON.parse(result) || {};

        if(roomlist.hasOwnProperty(this.state.property_id) ){
          roomlist = roomlist[this.state.property_id];
        }
        else{
          roomlist = [];
        }

        //console.log('roomlist');
        //console.log(roomlist);
        let filter_roomlist = [];

        for(let i = 0, l = roomlist.length; i < l; i++){
          let room = roomlist[i];

          if(room.option == "NUM" && room.type == 'DEFAULT'){ // number control TODO
            //skip default types
          }
          else{
            filter_roomlist.push(room);
          }

        }

        roomlist = filter_roomlist;

        roomlist = roomlist.filter(function(item){
          return (item.status == 1);
        });

         roomlist.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} );
         roomlist.push(
           {
             prop_master_id: '',
             property_id: this.state.property_id,
             com_master_id: '',
             type: 'SIG',
             com_type: '',
             option: '',
             self_prop_master_id: 0,
             name: 'Signatures',
             priority: 0,
             total_num: 0,
             status: 1,
             mb_createdAt: '',
             sync: 1
           }
          );

          roomlist.unshift(
           {
             prop_master_id: '',
             property_id: this.state.property_id,
             com_master_id: '',
             type: 'GENERAL',
             com_type: '',
             option: '',
             self_prop_master_id: 0,
             name: 'General conditions',
             priority: 0,
             total_num: 0,
             status: 1,
             mb_createdAt: '',
             sync: 1
           }
          );

          roomlist.unshift(
           {
             prop_master_id: '',
             property_id: this.state.property_id,
             com_master_id: '',
             type: 'PROP',
             com_type: '',
             option: '',
             self_prop_master_id: 0,
             name: 'Property info',
             priority: 0,
             total_num: 0,
             status: 1,
             mb_createdAt: '',
             sync: 1
           }
          );

        this.setState({
          roomlist: roomlist,
          loading: false,
          refreshing: false
        });

      });

      AsyncStorage.getItem(TableKeys.PROPERTY_METER_LINK, (err, result) => {
        let property_meter_link = JSON.parse(result) || {};
        let meterlist =  property_meter_link[this.state.property_id] || [];
        //console.log('meter list');
        //console.log(meterlist);
        this.setState({
          meterlist
        });
      });

    });

    this.getSignDetails();

  }

  //get the whichever item details
  getSignDetails = () =>{

    AsyncStorage.getItem(TableKeys.SIGNATURES, (err, result) => {
      let signatures = JSON.parse(result) || {};

      if(signatures.hasOwnProperty(this.state.property_id)){

        let signs = signatures[this.state.property_id];
        signs['tenant_url'] = signs['tenant_url'] || null;
        signs['lanlord_url'] = signs['lanlord_url'] || null;
        signs['clerk_url'] = signs['clerk_url'] || null;

        this.setState({
          signs
        })

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
     // <View
     //   style={{
     //      height: 1,
     //      alignSelf: 'flex-end',
     //   }}
     // />
     null
   );
 };

  renderHeader = () => {
    return null;
  }


  renderEmptyData = () =>{
    return(
      <View style={{ flex: 1, width: SCREENWIDTH,  alignContent:'center', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} >
        <Image style={{ width: 80, height: 80, marginTop: SCREENHEIGHT / 3 }} source={require('../images/nodata.png')} />
      </View>
    );
  }

  getPhotoStatus = (item) =>{
    let photo = '';
    //console.log(item);
    if(item.type == 'SIG' || item.type == 'PROP' || item.type == 'GENERAL'){
        photo = ' ';
    }
    else{
      if(this.state.photos.hasOwnProperty(item.prop_master_id) ){


        let master_photos = this.state.photos[item.prop_master_id];
        if(item.com_type ==  'ITEM'){
          if(master_photos.hasOwnProperty(item.prop_master_id)){

            let num_photos  = master_photos[item.prop_master_id].length;
            photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';

          }
          else{
            photo = 'no images';
          }
        }
        else{


          let num_photos = 0;
          for(let key in master_photos){
            num_photos  += master_photos[key].length;
          }

          photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';
        }


      }
      else{
        photo = 'no images';
      }

    }

    return photo;

  }

  getMeterPhotoStatus = (item, prop_master_id) =>{
    let photo = '';
    //console.log(item);
    if(this.state.photos.hasOwnProperty(prop_master_id) ){

      let master_photos = this.state.photos[prop_master_id];
      if(master_photos.hasOwnProperty(item.prop_meter_id)){


        let num_photos = master_photos[item.prop_meter_id].length;
        photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';
      }
      else{
        photo = 'no images';
      }
    }
    else{
      photo = 'no images';
    }

    return photo;

  }

  getAddress(address_1, address_2, city, postalcode ){
      address_1 = encodeURIComponent(address_1);
      address_2 = encodeURIComponent(address_2);
      city = encodeURIComponent(city);
      postalcode = encodeURIComponent(postalcode);
      let adds = "https://maps.googleapis.com/maps/api/staticmap?center=" +  address_1 + " " + postalcode +"&zoom=15&size=300x180&markers=size:mid%7C" + address_1 + " " + postalcode + "&key=AIzaSyAk86Lc4LhpzNywnlyjr0P1MecBjz8GQSk";
    return adds;
  }


  openMeter = (meter, room_item) =>{
    console.log(meter);
    this.props.navigator.push({
      screen: 'PropertyGround.MeterItem',
      title: meter.meter_name,
      animated: true,
      animationType: 'fade',
      backButtonTitle: "Back",
      passProps: {
        prop_meter_id: meter.prop_meter_id,
        meter: meter,
        property_id: this.state.property_id,
        prop_master_id: room_item.prop_master_id
      },
    });
  }

  //get sub meters
  getMeters  = (room_item) =>{
      return(
        <View style={{
          flex: 1,
          }}>
          {
            this.state.meterlist.map( (item, i) =>{
              return(

                      <View style={[styles.rowWrapper, { padding: 10}]} key={i+1}>

                          <View style={{justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#F2F4FB', marginBottom: 7}}>
                            <View style={{ borderLeftWidth: 3, borderLeftColor: '#72D36C' }}/>
                            <Text style={styles.meter_title}>{item.meter_name}</Text>
                          </View>

                          <SingleReportItem property_id={this.state.property_id} item_id={item.prop_meter_id} parent_id={room_item.prop_master_id} type={'METER'} reading_value={item.reading_value} navigator={this.props.navigator} />

                      </View>

                    )
            })
          }
        </View>
      );
  }

  getSigns  = (room_item) =>{

      //console.log('tanel url');
      //console.log(this.state.signs['tenant_url']);

      return(

        <View style={{ flex: 1 }}>

          <View style={[styles.rowWrapper, { padding: 10}]} >

              <View style={{justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#F2F4FB', marginBottom: 7}}>
                <View style={{ borderLeftWidth: 3, borderLeftColor: '#72D36C' }}/>
                <Text style={styles.meter_title}>Tenant</Text>
              </View>

              {this.state.signs['tenant_url'] &&
                <Image style={{width: 200, height: 100 , resizeMode: 'contain'}} source={{uri: this.state.signs['tenant_url']}} />
              }

          </View>

          <View style={[styles.rowWrapper, { padding: 10}]} >

              <View style={{justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#F2F4FB', marginBottom: 7}}>
                <View style={{ borderLeftWidth: 3, borderLeftColor: '#72D36C' }}/>
                <Text style={styles.meter_title}>Lanlord</Text>
              </View>

              {this.state.signs['lanlord_url'] &&
                <Image style={{width: 200, height: 100 , resizeMode: 'contain'}} source={{uri: this.state.signs['lanlord_url'] }}/>
              }

          </View>

          <View style={[styles.rowWrapper, { padding: 10}]} >

              <View style={{justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#F2F4FB', marginBottom: 7}}>
                <View style={{ borderLeftWidth: 3, borderLeftColor: '#72D36C' }}/>
                <Text style={styles.meter_title}>Clerk</Text>
              </View>

              {this.state.signs['clerk_url'] &&
                <Image style={{width: 200, height: 100 , resizeMode: 'contain'}} source={{uri: this.state.signs['clerk_url'] }}/>
              }

          </View>


        </View>

      );
  }


  _renderItem = ({item}) => (

    <TouchableHighlight underlayColor='transparent' aspectRatio={1} >

          <View style={styles.rowWrapper}>
            <View  style={styles.listContainer}>
              <View style={{justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#F2F4FB',}}>
                <View style={{ borderLeftWidth: 5, borderLeftColor: '#43dde6' }}/>
                <Text style={styles.title}>{item.name}</Text>
              </View>
              <View style={styles.imagePhotosWrapper}>
                <Text style={styles.photoTxt}>{this.getPhotoStatus(item)}</Text>
              </View>

            </View>

            <View style={styles.contentWrapper}>


            {item.type == 'SIG' &&
              this.getSigns(item)
            }

            {item.type == 'PROP' &&
              <View>
                  <Text style={styles.subTitle}>Address</Text>
                  <Text style={styles.subText}>{this.state.property.address_1 + ' ' +  this.state.property.address_2 }</Text>
                  <Text style={styles.subText}>{this.state.property.city}</Text>
                  <Text style={styles.subText}>{this.state.property.postalcode}</Text>

                  <View
                    style={{  height: 1, flex: 1, backgroundColor: '#E6E7E7', marginTop: 5, marginBottom: 5}}
                  />

                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start',  }}>

                      <View style={{  flex: 0, flexDirection: 'column' }}>
                        <Text style={styles.subTitle}>Date</Text>
                        <Text style={styles.subText}>{this.state.property.mb_createdAt}</Text>
                      </View>

                      <View style={{  flex: 0, flexDirection: 'column', marginLeft: 120 }}>
                        <Text style={styles.subTitle}>Report Type</Text>
                        <Text style={styles.subText}>{this.state.property.report_type}</Text>
                      </View>

                  </View>

              </View>
            }

            {item.type == 'GENERAL' &&

                this.state.conditionsList.map( (item, index) =>{
                  return(
                    <View>
                      <Text style={styles.subTitle}>{item.item_name}</Text>
                      <Text style={styles.subText}>{item.user_input}</Text>
                      <Text style={styles.subCommentText}>{item.comment}</Text>
                      <View  style={{  height: 1, flex: 1, backgroundColor: '#E6E7E7', marginTop: 5, marginBottom: 5}} />
                    </View>
                  )
                })

            }

            {item.com_type == 'ITEM' &&
              <SingleReportItem property_id={this.state.property_id} item_id={item.prop_master_id} parent_id={item.prop_master_id} type={'ITEM'} navigator={this.props.navigator}/>
            }

            {item.com_type == 'SUB' &&
                <SubItemsReportList property_id={this.state.property_id} master_id={item.prop_master_id} prop_master_name={item.name} navigator={this.props.navigator}/>
            }

            {item.com_type == 'METER' &&
              this.getMeters(item)
            }

            </View>

          </View>

    </TouchableHighlight>

  );

  //render actionBar
  renderActionBar = () =>{

    const spin = this.state.sync_spinValue.interpolate({
       inputRange: [0, 1],
       outputRange: ['0deg', '360deg']
     })

    return(

        <View style={styles.actionBar}>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>{this.props.syncText}</Text>
              <SyncImg sync={this.props.sync}/>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem} onPress={()=>this.doUnlock()}
            onLongPress={()=>this.hardUnlock()}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>{(this.state.locked == 1 ? 'Unlock' : 'Lock')}</Text>
              {this.state.locked == 1 &&
                <Image style={ styles.actionBarIcon } source={require('../images/lock.png')} />
              }

              {this.state.locked == 0 &&
                <Image style={ styles.actionBarIcon } source={require('../images/unlock.png')} />
              }


            </View>
          </TouchableHighlight>

      </View>

      );

  };


  renderList(){


    let _keyExtractor = (item, index) => index;
    return(
      <FlatList
        contentContainerStyle={styles.list}
        data={this.state.roomlist}
        keyExtractor={_keyExtractor}
        renderItem={this._renderItem}
        ListFooterComponent={this.renderFooter}
        ItemSeparatorComponent={this.renderSeparator}
        extraData={this.state}
        ListEmptyComponent={this.renderEmptyData}
      />
    );
  }

  getHeaderImg =()=>{
    let map_url = this.getAddress(this.state.property.address_1 , this.state.property.address_2, this.state.property.city, this.state.property.postalcode);
    //console.log(map_url);
    let img =
    <Image source={{uri: map_url,
                  width: SCREENWIDTH,
                height: PARALLAX_HEADER_HEIGHT}}
                onError= { ()=> this.setState({ imgErr: true}) }
    />;
    return img;

  }

  render(){
     const { onScroll = () => {} } = this.props;

    return(
      <View style={styles.fill}>

        <ParallaxScrollView

            headerBackgroundColor="#F9F9F9"
            backgroundColor="#F9F9F9"
            stickyHeaderHeight={ STICKY_HEADER_HEIGHT }
            parallaxHeaderHeight={ PARALLAX_HEADER_HEIGHT }
            backgroundSpeed={10}
            contentBackgroundColor="#F9F9F9"

            renderBackground={() => (

                <View key="background">

                  {this.state.property.image_url != '' &&
                    <Image source={{uri: this.state.property.image_url,
                                  width: SCREENWIDTH,
                                height: PARALLAX_HEADER_HEIGHT}}
                                
                    />
                  }

                  {this.state.imgErr == false && this.state.property.image_url == '' &&
                    this.getHeaderImg()
                  }

                  {this.state.imgErr == true && this.state.property.image_url == '' &&
                    <Image
                      source={require('../images/property.png')}
                      style = {{ width: SCREENWIDTH,
                        height: PARALLAX_HEADER_HEIGHT }}
                    />
                  }

                  <View style={{position: 'absolute',
                            top: 0,
                            width: SCREENWIDTH,
                            backgroundColor: 'rgba(0,0,0,.1)',
                            height: PARALLAX_HEADER_HEIGHT}}/>

                </View>


            )}

            renderForeground={() => (
              <View key="parallax-header" style={ styles.parallaxHeader }>
                <Text style={{width: SCREENWIDTH, position: 'absolute', padding: 10, left: '0%', bottom: '16%', fontWeight: '700', fontSize: 13, color:"#e1e1e1", backgroundColor: 'rgba(129, 197, 211, 0.4)'}}>
                  {this.state.property.address_1}
                </Text>
                {this.renderActionBar()}

              </View>
            )}

            renderStickyHeader={() => (
              <View key="sticky-header" style={styles.stickySection}>

                {this.renderActionBar()}

              </View>
            )}

            >
            <View style={{ alignItems: 'flex-start', flex: 1 }}>


              {this.renderList()}


            </View>
        </ParallaxScrollView>


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
  list: {
    flex: 1,
    //justifyContent: 'center',
    flexDirection: 'column',
    //width: SCREENWIDTH
  },
  rowWrapper:{
    // padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    //width: SCREENWIDTH,
    backgroundColor: '#FFFFFF'
  },
  contentWrapper:{
    padding: 10,
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
    color: '#364f6b',
    paddingLeft: 5,
    paddingTop: 7,
    paddingBottom: 7,
    marginTop: 5,
    marginBottom: 5,
    width: '100%'
  },
  subtitle:{
    fontSize: 14,
    fontWeight: "600",
    color: "#747478"
  },
  photoTxt:{
    fontSize: 13,
    fontWeight: "700",
    color: "#D9D9D9"
  },
  parallaxHeader: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  stickySection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    //paddingTop: 10
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

  actionBar:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: SCREENWIDTH,
    height: 40,
    backgroundColor: '#F9F9F9',
    paddingLeft: 20,
    paddingRight: 20,

  },
  actionBarItem:{
    // width: 30,
    // height: 30
    alignContent: 'center',
    padding: 5
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
    color: '#333333',
    fontWeight: '600',
    marginRight: 5
  },
  subTitle:{
    color: '#ACBDC5',
    fontSize: 13,
    marginTop: 5,
    marginBottom: 5,
  },
  subText:{
    color: '#3B4C5D',
    fontSize: 14,
  },
  subCommentText:{
    color: '#a1a1a1',
    fontSize: 14,
  },
  meter_title:{
    fontSize: 14,
    fontWeight: "700",
    color: '#364f6b',
    paddingLeft: 5,
    paddingTop: 2,
    paddingBottom: 2,
    marginTop: 5,
    marginBottom: 5,
  },

});
