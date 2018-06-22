import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class SyncStore extends EventEmitter {
  constructor() {
    super();
    this.property_id = '';
  }

  getSyncedProperty(){
    return this.property_id;
  }

  handleActions(action) {

    switch(action.type) {

      case "FINISHED_SYNC": {
        this.property_id = action.property_id;
        this.emit("change");
        break;
      }


    }
  }


}

const syncStore = new SyncStore;
dispatcher.register(syncStore.handleActions.bind(syncStore));

export default syncStore;
