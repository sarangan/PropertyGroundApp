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
import NumberControl from '../components/NumberControl';
import ParallaxScrollView from 'react-native-parallax-scroll-view';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;
const PARALLAX_HEADER_HEIGHT = 250;
const STICKY_HEADER_HEIGHT = 40;

export default class RoomList extends Component{

  static navigatorButtons = {
   rightButtons: [
     {
       title: 'Sort',
       id: 'sort'
     }
   ],
  //  leftButtons: [
  //    {
  //      title: 'Cancel',
  //      id: 'cancel'
  //    }
  //  ],

 };

  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      roomlist : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
      property: this.props.property,
      imgErr: false
    };

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if (event.id == 'sort') {

        this.callSortList();

      }

    }
  }

  componentDidMount(){
    if(this.state.property_id){
      this.getRoomlist();
    }
  }

  callSortList=()=>{
    this.props.navigator.push({
      screen: 'PropertyGround.SortRoomList',
      title: 'Sort room list',
      animated: true,
      //animationType: 'fade',
      backButtonTitle: "Back",
      passProps: {property_id: this.state.property_id}
    });
  }

  getRoomlist =()=>{

    this.setState({
      loading: true,
    });

    AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {


      let roomlist = JSON.parse(result) || {};

      if(roomlist.hasOwnProperty(this.state.property_id) ){
        roomlist = roomlist[this.state.property_id];
      }
      else{
        roomlist = [];
      }

      console.log('roomlist');
      console.log(roomlist);
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
         //flex: 1,
          height: 1,
          alignSelf: 'flex-end',
          // width: '80%',
          // marginRight: 10
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
         this.getProperties();

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
    if(item.option != 'SIG' || item.option != 'PROP' || item.option != 'GENERAL'){
        photo = '3 images';
    }
    else{
      photo = 'no images'
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

  openLink = (item) =>{

    if(item.type == "PROP"){

      this.props.navigator.push({
        screen: 'PropertyGround.EditPropertyInfo',
        title: 'Edit property',
        animated: true,
        animationType: 'fade',
        backButtonTitle: "Back",
        passProps: {
          property_id: this.state.property_id,
          property: this.state.property
        },
      });

    }
    else if(item.type == 'GENERAL'){

      this.props.navigator.push({
        screen: 'PropertyGround.GeneralCondition',
        title: 'General conditions',
        animated: true,
        animationType: 'fade',
        backButtonTitle: "Back",
        passProps: {
          property_id: this.state.property_id,
        },
      });

    }


  }

  _renderItem = ({item}) => (

    <TouchableHighlight underlayColor='transparent' aspectRatio={1} onPress={()=>this.openLink(item)}>

          <View style={styles.rowWrapper}>
            <View  style={styles.listContainer} >
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.imagePhotosWrapper}>
                <Text style={styles.photoTxt}>{this.getPhotoStatus(item)}</Text>
                <Image
                  source={require('../images/arrow_right.png')}
                  style = {styles.arrowRight}
                />
              </View>

            </View>

          </View>

    </TouchableHighlight>
  );

  //render actionBar
  renderActionBar = () =>{
    return(

        <View style={styles.actionBar}>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Sync</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/sync.png')} >
              </Image>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem}
             >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Lock</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/lock.png')} >
              </Image>
            </View>
          </TouchableHighlight>

          <TouchableHighlight  underlayColor="transparent" style={styles.actionBarItem} onPress={()=>this.callSortList()}
            >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={styles.actionBarTxt}>Sort</Text>
              <Image style={ styles.actionBarIcon } source={require('../images/sort.png')} >
              </Image>
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
    console.log(map_url);
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
            // backgroundColor="#e8e8e8"
             contentBackgroundColor="#e8e8e8"

            renderBackground={() => (

                <View key="background">

                  {this.state.property.image_url !== '' &&
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
