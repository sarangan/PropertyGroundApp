'use strict';
import { AsyncStorage } from 'react-native';

export default class Sync {

  constructor(property) {
    this.property = property;
  }

  syncCheck(){

      if(this.property.sync == 2){
        console.log('proeprty status sysncing found' , this.property.property_id);
        this.syncing();
      }

  }

  syncing(){
    //this is okay to sync check the tables

    // 1. check tabkes one by one
    // 2. upload to server
    // 3. upload PHOTOS
    // 4. everything okay means sent email LOCK 0 no lock / 1 sync / 2 synced and sent mail
    // 5. update property lastly with synced flag
    
  }


}
