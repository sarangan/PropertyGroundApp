/**
 * Sanppar React Native App
 * @sara
 * general comment box
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  LayoutAnimation,
  TextInput,
  Image,
  TouchableHighlight,
  Platform,
  Picker
} from 'react-native';

var SCREENWIDTH = Dimensions.get('window').width;
var SCREENHEIGHT = Dimensions.get('window').height;

export default class GenCommentBlock extends Component {


  constructor(props){
    super(props);
    this.state = {
      height: 0,
      platform: 'ios'
    }
  }

  convertToArrayData(data){

  let options = this.props.data.split(';');
  return options;
}

  componentDidMount(){

    this.setState({
      platform: Platform.OS
    });

  }



  openComment =()=>{
    if(this.state.height == 100){
      LayoutAnimation.easeInEaseOut();
      this.setState(
        {
          height: 0
        });
    }
    else{
      LayoutAnimation.spring();
      this.setState(
        {
          height: 100
        });
    }

  }

  changeValue = (itemValue, itemIndex, prop_general_id) =>{
    this.props.changeValue(itemValue, itemIndex);
    this.props.android_closeFilter(prop_general_id);
  }



  render() {

    return (
      <View style={styles.rowWrapper}>
        <View style={styles.listContainer} >
          <View style={styles.pickerTextWrapper}>
            <Text style={styles.title}>{this.props.item.item_name}</Text>

            {(this.props.item.type == 'ITEM' && this.state.platform == 'ios') &&
              <TouchableHighlight  underlayColor="transparent" onPress={()=>this.props.handleOpenFilterModal(this.props.item)}>
                <View style={styles.dropdownWrapper}>
                  <Text style={styles.optionTxt}>{this.props.item.user_input?this.props.item.user_input: 'Please select'}</Text>
                  <Image source={require('../images/dropdown.png')} style={styles.dropdown_img}/>
                </View>
              </TouchableHighlight>
            }


            {(this.props.item.type == 'ITEM' && this.state.platform == 'android') &&
              <View style={styles.pickerWrapper}>
                <Picker selectedValue = {this.props.item.user_input}
                  onValueChange={(itemValue, itemIndex) => this.changeValue(itemValue, itemIndex, this.props.item.prop_general_id) }

                  >
                    {this.convertToArrayData(this.props.data).map((item) => (
                      <Picker.Item
                        key={item}
                        value={item}
                        label={item}
                      />
                    ))}

                 </Picker>
               </View>
            }



          </View>



            {this.props.item.comment.trim().length == 0 &&
              <TouchableHighlight underlayColor="transparent" onPress={()=>this.openComment()}>
                <Image style={{width: 30, resizeMode: 'contain', height: 30 }} source={require('../images/no_comment.png')} />
              </TouchableHighlight>
            }
            {this.props.item.comment.trim().length > 0 &&
              <TouchableHighlight underlayColor="transparent" onPress={()=>this.openComment()}>
                <Image style={{width: 30, resizeMode: 'contain', height: 30 }} source={require('../images/got_comment.png')} />
              </TouchableHighlight>
            }

        </View>

          <View style={{
            overflow: 'hidden',
            marginTop: 5,
            marginBottom: 5,
            flex: 1, justifyContent: 'flex-start', alignItems: 'center', height: this.state.height }}>
            <TextInput
              style={styles.txtInput}
              onChangeText={(text) => this.props.handleAddComment(text, this.props.item) }
              placeholder="Enter your comment"
              placeholderTextColor="#A9ACBC"
              multiline = {true}
              numberOfLines = {4}
              value={this.props.item.comment}
              underlineColorAndroid='transparent'
            />
          </View>



      </View>

    );
  }
}

const styles = StyleSheet.create({
  rowWrapper:{
    flex:1,
    padding: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 12,
    //width: SCREENWIDTH,
    width: '100%',
    backgroundColor: '#FFFFFF'
  },
  listContainer:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title:{
    fontSize: 15,
    fontWeight: "600",
    color: "#475566",
    ...Platform.select({
      android: {
        flex: 1,
        alignItems: 'flex-start'
      },
    }),
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
    flex: 0,
    width: SCREENWIDTH - 85,
    //width: '50%',
    borderTopColor: '#F8F8FA',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginTop: 15,
    paddingTop: 5
  },
  modalWrapper:{
    flex: 1,
    flexDirection: 'row',
    //width: SCREENWIDTH,
    backgroundColor: '#FCFCFD',
    padding: 0,
    margin: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  txtInput:{
    height: 80,
    alignSelf: 'stretch',
    // paddingLeft: 10,
    // paddingRight: 10,
    backgroundColor: '#F6F6F8',
    //width: SCREENWIDTH - 20,
    //marginTop: 10,
    fontSize: 15,
    borderTopColor: '#F4F4F6',
    borderTopWidth: 1,
    marginTop: 10,
  },
  pickerWrapper:{
    flex: 1,
    width: SCREENWIDTH - 85,
    alignSelf: 'stretch',
  },
  pickerTextWrapper:{
    ...Platform.select({
      android: {
        width: SCREENWIDTH - 85,
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column'
      },
    }),
  }

});
