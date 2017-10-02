'use strict';

let helper = {

  generateUid: function() {
      const uuidv4 = require('uuid/v4');
      return uuidv4();
  },
  // synSrv: function(){
  //  " sync (id integer primary key, syn_id text, property_id text, table_name text, key_id text, task text, pk_name text, status integer )"); //task INSERT, UPDATE, DELET
  // }


}

module.exports = helper;
