/**
 * PropertyGround React Native App
 * @sara
 * Settings page
 */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableHighlight,
  Image,
  ScrollView,
  Switch,
  AsyncStorage
} from 'react-native';

import helper from '../helper/helper';
import AppKeys from '../keys/appKeys';

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;


export default class Settings extends Component{


  constructor(props){
    super(props);

    this.state = {
      use_data : false
    };

  }

  componentDidMount(){

    AsyncStorage.getItem( AppKeys.NET_SETTINGS, (err, result) => {
      console.log(result);

      result  = JSON.parse(result);

      if(result !=null){
        this.setState({
          use_data: !!result
        });
      }

    });

  }

  componentWillUnmount () {

  }

  // handle switch
  handleSwitchChange = (val) =>{

    AsyncStorage.setItem(AppKeys.NET_SETTINGS, JSON.stringify(val), () => {
      this.setState({
        use_data: val
      })
    });

  }

  // sync setting with server
  fetchOnlineSettings = () =>{

    helper.syncTemplate();
  }

  render(){
    return(
      <View style={styles.fill}>

      <Text style={styles.divTxt}>General</Text>

      <Text style={{ padding: 10, backgroundColor: '#ffffff', }} onPress={()=>this.fetchOnlineSettings()}>Fetch Online Perferences</Text>

      <Text style={styles.divTxt}>Network Settings</Text>

      <View style={styles.switchWrappar}>
        <Text>Use mobile data</Text>
        <Switch
          onValueChange={(value) => this.handleSwitchChange(value)}
          value={this.state.use_data} />
      </View>



      </View>
    );
  }
}


const styles = StyleSheet.create({
  fill:{
    flex: 1,
    justifyContent: 'flex-start',
    //alignItems: 'center'
  },
  divTxt:{
    backgroundColor: "#F7F7F9",
    color: "#81C5D3",
    fontSize: 15,
    fontWeight: "600",
    //width: SCREENWIDTH,
    textAlign: "left",
    padding: 10,
  },
  divider:{
    marginLeft: 25,
    marginRight: 25,
    height: 1,
    backgroundColor: 'rgba(99,175,203,0.3)',
  },
  switchWrappar:{
    flex: 0,
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    padding: 10
  }

});
