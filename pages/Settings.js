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
  Button,
  Dimensions,
  TouchableHighlight,
  Image,
  ScrollView,
  Switch,
  AsyncStorage
} from 'react-native';

import helper from '../helper/helper';
import AppKeys from '../keys/appKeys';

import FilterPicker from "../components/FilterPicker";

const SCREENWIDTH = Dimensions.get('window').width;
const SCREENHEIGHT = Dimensions.get('window').height;


export default class Settings extends Component{


  constructor(props){
    super(props);

    this.state = {
      qualites : [ "HIGH", "MEDIUM", "LOW"],
      use_data : false,
      open_modal: false,
      default_quality: 'LOW',
      quality: 'LOW',
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

    AsyncStorage.getItem( AppKeys.CAMERA_SETTINGS, (err, result) => {
      console.log(result);

      result  = JSON.parse(result);

      if(result !=null){
        this.setState({
          quality: result,
          default_quality: result,
        });
      }

    });

  }

  componentWillUnmount () {

    AsyncStorage.setItem(AppKeys.CAMERA_SETTINGS, JSON.stringify( this.state.quality.toUpperCase() ), () => {
    });

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

  //close tag modal
  closeReportTypeModal = () =>{

    this.setState({ open_modal: false }, ()=>{

    });
  }

  //cancel tag modal
  cancelReportTypeModal = () =>{

    this.setState({
      open_modal: false,
      quality: '',
      default_quality: 'LOW'
    });

  }

  //change spinner
  changeReportType = (item, index) =>{

    console.log(item);
    if(item){
      this.setState({
          default_quality: item,
          quality: item
      });
    }

  }


  render(){
    return(
      <View style={styles.fill}>

      <Text style={styles.divTxt}>General</Text>

      <View style={{flex: 0, flexDirection: 'row', justifyContent: 'flex-start', textAlign: 'left'}}>
          <Button
                onPress={()=>this.fetchOnlineSettings()}
                title="Fetch Online Perferences"
                color="#005792"
          />
      </View>

      <Text style={styles.divTxt}>Network Settings</Text>

      <View style={styles.switchWrappar}>
        <Text>Use mobile data</Text>
        <Switch
          onValueChange={(value) => this.handleSwitchChange(value)}
          value={this.state.use_data} />
      </View>


        <Text style={styles.divTxt}>{"Camera Quality - " + this.state.quality }</Text>

        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'flex-start', textAlign: 'left'}}>
            <Button
                  onPress={()=> {this.setState({ open_modal: true }); } }
                  title={"Change quality"}
                  color="#005792"
            />
        </View>


        { this.state.open_modal &&
          <View style={styles.modalWrapper}>
            <FilterPicker
              closeModal={this.closeReportTypeModal}
              cancelModal={this.cancelReportTypeModal}
              changeValue={this.changeReportType}
              current_value={this.state.quality}
              data ={this.state.qualites}
            />
          </View>
        }



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

});
