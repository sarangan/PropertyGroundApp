'use strict';
import { NetInfo, AsyncStorage } from 'react-native';
import Sync from './Sync';
import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';

let helper = {

  generateUid: function() {
      const uuidv4 = require('uuid/v4');
      return uuidv4();
  },
  synSrv: function(property){

    function handleFirstConnectivityChange(connectionInfo) {
      console.log('First change, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);

      AsyncStorage.getItem( AppKeys.NET_SETTINGS, (err, result) => {
        console.log(result);

        let use_data = !!JSON.parse(result) || false;

        console.log('use data !!!', use_data);

        if(connectionInfo.type.toLowerCase() ==  'wifi' || use_data === true){
          // okay to sync
          const sync = new Sync(property);
          sync.syncCheck();
        }

        NetInfo.removeEventListener(
          'connectionChange',
          handleFirstConnectivityChange
        );


      });

    }

    NetInfo.addEventListener(
      'connectionChange',
      handleFirstConnectivityChange
    );

  },
  syncTemplate: function(token){

    if(typeof token == 'undefined'){
      token = auth.AUTHTOKEN;
    }

    console.log( token );

    fetch(
        config.ENDPOINT_URL + 'company/getTemplate',
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
      console.log("getting comapny template");
      console.log(responseJson);

      if( responseJson.hasOwnProperty("status") && responseJson.status == 1 ){
        // AsyncStorage.setItem(AppKeys.LOGINKEY, JSON.stringify(pgauth), () => {
        //   console.log('login token stored');
        // });

        if(responseJson.hasOwnProperty("data")){

          let data = responseJson.data;

          if(data.hasOwnProperty("master")){
            //we go master data
            AsyncStorage.setItem(TableKeys.COMPANY_MASTERITEM_LINK, JSON.stringify(data.master), () => {
              console.log('master table stored');
            });
          }

          if(data.hasOwnProperty("sub")){
            //we go sub data
            AsyncStorage.setItem(TableKeys.COMPANY_SUBITEM_LINK, JSON.stringify(data.sub), () => {
              console.log('sub table stored');
            });
          }

          if(data.hasOwnProperty("meter")){
            //we go meter data
            AsyncStorage.setItem(TableKeys.COMPANY_METER_LINK, JSON.stringify(data.meter), () => {
              console.log('meter table stored');
            });
          }

          if(data.hasOwnProperty("general")){
            //we go general data
            AsyncStorage.setItem(TableKeys.COMPANY_GENERAL_CONDITION_LINK, JSON.stringify(data.general), () => {
              console.log('general table stored');
            });
          }


        }

      }

    })
    .catch((error) => {
      console.error(error);
    });


  }



}

module.exports = helper;
