/**
 * PG React Native App
 * @sara
 * sub items list page
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
  Alert
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';
import SingleReportItem from './SingleReportItem';
import GeneralItemReport from './GeneralItemReport';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

export default class SubItemsReportList extends Component{


  constructor(props){
    super(props);

    this.state = {
      subitems : [],
      loading: false,
      refreshing: false,
      property_id: this.props.property_id,
      prop_master_id: this.props.master_id,
      prop_master_name: this.props.prop_master_name,
      photos: []
    };

    this.property_subitem_feedback = {};

  }



  componentDidMount(){

    if(this.state.property_id){
      this.getData();
    }

  }

  componentWillUnmount() {

  }


  getData = () =>{

    AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
      let photos = JSON.parse(result) || {};

      if(photos.hasOwnProperty(this.state.property_id) ){

         if(photos[this.state.property_id].hasOwnProperty(this.state.prop_master_id) ){

           this.setState({
             photos: photos[this.state.property_id][this.state.prop_master_id]
           }, ()=>{
             this.getSubItemsList();
           });

         }
         else{
             this.getSubItemsList();
         }


      }
      else{

        this.getSubItemsList();
      }

    });


  }


  getSubItemsList = () =>{
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



  getPhotoStatus = (item) =>{
    let photo = '';
    //console.log(item);
    if(this.state.photos.hasOwnProperty(item.prop_subitem_id)){

      let num_photos  = this.state.photos[item.prop_subitem_id].length;
      photo =  num_photos > 0 ? (num_photos == 1? num_photos + " image" : num_photos + " images") : 'no images';

    }
    else{
      photo = 'no images';
    }

    return photo;

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
          height: 5,
          alignSelf: 'flex-end',
          width: '100%',
          //backgroundColor: '#80D46E'
          // marginBottom: 1,
          // marginTop: 1,
       }}
     />
   );
 };

  renderHeader = () => {
    return null;
  }


  renderEmptyData = () =>{
    return(
      <View style={{ flex: 1, width: SCREENWIDTH,  alignContent:'center', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} >
        <Image style={{ width: 80, height: 80}} source={require('../images/nodata.png')} />
      </View>
    );
  }


  _renderItem = ({item}) => (

          <View style={styles.rowWrapper}>

              <View style={{justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#F2F4FB', marginBottom: 7}}>
                <View style={{ borderLeftWidth: 3, borderLeftColor: '#72D36C' }}/>
                <Text style={styles.title}>{item.item_name}</Text>
              </View>

              {item.type == 'GENERAL' &&

                <GeneralItemReport property_id={this.state.property_id} item_id={item.prop_subitem_id} parent_id={this.state.prop_master_id} navigator={this.props.navigator} />

              }

                {item.type == 'ITEM' &&
                  <SingleReportItem property_id={this.state.property_id} item_id={item.prop_subitem_id} parent_id={this.state.prop_master_id} type={'SUB'} navigator={this.props.navigator} />
                }

          </View>
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
        />


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
    backgroundColor: '#F9F9F9',
    paddingBottom: 40
  },
  list: {
    justifyContent: 'center',
    flexDirection: 'column',
    //width: SCREENWIDTH
  },
  rowWrapper:{
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    //width: SCREENWIDTH,
    backgroundColor: '#FFFFFF'
  },
  title:{
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
