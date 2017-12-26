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
        console.log('proeprty status syncing found' , this.property_id);
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

    //this.syncPropertyInfo();
    this.getAllData();
  }


  getAllData(){

    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {

        stores.map((result, i, store) => {
          //get at each store's key/value so you can work with it
          let key = store[i][0];
          let value = store[i][1];

          switch (key) {

            case TableKeys.PROPERTY_INFO: {

              // console.log(value);
              // console.log('===========');

              /*let formData = new FormData();
              formData.append("data", value);
              formData.append("table", TableKeys.PROPERTY_INFO);

              let response = this.postData(formData);

              if(response.hasOwnProperty('status') && response.status == 1 ){ // 1 and 0
                // we got status 1, update the storage
                this.update_property_info(JSON.parse(value) );
              }*/

              break;
            }

            case TableKeys.PROPERTY_MASTERITEM_LINK: {

              // console.log(value);
              // console.log('===========');

              /*
              let data = JSON.parse(value);

              if(data.hasOwnProperty(this.property_id)){

                let master_data = data[this.property_id];

                for(let i =0, l = master_data.length; i < l ; i++){
                  if(master_data[i].sync == 1){

                    let formData = new FormData();
                    formData.append("data", JSON.stringify(master_data[i]) );
                    formData.append("table", TableKeys.PROPERTY_MASTERITEM_LINK);

                    let response = this.postData(formData);

                    if(response.hasOwnProperty('status') && response.status == 1 ){ // 1 and 0
                       // we got status 1, update the storage
                       this.update_master_item_link( master_data[i], master_data );
                       this.get_property_subitem_link(stores, master_data[i].prop_master_id);
                    }



                  }

                }

              }
              */

              break;
            }

            case TableKeys.PROPERTY_GENERAL_CONDITION_LINK: {

              let data = JSON.parse(value);

              if(data.hasOwnProperty(this.property_id)){

                let general_data = data[this.property_id];

                for(let i =0, l = general_data.length; i < l ; i++){
                  if(general_data[i].sync == 1){

                    let formData = new FormData();
                    formData.append("data", JSON.stringify(general_data[i]) );
                    formData.append("table", TableKeys.PROPERTY_GENERAL_CONDITION_LINK);

                    //let response = this.postData(formData);

                    if(response.hasOwnProperty('status') && response.status == 1 ){ // 1 and 0
                       // we got status 1, update the storage
                       this.update_general_item_link( general_data[i], general_data );
                    }


                  }
                }


              }

              break;
            }

            case TableKeys.PROPERTY_METER_LINK:{

              let data = JSON.parse(value);

              if(data.hasOwnProperty(this.property_id)){

                let meter_data = data[this.property_id];


                for(let i =0, l = meter_data.length; i < l ; i++){
                  if(meter_data[i].sync == 1){

                    

                  }
                }


              }


              break;
            }



          }

        });

      });
    });

  }

  //update proeprty info
  update_property_info(properties){

    for(let i =0, l = properties.length; i < l ; i++){
      if(properties[i].property_id == this.property_id && properties[i].sync == 1){

        properties[i].sync = 2;
        console.log('update property_info');
        //console.log(properties[i]);

        AsyncStorage.setItem(TableKeys.PROPERTY_INFO, JSON.stringify(properties), () => {
          //saved proprty info
          console.log("saved PROPERTY_INFO");
        });

      }

    }

  }

  //update master details
  async update_master_item_link(master_data, total_master_data){

    for(let i =0, l = total_master_data.length; i < l ; i++){
      if(total_master_data[i].prop_master_id == master_data.prop_master_id && total_master_data[i].sync == 1){

        total_master_data[i].sync = 2;
        console.log('updated PROPERTY_MASTERITEM_LINK');
        //console.log(total_master_data[i]);

        await AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(total_master_data) );

      }

    }

  }


  //get sub items link
  get_property_subitem_link(stores, prop_master_id){

    stores.map((result, i, store) => {
      //get at each store's key/value so you can work with it
      let key = store[i][0];
      let value = store[i][1];

      if(key == TableKeys.PROPERTY_SUBITEM_LINK){

        let data = JSON.parse(value);

        if(data.hasOwnProperty(prop_master_id)){

          let sub_items = data[prop_master_id];
          this.update_property_subitem_link(sub_items);

        }


      }

    });

  }

  //update sub items details
  update_property_subitem_link(sub_items){

    for(let i =0, l = sub_items.length; i < l ; i++){
      if(sub_items[i].sync == 1){

        console.log('updated PROPERTY_SUBITEM_LINK');
        console.log(sub_items[i]);

        let formData = new FormData();
        formData.append("data", JSON.stringify(sub_items[i]) );
        formData.append("table", TableKeys.PROPERTY_SUBITEM_LINK);

        let response = this.postData(formData);

        if(response.hasOwnProperty('status') && response.status == 1 ){ // 1 and 0
          // we got status 1, update the storage
          console.log('updated PROPERTY_SUBITEM_LINK');
          this.update_storage_sub_items_link( sub_items[i], sub_items );
        }


      }

    }

  }

  //update sub items storage
  async update_storage_sub_items_link(sub_item, sub_items){

    for(let i =0, l = sub_items.length; i < l ; i++){
      if(sub_items[i].prop_subitem_id == sub_item.prop_subitem_id && sub_items[i].sync == 1){

        sub_items[i].sync = 2;
        console.log('updated storage PROPERTY_SUBITEM_LINK');

        await AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(sub_items) );

      }

    }

  }

  //update general item
  async update_general_item_link(general_data, total_general_data){

    for(let i =0, l = total_general_data.length; i < l ; i++){
      if(total_general_data[i].prop_general_id == general_data.prop_general_id && total_general_data[i].sync == 1){

        total_general_data[i].sync = 2;
        console.log('updated PROPERTY_GENERAL_CONDITION_LINK');
        //console.log(total_master_data[i]);

        await AsyncStorage.setItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, JSON.stringify(total_general_data) );

      }

    }

  }


  syncPropertyInfo(){

    AsyncStorage.getItem(TableKeys.PROPERTY_INFO, (err, result) => {
      console.log('get property details');
      let properties = JSON.parse(result) || [];

      for(let i =0, l = properties.length; i < l ; i++){
        if(properties[i].property_id == this.property_id && properties[i].sync == 1){
          console.log('found property info without sync');


          break;
        }
      }


    });

  }



  // this will wait for response from server
  async postData(formData){

    let response = await fetch(
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
        body: formData
    });

    let responseJson = await response.json();

    return responseJson;

  }


}
