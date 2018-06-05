import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class SyncStore extends EventEmitter {
  constructor() {
    super();
    this.property_id = '';
    // this.totalData = {};
    // this.updatedData = {};
  }

  getSyncedProperty(){
    return this.property_id;
  }

  // getTotalData(){
  //   return this.totalData;
  // }
  //
  // getUpdatedData(){
  //   return this.updatedData;
  // }


  handleActions(action) {

    switch(action.type) {

      case "FINISHED_SYNC": {
        this.property_id = action.property_id;
        this.emit("change");
        break;
      }

      // case "GET_TOTAL":{
      //   this.totalData = {
      //     property_id: action.data.property_id,
      //     total: action.data.total
      //   };
      //   this.emit("change");
      //   break;
      // }
      //
      // case "GET_UPDATED_TOTAL": {
      //
      //   console.log("store value");
      //   console.log(action.data.updated_count);
      //   console.log(action.data.property_id);
      //
      //   this.updatedData =  {
      //     property_id: action.data.property_id,
      //     updated_count: action.data.updated_count
      //   };
      //
      //   this.emit("change");
      //   break;
      //
      // }


    }
  }


}

const syncStore = new SyncStore;
dispatcher.register(syncStore.handleActions.bind(syncStore));

export default syncStore;
