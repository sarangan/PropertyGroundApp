import dispatcher from "../dispatcher";

export function syncFinished(property_id) {

      dispatcher.dispatch({
        type: "FINISHED_SYNC",
        property_id
      });


}
