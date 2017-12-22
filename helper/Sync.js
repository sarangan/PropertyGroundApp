'use strict';
import { AsyncStorage } from 'react-native';

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

export default class Sync {

  constructor(property) {
    this.property = property;
    this.property_id = property.property_id;
  }

  syncCheck(){

      if(this.property.sync == 2){
        console.log('proeprty status sysncing found' , this.property_id);
        this.syncing();
      }

  }

  syncing(){
    //this is okay to sync check the tables

    // 1. check tables one by one
    // 2. upload to server
    // 3. upload PHOTOS
    // 4. everything okay means sent email LOCK 0 no lock / 1 sync / 2 synced and sent mail
    // 5. update property lastly with synced flag

    this.syncPropertyInfo();
  }

  syncPropertyInfo(){

    AsyncStorage.getItem(TableKeys.PROPERTY_INFO, (err, result) => {
      console.log('get property details');
      let properties = JSON.parse(result) || [];

      for(let i =0, l = properties.length; i < l ; i++){
        if(properties[i].property_id == this.property_id && properties[i].sync == 1){
          console.log('found property');

          break;
        }
      }


    });

  }

  ajaxPropertyInfo(){

    fetch(
        config.ENDPOINT_URL + 'property/sync',
        {
        method: 'POST',
        headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'multipart/form-data',
                  'Origin': '',
                  'Host': 'propertyground.co.uk',
                  'timeout': 10 * 60,
                  'Authorization': token
        },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log("ajax property info update");
      console.log(responseJson);
    });


  }


}
