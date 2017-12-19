'use strict';
import { NetInfo } from 'react-native';
import Sync from './Sync';

let helper = {

  generateUid: function() {
      const uuidv4 = require('uuid/v4');
      return uuidv4();
  },
  synSrv: function(property){

    function handleFirstConnectivityChange(connectionInfo) {
      console.log('First change, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);

      if(connectionInfo.type.toLowerCase() ==  'wifi'){
        // okay to sync
        const sync = new Sync(property);
        sync.syncCheck();
      }

      NetInfo.removeEventListener(
        'connectionChange',
        handleFirstConnectivityChange
      );
    }

    NetInfo.addEventListener(
      'connectionChange',
      handleFirstConnectivityChange
    );

  },



}

module.exports = helper;
