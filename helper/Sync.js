'use strict';
import { AsyncStorage } from 'react-native';
import * as SyncActions from "../actions/SyncActions";

import TableKeys from '../keys/tableKeys';
import AppKeys from '../keys/appKeys';
import config from '../keys/config';
import auth from '../keys/auth';
var RNFS = require('react-native-fs');

export default class Sync {

  constructor(property) {
    this.property = property;
    this.property_id = property.property_id;
  }

  syncCheck(){

      if(this.property.sync == 2 ){
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
    //this.getTotalNumbers();

    console.log('-----------starting sync--------------');
    //this.getAllData();

    this.getAllData();

  }

  getAllData(){

    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {

        let formData = new FormData();
        formData.append("property_id", this.property_id );
        formData.append("data", JSON.stringify(stores) );

        this.postData(formData, 'syncdata').then( response =>{

          //console.log('junk json uploaded');

       });


       stores.map((result, i, store) => {
         //get at each store's key/value so you can work with it
         let key = store[i][0];
         let value = store[i][1];

         switch (key) {

           case TableKeys.PROPERTY_INFO: { //>

             //console.log('Starting PROPERTY_INFO');

              let properties = JSON.parse(value);
              //console.log(properties);

              for(let i =0, l = properties.length; i < l ; i++){

                if(properties[i].property_id == this.property_id && properties[i].sync == 1){

                  //console.log(properties[i]);

                  let image_url = properties[i].image_url;

                  let dummy_properties = {...properties[i]};

                  delete dummy_properties.image_url; // not to update the server image url

                  let formData = new FormData();
                  formData.append("data", JSON.stringify(dummy_properties) );
                  formData.append("table", TableKeys.PROPERTY_INFO);

                  this.postData(formData).then( response =>{

                    //console.log('Ending PROPERTY_INFO');

                    if(response.hasOwnProperty('status') && response.status == 1 ){ // 1 and 0

                      // we got status 1, update the storage
                      this.update_property_info( i, properties );

                      if(image_url){
                        let formDataUpload = new FormData();
                        formDataUpload.append("property_id", this.property_id );
                        formDataUpload.append('photo', {uri: RNFS.DocumentDirectoryPath + '/' + image_url , type: 'image/jpg', name: 'image.jpg'});

                        let response = this.postData(formDataUpload, 'uploadpropertyimg');

                      }

                    }


                  });



                }

              }


             break;
           }


           case TableKeys.PROPERTY_SUB_VOICE_GENERAL : {//>

             //console.log('Starting PROPERTY_SUB_VOICE_GENERAL');

             let data = JSON.parse(value);
             if(data.hasOwnProperty(this.property_id)){

               let property_voice = data[this.property_id];

               for(let master_key in property_voice){
                 if(property_voice.hasOwnProperty(master_key)){

                   let master_item_voice =  property_voice[master_key];



                   for(let sub_key in master_item_voice){
                     if(master_item_voice.hasOwnProperty(sub_key) ){

                       let sub_item_voice =  master_item_voice[sub_key];



                       for(let i =0, l = sub_item_voice.length; i < l; i++){
                         if(sub_item_voice[i].sync == 1){

                           //console.log(sub_item_voice[i]);

                           let formData = new FormData();
                           formData.append("property_id", this.property_id );
                           formData.append("prop_sub_feedback_general_id", sub_item_voice[i].prop_sub_feedback_general_id );
                           formData.append("item_id", sub_item_voice[i].item_id );
                           formData.append("parent_id", sub_item_voice[i].parent_id );
                           formData.append("voice_name", sub_item_voice[i].voice_name );
                           formData.append("mb_createdAt", sub_item_voice[i].mb_createdAt);
                           formData.append('voice', {uri: RNFS.DocumentDirectoryPath + '/' + sub_item_voice[i].file_name , type: 'video/mp4', name: 'voice.mp4'});


                           this.postData(formData, 'uploadvoice').then( response =>{

                             //console.log('Ending PROPERTY_SUB_VOICE_GENERAL');

                             if(response.hasOwnProperty('status') && response.status == 1 ){ // 1 and 0
                                // we got status 1, update the storage
                                this.update_voice_item_link( i, sub_key, master_key, data );

                             }

                           });



                         }

                       }

                     }
                   }

                 }
               }

             }



             break;
           }

           case TableKeys.SIGNATURES : {//>

             //console.log('Starting SIGNATURES');

             let data = JSON.parse(value);

             if(data.hasOwnProperty(this.property_id)){

               let signs = data[this.property_id];

               if(signs.sync == 1){

                 let formData = new FormData();
                 formData.append("data", JSON.stringify(signs));
                 formData.append("table", TableKeys.SIGNATURES);

                 this.postData(formData).then( response =>{

                   //console.log('Ending SIGNATURES');

                   if(response.hasOwnProperty('status') && response.status == 1 ){ // 1 and 0
                      // we got status 1, update the storage
                      this.update_signs( data );
                    }

                 });


               }

             }


             break;
           }



         }// switch end


       });


       stores.map((result, i, store) => {
         //get at each store's key/value so you can work with it
         let key = store[i][0];
         let value = store[i][1];

         if(key == TableKeys.PHOTOS ){

           //console.log('Starting PHOTOS');

           let data = JSON.parse(value);

           if(data.hasOwnProperty(this.property_id)){

             let property_photos = data[this.property_id];

             for(let master_key in property_photos){
               if(property_photos.hasOwnProperty(master_key)){

                 let master_item_photos =  property_photos[master_key];

                 for(let sub_key in master_item_photos){
                   if(master_item_photos.hasOwnProperty(sub_key) ){

                     let sub_item_photos =  master_item_photos[sub_key];

                     //console.log(sub_item_photos);

                     for(let i =0, l = sub_item_photos.length; i < l; i++){
                       if(sub_item_photos[i].sync == 1){

                         let formData = new FormData();
                         formData.append("property_id", this.property_id );
                         formData.append("photo_id", sub_item_photos[i].photo_id );
                         formData.append("item_id", sub_item_photos[i].item_id );
                         formData.append("parent_id", sub_item_photos[i].parent_id );
                         formData.append("type", sub_item_photos[i].type );
                         formData.append("mb_createdAt", sub_item_photos[i].mb_createdAt );
                         formData.append('photo', {uri: RNFS.DocumentDirectoryPath + '/' + sub_item_photos[i].img_url , type: 'image/jpg', name: 'image.jpg'});


                         this.postData(formData, 'uploadfile').then( response =>{

                           //console.log('Ending PHOTOS');

                           console.log('uploaded server PHOTOS');

                           if( response.hasOwnProperty('status') && (response.status == 1 || response.status == 400) ){ // 1 and 0
                             // we got status 1, update the storage
                             this.update_photos( i, sub_key, master_key, data );
                          }

                        });



                       }
                     }

                   }
                 }
               }
             }

           }


         }

       });




        this.checkPropertySync(stores);

      });
    });

  }



  static getTotalItems(property_id){

    //console.log('get total numbers');

    let total_data = 0;

    return new Promise( function(resolve,reject){

      AsyncStorage.getAllKeys((err, keys) => {
        AsyncStorage.multiGet(keys, (err, stores) => {

          let allSynced = true;

          stores.map((result, i, store) => {
            //get at each store's key/value so you can work with it
            let key = store[i][0];
            let value = store[i][1];

            switch (key) {

              case TableKeys.PHOTOS : {

                let data = JSON.parse(value);

                if(data.hasOwnProperty(property_id)){

                  let property_photos = data[property_id];

                  for(let master_key in property_photos){
                    if(property_photos.hasOwnProperty(master_key)){

                      let master_item_photos =  property_photos[master_key];

                      for(let sub_key in master_item_photos){
                        if(master_item_photos.hasOwnProperty(sub_key) ){

                          let sub_item_photos =  master_item_photos[sub_key];

                          for(let i =0, l = sub_item_photos.length; i < l; i++){
                              total_data += 1;
                          }

                        }
                      }
                    }
                  }
                }
                break;
              }


            }//end switch


          }); //end of map

          //check here

          console.log('TOTAL NUMERS ', total_data);

          //SyncActions.totalDataCount(this.property_id, total_data);

          resolve(total_data);

        });

      });

    });// promise

  }

  static getNonUpdatedNumbers(property_id, property){


    let total_data = 0;

    return new Promise( function(resolve,reject){

      AsyncStorage.getAllKeys((err, keys) => {
        AsyncStorage.multiGet(keys, (err, stores) => {

          let allSynced = true;

          stores.map((result, i, store) => {
            //get at each store's key/value so you can work with it
            let key = store[i][0];
            let value = store[i][1];

            switch (key) {


              case TableKeys.PHOTOS : {

                let data = JSON.parse(value);

                if(data.hasOwnProperty(property_id)){

                  let property_photos = data[property_id];

                  for(let master_key in property_photos){
                    if(property_photos.hasOwnProperty(master_key)){

                      let master_item_photos =  property_photos[master_key];

                      for(let sub_key in master_item_photos){
                        if(master_item_photos.hasOwnProperty(sub_key) ){

                          let sub_item_photos =  master_item_photos[sub_key];

                          for(let i =0, l = sub_item_photos.length; i < l; i++){
                            if(sub_item_photos[i].sync == 1){
                              //console.log(sub_item_photos[i]);
                              //console.log('count PHOTOS FAIL');
                              total_data += 1;
                            }
                          }

                        }
                      }
                    }
                  }
                }
                break;
              }


            }//end switch

          }); //end of map

          //check here

          console.log('Non UPDATED NUMERS ', total_data);

          const syn = new Sync(property);
          syn.checkPropertySync(stores);

          resolve(total_data);


        });

      });

    });

  }


  //check last when all the tables have been updated
  checkPropertySync(stores){

    console.log('finishing property sync');

    stores.map((result, i, store) => {
      //get at each store's key/value so you can work with it
      let key = store[i][0];
      let value = store[i][1];

      if(key == TableKeys.PROPERTY){

        let properties = JSON.parse(value);

        for(let i =0, l = properties.length; i < l ; i++){
          /*
          if(properties[i].property_id == this.property_id && properties[i].sync == 2){

            let formData = new FormData();
            formData.append("property_id", this.property_id);
            formData.append("description", properties[i].description);
            formData.append("mb_createdAt", properties[i].mb_createdAt);

            this.postData(formData, 'finishSync').then( response =>{

              // properties[i].sync = 3;
              // AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(properties), ()=>{
              //   SyncActions.syncFinished(this.property_id);
              // });

            });

          }
          */

          if(properties[i].property_id == this.property_id){

            this.recheckTbls(i, properties);
          }


        }


        //this.finishedSync( i, properties); //TODO


      }

    });

  }

  //finish the sync process for this property
  async finishedSync(index, properties){

    properties[index].sync = 3;
    //console.log('update PROPERTY');
  //  console.log('Sync finished PROPERTY');
    //console.log(properties[index]);

    await AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(properties) ); //TODO

    //console.log('calling UI actions');

    //update the front end
    SyncActions.syncFinished(this.property_id); //TODO

  }

  recheckSeverTables(){


    let formData = new FormData();
    formData.append("property_id", this.property_id );

      this.postData(formData, 'checksyncdata').then( (response) =>{

        if(response.hasOwnProperty('status') && response.status == 1 ){

          console.log("checking servfer tables!");


          let data = response.data;
          //console.log(data);

          for(let key in data){

            if (data.hasOwnProperty(key)) {

              switch (key) {

                case 'property_masteritem_link': {

                  let master_server_data = data[key];
                  if(master_server_data && Array.isArray(master_server_data) ){


                     AsyncStorage.getItem(TableKeys.PROPERTY_MASTERITEM_LINK, (err, prop_master_items) =>{

                       prop_master_items = JSON.parse(prop_master_items) || {};

                       if(prop_master_items.hasOwnProperty(this.property_id) ){
                         let master_items = prop_master_items[this.property_id] || [];

                         for(let i = 0 , l = master_server_data.length; i < l ; i++ ){

                           for(let j = 0 , ll = master_items.length; j < ll ; j++ ){

                             if(master_server_data[i].prop_master_id == master_items[j].prop_master_id && master_items[j].sync == 1){

                               master_items[j].sync = 2;

                             }

                           }

                         }

                         AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(prop_master_items), () => {
                           //console.log('PROPERTY_MASTERITEM_LINK updated');
                         });



                       }


                     });



                  }

                  break;
                } // end case of prop master item link

                case 'property_subitem_link': {

                  let subitem_server_data = data[key];
                  if(subitem_server_data && Array.isArray(subitem_server_data) ){

                   AsyncStorage.getItem(TableKeys.PROPERTY_SUBITEM_LINK, (err, property_subitem_link) =>{

                     property_subitem_link = JSON.parse(property_subitem_link) || {};

                     for(let master_item_key in property_subitem_link){

                       if(property_subitem_link.hasOwnProperty(master_item_key)){

                         let sub_items_temp = property_subitem_link[master_item_key] || [];

                         for(let i=0, l = sub_items_temp.length; i < l; i++){

                           if( sub_items_temp[i].property_id == this.property_id){

                             let sub_items_server_data = data[key];
                             if(sub_items_server_data && Array.isArray(sub_items_server_data) ){

                               for(let j = 0 , ll = sub_items_server_data.length; j < ll ; j++ ){

                                 if(sub_items_server_data[j].prop_subitem_id == sub_items_temp[i].prop_subitem_id && sub_items_temp[i].sync == 1){

                                   sub_items_temp[i].sync = 2;

                                 }

                               }

                             }

                           }
                           else{
                             break;
                           }

                         }

                       }

                     }

                     AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(property_subitem_link), ()=>{
                       //console.log('PROPERTY_SUBITEM_LINK updated');
                     });


                   });






                  }

                } // end of sub item case

                case 'property_general_condition_link': {

                  let server_prop_general_condition = data[key];
                  if(server_prop_general_condition && Array.isArray(server_prop_general_condition) ){


                    AsyncStorage.getItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, (err, property_general_condition_link) =>{

                      property_general_condition_link = JSON.parse(property_general_condition_link) || {};

                      if(property_general_condition_link.hasOwnProperty(this.property_id) ){

                        let gen_list = property_general_condition_link[this.property_id];

                        for(let i = 0 , l = server_prop_general_condition.length; i < l ; i++ ){

                          for(let j=0, ll = gen_list.length; j < ll ; j++){

                            if(server_prop_general_condition[i].prop_general_id == gen_list[j].prop_general_id && gen_list[j].sync == 1){

                              gen_list[j].sync = 2;

                            }


                          }

                        }

                        AsyncStorage.setItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, JSON.stringify(property_general_condition_link), ()=>{
                           //console.log('PROPERTY_GENERAL_CONDITION_LINK updated');
                        } );



                      }

                    });




                  }

                  break;
                } //end of prop general condition link

                case 'property_meter_link': {


                  let server_prop_meter_link = data[key];
                  if(server_prop_meter_link && Array.isArray(server_prop_meter_link) ){


                    AsyncStorage.getItem(TableKeys.PROPERTY_METER_LINK, (err, property_meter_link) =>{

                      property_meter_link = JSON.parse(property_meter_link) || {};

                      if(property_meter_link.hasOwnProperty(this.property_id) ){

                        let meterlist = property_meter_link[this.property_id] || [];

                        for(let i = 0 , l = server_prop_meter_link.length; i < l ; i++ ){

                          for(let j=0, ll = meterlist.length; j < ll ; j++){

                            if(server_prop_meter_link[i].prop_meter_id == meterlist[j].prop_meter_id && meterlist[j].sync == 1){

                              meterlist[j].sync = 2;

                            }


                          }

                        }

                        AsyncStorage.setItem(TableKeys.PROPERTY_METER_LINK, JSON.stringify(property_meter_link), ()=>{
                          //console.log('PROPERTY_METER_LINK updated');
                        } );


                      }


                    });




                  }

                  break;

                } // end of prop meter link

                case 'property_feedback': {

                  let server_prop_feedback = data[key];
                  if(server_prop_feedback && Array.isArray(server_prop_feedback) ){


                    AsyncStorage.getItem(TableKeys.PROPERTY_FEEDBACK, (err, property_subitem_feedback) =>{

                      property_subitem_feedback = JSON.parse(property_subitem_feedback) || {};

                      if (property_subitem_feedback.hasOwnProperty(this.property_id) ){
                        let feedbacks =  property_subitem_feedback[this.property_id] || {};


                        for(let i = 0, l = server_prop_feedback.length; i < l ; i++ ){

                          //for(let j=0, ll = feedbacks.length; j < ll ; j++){
                          for(let feedback_key in feedbacks){
                            if( feedbacks.hasOwnProperty(feedback_key) ){

                              let feedback = feedbacks[feedback_key];

                              if(server_prop_feedback[i].prop_feedback_id == feedback.prop_feedback_id && feedback.sync == 1){

                                feedback.sync = 2;

                              }


                            }


                          }

                        }

                        AsyncStorage.setItem(TableKeys.PROPERTY_FEEDBACK, JSON.stringify(property_subitem_feedback), ()=>{
                          //console.log('PROPERTY_FEEDBACK updated');
                        } );


                      }

                    });




                  }

                  break;

                } // end of prop feedback

                case 'property_sub_feedback_general': {

                  let server_prop_feedback_general = data[key];
                  if(server_prop_feedback_general && Array.isArray(server_prop_feedback_general) ){


                    AsyncStorage.getItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, (err, property_sub_feedback_general) =>{

                      property_sub_feedback_general = JSON.parse(property_sub_feedback_general) || {};

                      if(property_sub_feedback_general.hasOwnProperty(this.property_id) ){

                        let feedbacks_general = property_sub_feedback_general[this.property_id] || {};

                        for(let i = 0, l = server_prop_feedback_general.length; i < l ; i++ ){

                          for(let feedback_general_key in feedbacks_general){

                              if( feedbacks_general.hasOwnProperty(feedback_general_key) ){

                                let feedback_general_item = feedbacks_general[feedback_general_key];

                                if(server_prop_feedback_general[i].prop_sub_feedback_general_id == feedback_general_item.prop_sub_feedback_general_id && feedback_general_item.sync == 1){
                                  feedback_general_item.sync = 2;
                                }

                              }

                          }


                        }

                        AsyncStorage.setItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, JSON.stringify(property_sub_feedback_general), ()=>{
                          //console.log('PROPERTY_SUB_FEEDBACK_GENERAL updated');
                        } );


                      }

                    });




                  }
                  break;

                }





              }// end of switch case



            }

          }


        }

    });


  }

  //re check all the tables
  recheckTbls(__index, __properties){

    this.recheckSeverTables();

    console.log('Re-check tables again');

    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {

        let allSynced = true;

        stores.map((result, i, store) => {
          //get at each store's key/value so you can work with it
          let key = store[i][0];
          let value = store[i][1];

          switch (key) {


            case TableKeys.PROPERTY_INFO: {

              let properties = JSON.parse(value);
              for(let i =0, l = properties.length; i < l ; i++){
                if(properties[i].property_id == this.property_id && properties[i].sync == 1){
                  //console.log('re-check PROPERTY_INFO FAIL');
                  allSynced = false;
                }
              }
              break;
            }

            case TableKeys.PROPERTY_MASTERITEM_LINK: {

              let data = JSON.parse(value);
              if(data.hasOwnProperty(this.property_id)){
                let master_data = data[this.property_id];
                for(let i = 0, l = master_data.length; i < l ; i++){
                  //console.log(master_data[i].sync);
                  if(master_data[i].sync == 1){
                    //console.log('re-check PROPERTY_MASTERITEM_LINK FAIL');
                    allSynced = false;
                    break;
                  }
                }
              }
              break;
            }

            case TableKeys.PROPERTY_SUBITEM_LINK:{

              let data = JSON.parse(value);

              mainloop: for( let key in data){

                let sub_items = data[key];

                for(let i =0, l = sub_items.length; i < l ; i++){

                  if(sub_items[i].property_id == this.property_id ){ // we got this prop sub item
                    //console.log(sub_item_details[i]);
                      if(sub_items[i].sync == 1){
                        //console.log('re-check PROPERTY_SUBITEM_LINK FAIL');
                        allSynced = false;
                        break mainloop;
                      }
                  }

                }

              }

              break;
            }

            case TableKeys.PROPERTY_GENERAL_CONDITION_LINK: {

              let data = JSON.parse(value);
              if(data.hasOwnProperty(this.property_id)){
                let general_data = data[this.property_id];
                for(let i =0, l = general_data.length; i < l ; i++){
                  if(general_data[i].sync == 1){
                    //console.log('re-check PROPERTY_GENERAL_CONDITION_LINK FAIL');
                    allSynced = false;
                    break;
                  }
                }
              }
              break;
            }

            case TableKeys.PROPERTY_METER_LINK:{

              let data = JSON.parse(value);

              if(data.hasOwnProperty(this.property_id)){

                let meter_data = data[this.property_id];
                for(let i =0, l = meter_data.length; i < l; i++){
                  if(meter_data[i].sync == 1){
                    //console.log('re-check PROPERTY_METER_LINK FAIL');
                    allSynced = false;
                    break;
                  }
                }

              }
              break;
            }

            case TableKeys.PROPERTY_FEEDBACK: {

              let data = JSON.parse(value);
              if(data.hasOwnProperty(this.property_id)){

                let feedback_data = data[this.property_id];

                for(let key in feedback_data){
                    if(feedback_data.hasOwnProperty(key)) {
                        if(feedback_data[key].sync == 1){
                          //console.log('feedback id ', feedback_data[key]);
                          //console.log('re-check PROPERTY_FEEDBACK FAIL');
                          allSynced = false;
                          break;
                        }
                    }
                }
              }
              break;
            }

            case TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL : {

              let data = JSON.parse(value);
              if(data.hasOwnProperty(this.property_id)){

                let feedback_data = data[this.property_id];

                for(let key in feedback_data){
                    if(feedback_data.hasOwnProperty(key)) {

                      if(feedback_data[key].sync == 1){
                        //console.log('re-check PROPERTY_SUB_FEEDBACK_GENERAL FAIL');
                        allSynced = false;
                        break;
                      }

                    }
                }

              }
              break;
            }

            case TableKeys.PROPERTY_SUB_VOICE_GENERAL : {

              let data = JSON.parse(value);
              if(data.hasOwnProperty(this.property_id)){

                let property_voice = data[this.property_id];

                for(let master_key in property_voice){
                  if(property_voice.hasOwnProperty(master_key)){

                    let master_item_voice =  property_voice[master_key];

                    for(let sub_key in master_item_voice){
                      if(master_item_voice.hasOwnProperty(sub_key) ){

                        let sub_item_voice =  master_item_voice[sub_key];

                        for(let i =0, l = sub_item_voice.length; i < l; i++){
                          if(sub_item_voice[i].sync == 1){
                            //console.log('re-check PROPERTY_SUB_VOICE_GENERAL FAIL');
                            allSynced = false;
                            break;
                          }
                        }
                      }
                    }
                  }
                }
              }
              break;
            }

            case TableKeys.SIGNATURES : {

              let data = JSON.parse(value);

              if(data.hasOwnProperty(this.property_id)){

                let signs = data[this.property_id];

                if(signs.sync == 1){
                  //console.log('re-check SIGNATURES FAIL');
                  allSynced = false;
                }

              }

              break;
            }

            case TableKeys.PHOTOS : {

              let data = JSON.parse(value);

              if(data.hasOwnProperty(this.property_id)){

                let property_photos = data[this.property_id];

                for(let master_key in property_photos){
                  if(property_photos.hasOwnProperty(master_key)){

                    let master_item_photos =  property_photos[master_key];

                    for(let sub_key in master_item_photos){
                      if(master_item_photos.hasOwnProperty(sub_key) ){

                        let sub_item_photos =  master_item_photos[sub_key];

                        for(let i =0, l = sub_item_photos.length; i < l; i++){
                          if(sub_item_photos[i].sync == 1){
                            //console.log(sub_item_photos[i]);
                            //console.log('re-check PHOTOS FAIL');
                            allSynced = false;
                            break;
                          }
                        }

                      }
                    }
                  }
                }
              }
              break;
            }


          }//end switch

        }); //end of map

        //check here

        console.log('I AM GOING TO FINSIH THIS MAN');
        console.log(allSynced);

        if(allSynced){

          //console.log('calling UI actions');
          //update the front end

          if(__properties[__index].sync == 2){

            if(__properties[__index].property_id == this.property_id && __properties[__index].sync == 2){

              let formData = new FormData();
              formData.append("property_id", this.property_id);
              formData.append("description", __properties[__index].description);
              formData.append("mb_createdAt", __properties[__index].mb_createdAt);

              this.postData(formData, 'finishSync').then( response =>{

                if( response.hasOwnProperty('status') && (response.status == 1 || response.status == 400) ){ // 1 and 0

                  __properties[__index].sync = 3;
                  AsyncStorage.setItem(TableKeys.PROPERTY, JSON.stringify(__properties), ()=>{
                    SyncActions.syncFinished(this.property_id);
                  });

                }

              });


            }


          }
          else if(__properties[__index].sync == 3){
            SyncActions.syncFinished(this.property_id);
          }

        }


      });

    });

  }


  //update proeprty info
  async update_property_info(index, properties){

    properties[index].sync = 2;
    //console.log('update PROPERTY_INFO');
    //console.log(properties[index]);

    await AsyncStorage.setItem(TableKeys.PROPERTY_INFO, JSON.stringify(properties) );

  }

  //update master details
  async update_master_item_link(master_data, data){

    let total_master_data = data[this.property_id];

    for(let i =0, l = total_master_data.length; i < l ; i++){
      if(total_master_data[i].prop_master_id == master_data.prop_master_id && total_master_data[i].sync == 1){

        total_master_data[i].sync = 2;
        //console.log('updated PROPERTY_MASTERITEM_LINK');
        //console.log(total_master_data[i]);

        await AsyncStorage.setItem(TableKeys.PROPERTY_MASTERITEM_LINK, JSON.stringify(data) );

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

          this.update_property_subitem_link(data, prop_master_id);

        }

      }

    });

  }

  //update sub items details
  update_property_subitem_link(data, prop_master_id){

    let sub_items = data[prop_master_id];

    for(let i =0, l = sub_items.length; i < l ; i++){
      if(sub_items[i].sync == 1){

        //console.log('going to update PROPERTY_SUBITEM_LINK');
        //console.log(sub_items[i]);

        let formData = new FormData();
        formData.append("data", JSON.stringify(sub_items[i]) );
        formData.append("table", TableKeys.PROPERTY_SUBITEM_LINK);

        this.postData(formData).then( response =>{

          if(response.hasOwnProperty('status') && response.status == 1 ){ // 1 and 0
            // we got status 1, update the storage
            //console.log('updated PROPERTY_SUBITEM_LINK');
            this.update_storage_sub_items_link( sub_items[i], data, prop_master_id );
          }

        });


      }

    }

  }

  //update sub items storage
  async update_storage_sub_items_link(sub_item, data, prop_master_id){

    let sub_items = data[prop_master_id];

    //console.log(sub_items);

    for(let i =0, l = sub_items.length; i < l ; i++){
      if(sub_items[i].prop_subitem_id == sub_item.prop_subitem_id && sub_items[i].sync == 1){

        sub_items[i].sync = 2;
        //console.log('updated storage PROPERTY_SUBITEM_LINK');
        //console.log(sub_items[i]);

        await AsyncStorage.setItem(TableKeys.PROPERTY_SUBITEM_LINK, JSON.stringify(data) );

      }

    }

  }

  //update general item
  async update_general_item_link(general_data, data){

    let total_general_data = data[this.property_id];

    for(let i =0, l = total_general_data.length; i < l ; i++){
      if(total_general_data[i].prop_general_id == general_data.prop_general_id && total_general_data[i].sync == 1){

        total_general_data[i].sync = 2;
        //console.log('updated PROPERTY_GENERAL_CONDITION_LINK');
        //console.log(total_master_data[i]);

        await AsyncStorage.setItem(TableKeys.PROPERTY_GENERAL_CONDITION_LINK, JSON.stringify(data) );

      }

    }

  }


  //update meter details
  async update_meter_item_link(meter_data, data){

    let total_meter_data = data[this.property_id];

    for(let i =0, l = total_meter_data.length; i < l ; i++){
      if(total_meter_data[i].prop_meter_id == meter_data.prop_meter_id && total_meter_data[i].sync == 1){

        total_meter_data[i].sync = 2;
        //console.log('updated PROPERTY_METER_LINK');
        //console.log(data);

        await AsyncStorage.setItem(TableKeys.PROPERTY_METER_LINK, JSON.stringify(data) );

      }

    }

  }


  //update feedback details
  async update_feedback_item_link(key, data){

    let feedback_data = data[this.property_id];
    feedback_data[key].sync = 2;
    //console.log('updated PROPERTY_FEEDBACK');
    //console.log(data);

    await AsyncStorage.setItem(TableKeys.PROPERTY_FEEDBACK, JSON.stringify(data) );

  }


  //update feedback genral item details
  async update_sub_feedback_general_link(key, data){

    let feedback_data = data[this.property_id];
    feedback_data[key].sync = 2;
    //console.log('updated PROPERTY_SUB_FEEDBACK_GENERAL');
    //console.log(data);

    await AsyncStorage.setItem(TableKeys.PROPERTY_SUB_FEEDBACK_GENERAL, JSON.stringify(data) );

  }

  //update voice item details
  async update_voice_item_link( index, sub_key, master_key, data ){

    let property_voice = data[this.property_id];
    let master_item_voice =  property_voice[master_key];
    let sub_item_voice =  master_item_voice[sub_key];

    sub_item_voice[index].sync = 2;

    //console.log('updated PROPERTY_SUB_VOICE_GENERAL');
    //console.log(sub_item_voice[index]);

    await AsyncStorage.setItem(TableKeys.PROPERTY_SUB_VOICE_GENERAL, JSON.stringify(data) );

  }

  //update signs details
  async update_signs(data){

    let sign = data[this.property_id];
    sign.sync = 2;

    //console.log('updated SIGNATURES');

    await AsyncStorage.setItem(TableKeys.SIGNATURES, JSON.stringify(data) );

    //console.log(sign.sync);

  }


  //update photos details this.update_photos( i, sub_key, master_key, data );
  async update_photos(index, sub_key, master_key, data){


    let property_photos = data[this.property_id];
    let master_item_photos =  property_photos[master_key];
    let sub_item_photos =  master_item_photos[sub_key];

    sub_item_photos[index].sync = 2;

    //console.log('updated storage PHOTOS');

    //console.log(sub_item_photos[index]);

    //console.log(data);

    await AsyncStorage.setItem(TableKeys.PHOTOS, JSON.stringify(data) );

  }

  syncPropertyInfo(){

    AsyncStorage.getItem(TableKeys.PROPERTY_INFO, (err, result) => {
      //console.log('get property details');
      let properties = JSON.parse(result) || [];

      for(let i =0, l = properties.length; i < l ; i++){
        if(properties[i].property_id == this.property_id && properties[i].sync == 1){
          //console.log('found property info without sync');

          break;
        }
      }


    });

  }



  // this will wait for response from server
  async postData(formData, endpoint = 'syncmob' ){

    try{
        let response = await fetch(
            config.ENDPOINT_URL + 'property/'+ endpoint,
            {
            method: 'POST',
            headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'multipart/form-data',
                      'Origin': '',
                      'Host': 'propertyground.co.uk',
                      'timeout': 10 * 60,
                      'Authorization': auth.AUTHTOKEN
            },
            body: formData
        });

          let responseJson = await response.json();
          //console.log(endpoint);
           console.log('responseJson');
           console.log(responseJson);
           console.log('--------------------');


          if(!responseJson){
            return {};
          }


          if(responseJson.status == 400){
            //console.log("i get response status 400");
            responseJson.status = 1
          }


          return responseJson;
    }
    catch(err){
      console.log('responseJson ERROR!');
      console.log(err);
    }


  }


}
