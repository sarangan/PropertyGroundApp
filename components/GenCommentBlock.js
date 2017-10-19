/**
 * Sanppar React Native App
 * https://sph.com.sg
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
  TouchableHighlight
} from 'react-native';

var SCREENWIDTH = Dimensions.get('window').width;
var SCREENHEIGHT = Dimensions.get('window').height;

export default class GenCommentBlock extends Component {


  constructor(props){
    super(props);
    this.state = {
      height: 0
    }
  }

  componentDidMount(){

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


  render() {

    return (
      <View style={styles.rowWrapper}>
        <View  style={styles.listContainer} >
          <View>
            <Text style={styles.title}>{this.props.item.item_name}</Text>

            {this.props.item.type == 'ITEM' &&
              <TouchableHighlight  underlayColor="transparent" onPress={()=>this.props.handleOpenFilterModal(this.props.item)}>
                <View style={styles.dropdownWrapper}>
                  <Text style={styles.optionTxt}>{this.props.item.user_input?this.props.item.user_input: 'Please select'}</Text>
                  <Image source={require('../images/dropdown.png')} style={styles.dropdown_img}/>
                </View>
              </TouchableHighlight>
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
    padding: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 12,
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
  },
  modalWrapper:{
    flex: 1,
    flexDirection: 'row',
    width: SCREENWIDTH,
    backgroundColor: '#FCFCFD',
    padding: 0,
    margin: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  txtInput:{
    height: 80,
    // paddingLeft: 10,
    // paddingRight: 10,
    backgroundColor: '#F6F6F8',
    width: SCREENWIDTH - 20,
    //marginTop: 10,
    fontSize: 15,
    borderTopColor: '#F4F4F6',
    borderTopWidth: 1,
    marginTop: 10,
  },

});
