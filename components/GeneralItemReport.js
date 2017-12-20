/**
 * PG React Native App
 * https://sph.com.sg
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
  Image,
  AsyncStorage,
  FlatList,
} from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

import helper from '../helper/helper';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;

import Simage from "./Simage";

const GRIDWIDTH = Dimensions.get('window').width / 5;
GRIDWIDTH = GRIDWIDTH - 7;

export default class GeneralItemReport extends Component{


  constructor(props){
    super(props);

    this.state = {
      property_id: this.props.property_id,
      photos: [],
      prop_sub_feedback_general_id: '',
      feedback: {},
      item_id: this.props.item_id,
      parent_id: this.props.parent_id,
      comment: '',
    };

  }


 componentWillUnmount() {

 }

  componentDidMount(){
    this.getDetails();
    this.getStorePhotos();

  }

  //get the meter feedback
  getDetails = () =>{

    if(this.state.property_id && this.state.item_id){


      AsyncStorage.getItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, (err, result) => {
        let property_sub_feedback_general = JSON.parse(result) || {};

        if(property_sub_feedback_general.hasOwnProperty(this.state.property_id) ){

          let feedbacks = property_sub_feedback_general[this.state.property_id];

          if(feedbacks.hasOwnProperty(this.state.item_id) ){ //same item id
              this.setState({
                prop_sub_feedback_general_id: feedbacks[this.state.item_id].prop_sub_feedback_general_id,
                feedback: feedbacks[this.state.item_id],
                comment: feedbacks[this.state.item_id].comment,
              });
          }


        }
        else{

          this.setState({

            feedback: {}
          });

        }


      });

    }

  }

  //get the whichever item details
  getStorePhotos = () =>{

    if(this.state.property_id && this.state.item_id){



      // get photos
      AsyncStorage.getItem(TableKeys.PHOTOS, (err, result) => {
        let photos = JSON.parse(result) || {};

        if(photos.hasOwnProperty(this.state.property_id) ){

          let property_photos = photos[this.state.property_id];

          if(property_photos.hasOwnProperty(this.state.parent_id) ){

            let master_photos = property_photos[this.state.parent_id];

            if(master_photos.hasOwnProperty(this.state.item_id) ){

              this.setState({
                photos: master_photos[this.state.item_id],
              });

            }
            else{
              this.setState({
                photos: []
              });
            }

          }
          else{
            this.setState({
              photos: []
            });
          }

        }
        else{
          this.setState({
            photos: []
          });
        }

      });



    }

  }

  openImage = (photo) =>{

    let index = 0;//this.state.photos.indexOf(photo);
    let photos = [];
    for(let i =0, l = this.state.photos.length; i < l; i++){
      photos.push(this.state.photos[i].img_url);
      if(this.state.photos[i].photo_id == photo.photo_id){
        index = i;
      }

    }

    this.props.navigator.showLightBox({
      screen: "PropertyGround.ImageLightBox",
        passProps: {
          imagePath: photo,
          images: JSON.stringify(photos),
          index: index,
          property_id: this.state.property_id,
          item_id : this.state.item_id,
          parent_id: this.state.parent_id,
          showDelete: false
        },
        style: {
         backgroundBlur: "dark",
          //backgroundColor: "#ff000080",
          backgroundColor: "#333333",
          tapBackgroundToDismiss: true
       }
    });

  }

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      null
    );
  };

  renderGridSeparator = () =>{

    return(
      null
    );
  }

  renderGridHeader = () => {
    return null;
  }

  handleRefresh = () => {
  };

  renderEmptyData = () =>{
    return(
      <View style={{ flex: 1, width: SCREENWIDTH,  alignContent:'center', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} >
        <Image style={{ width: 80, height: 80 }} source={require("../images/nodata.png")} />
      </View>
    );
  }

  _renderItem = ({item}) => (

    <TouchableHighlight style={{margin: 0, flex: 0}}  underlayColor='transparent' aspectRatio={1}  onPress={()=>this.openImage(item)} >
        <View style={styles.rowContainer}>
           <Simage
            source={item.img_url}
            style={styles.gridImg}
          >
          </Simage>
        </View>
     </TouchableHighlight>
  );

  getPhotos =() =>{
    let _keyExtractor = (item, index) => index;
    return(

            <View style={styles.camWrapper}>
              <FlatList
                contentContainerStyle={styles.listGrid}
                data={this.state.photos}
                keyExtractor={_keyExtractor}
                renderItem={this._renderItem}
                ItemSeparatorComponent={this.renderGridSeparator}
                ListFooterComponent={this.renderFooter}
                ListHeaderComponent={this.renderGridHeader}
                extraData={this.state}
                horizontal={false}
                ListEmptyComponent={this.renderEmptyData}
                numColumns={5}
              />

            </View>
          );
  }


  render(){

    return(
      <View style={styles.fill}>
        <View>
          <Text style={styles.subTitle}>Comment</Text>
          <Text style={styles.subCommentText}>{this.state.comment}</Text>
        </View>
        <View  style={{  height: 1, flex: 1, backgroundColor: '#E6E7E7', marginTop: 5, marginBottom: 5}} />

        {this.getPhotos()}


      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
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
  listGrid: {
   justifyContent: 'flex-start',
   flexDirection: 'column',
   alignContent: 'flex-start',
   alignSelf: 'flex-start',
  },
  rowContainer: {
     justifyContent: 'center',
     alignItems: 'center',
     padding: 3,
     backgroundColor: '#FFFFFF',
     marginRight: 5,
  },
  gridImg: {
    width: GRIDWIDTH-10,
    height: GRIDWIDTH-10,
    resizeMode: 'cover',
  },


});
