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

var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class AddRoomList extends Component{

  static navigatorButtons = {
   rightButtons: [
     {
       title: 'Save',
       id: 'save'
     }
   ],
   leftButtons: [
     {
       title: 'Cancel',
       id: 'cancel'
     }
   ],

 };

  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      roomlist : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
      master_items: []
    };

    this.property_subitem_link = {};

  }

  //navigator button actions
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {

      if (event.id == 'save') {

        this.hanldeSave();

      }
      else if(event.id == 'cancel'){

        this.props.navigator.dismissModal({
          animationType: 'slide-down'
        });

      }

    }
  }

  componentDidMount(){
    MessageBarManager.registerMessageBar(this.refs.alert);

    if(this.state.property_id){
      this.getRoomlist();
    }
  }

  componentWillUnmount () {
    // Remove the alert located on this master page from te manager
    MessageBarManager.unregisterMessageBar();
  }

  //save data
  hanldeSave=()=>{

    let roomlist = this.state.roomlist;

    //console.log(roomlist);
    console.log('----------------------');

    for(let i = 0, l = roomlist.length; i < l; i++){
      let room = roomlist[i];

      if(room.option == "NUM" && room.total_num > 0 && room.type == 'DEFAULT'){ // number control

        for(let k =0, j = this.state.master_items.length; k < j;  k++){

          if(room.com_master_id == this.state.master_items[k].com_master_id){ // same company id

            for(let n =0; n < room.total_num; n++){ // loop through number of rooms
              let prop_master_id = helper.generateUid();
              let new_room = {
                prop_master_id: prop_master_id,
                property_id: this.state.property_id,
                com_master_id: this.state.master_items[k].com_master_id,
                type: 'SELF',
                com_type: this.state.master_items[k].type,
                option: this.state.master_items[k].option,
                self_prop_master_id: room.prop_master_id,
                name: this.state.master_items[k].item_name + ' ' +  (n+1).toString(),
                priority: this.state.master_items[k].priority,
                total_num: 0,
                status: 1,
                mb_createdAt: new Date().toLocaleDateString(),
                sync: 1
              };

              this.addSubitem(prop_master_id, this.state.master_items[k], room.prop_master_id );

              roomlist.push(new_room);

            } // end of number room loop

          } // if com and room same

        } // loop of master items

      } // this is num  end
      else if(room.option == "OPT"){ // options

        // its already saved to list man
        //console.log(room.status);
      }

    }//loop end room list


    AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, result) => {

      let prop_master_items = JSON.parse(result) || {};

      prop_master_items[this.state.property_id] = roomlist;

      // saved to store
      AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(prop_master_items), () => {
        console.log('property master table stored');
        //console.log(roomlist);
        //console.log(prop_master_items);

        AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(this.property_subitem_link), () => {
          console.log('property sub table stored');

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
            onHide: ()=>{

              // this.props.navigator.push({
              //   screen: 'PropertyGround.Inspections',
              //   title: 'Inspections',
              //   animated: true,
              //   animationType: 'fade',
              //   backButtonTitle: "Back",
              //   backButtonHidden: true,
              //   passProps: {
              //   },
              // });
              // this.props.navigator.pop({
              //   animated: true, // does the pop have transition animation or does it happen immediately (optional)
              //   //animationType: 'slide-horizontal'
              // });

              this.props.navigator.dismissModal({
                animationType: 'slide-down'
              });

            }

          });


        });





      });




    });



  }


  addSubitem =(prop_master_id, company_masteritem_link, master_id) =>{
    //-------------------sub item settings--------------------


        let subitems = this.property_subitem_link[master_id] || [];

        console.log('adding sub items');
        console.log(subitems);


        let property_subitem_link_list = [];
        for(let i =0, l = subitems.length; i < l; i++){

            let data_property_subitem_link = {
              prop_subitem_id: helper.generateUid(),
              property_id: this.state.property_id,
              prop_master_id: prop_master_id,
              com_subitem_id: subitems[i].com_subitem_id,
              com_master_id:  subitems[i].com_master_id,
              item_name: subitems[i].item_name,
              type: subitems[i].type,
              priority: subitems[i].priority,
              status: 1,
              mb_createdAt: new Date().toLocaleDateString(),
              sync: 1
            };
            property_subitem_link_list.push(data_property_subitem_link);
        }

        // now we same to our property sub item list
          this.property_subitem_link[prop_master_id] = property_subitem_link_list;

        // AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
        //   let property_subitem_link = JSON.parse(result) || {};
        //
        //   property_subitem_link[prop_master_id] = property_subitem_link_list;
        //   console.log('property sub table stored');
        //   //console.log(property_subitem_link_list);
        //
        //   console.log(prop_master_id);
        //
        //   AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(property_subitem_link), () => {
        //     console.log('-------------------------');
        //     console.log(property_subitem_link[prop_master_id]);
        //     console.log('property sub ----------------- stored');
        //
        //   });// prop sub item saving end
        //
        // });

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

      let optList = [];
      let numList = [];

      for(let i = 0, l = roomlist.length; i < l ; i++){
        let room = roomlist[i];

        if(room.option == 'OPT'){
          optList.push(room);
        }

        if(room.option == 'NUM'){
          numList.push(room);
        }

      }

       optList.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} );
       numList.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} );

       roomlist = numList.concat(optList);

      this.setState({
        roomlist: roomlist,
        loading: false,
        refreshing: false
      });

    });

    AsyncStorage.getItem(TableKeys.COMPANY_MASTERITEM_LINK, (err, result) => {

      let master_items = JSON.parse(result) || [];

      this.setState({
        master_items
      });

    });

    AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, result) => {
      this.property_subitem_link = JSON.parse(result) || {};
    });


  }

  handleNumberChange = (num, item) =>{

    let roomlist = this.state.roomlist;

    for(let i = 0, l = roomlist.length; i < l ; i++){
      let room = roomlist[i];

      if(room.prop_master_id ==  item.prop_master_id && room.option ==  'NUM'){
        //ww have same master id
        room.total_num = num;
        break;
      }

    }

    this.setState({
      roomlist
    });

  }

  handleSwitchChange = (value, item) =>{

    let roomlist = this.state.roomlist;

    for(let i = 0, l = roomlist.length; i < l ; i++){

      if(roomlist[i].prop_master_id ==  item.prop_master_id){
        //ww have same master id
        roomlist[i].status = value? 1 : 0;
        //console.log('saved man');
        break;
      }

    }

    this.setState({
      roomlist
    });

    //console.log(roomlist);

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
          height: 3,
          alignSelf: 'flex-end',
          width: '100%',
          marginBottom: 1,
          marginTop: 1,
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

  _renderItem = ({item}) => (

    <TouchableHighlight underlayColor='transparent' aspectRatio={1} >

          <View style={styles.rowWrapper}>
            <View  style={styles.listContainer} >
              <Text style={styles.title}>{item.name}</Text>
              {item.option == 'NUM' &&
                <NumberControl handleChange={this.handleNumberChange} item={item}/>
              }
              {item.option == 'OPT' &&

                <Switch
                  onValueChange={(value) => this.handleSwitchChange(value, item)}
                  value={item.status? true: false} />

              }
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
          data={this.state.roomlist}
          keyExtractor={_keyExtractor}
          renderItem={this._renderItem}
          ListFooterComponent={this.renderFooter}
          ItemSeparatorComponent={this.renderSeparator}
          extraData={this.state}
          //ListHeaderComponent={this.renderHeader}
          //onEndReached={this.handleLoadMore}
          //onEndReachedThreshold={0.5}
          //refreshing={this.state.refreshing}
          //onRefresh={this.handleRefresh}
          ListEmptyComponent={this.renderEmptyData}
          //horizontal={false}
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
    padding: 20,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#475566"
  }

});
