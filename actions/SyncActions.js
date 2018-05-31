import dispatcher from "../dispatcher";

export function syncFinished(property_id) {

      dispatcher.dispatch({
        type: "FINISHED_SYNC",
        property_id
      });


}

// export function totalDataCount(property_id, total){
//
//   // console.log('i am here man total count');
//   // console.log(total);
//
//     dispatcher.dispatch({
//         type: "GET_TOTAL",
//         data: {
//           property_id,
//           total
//         }
//     });
//
// }


// export function updatedDataCount(property_id, updated_count){
//
//   // console.log('i am here man updated count');
//   // console.log(updated_count);
//
//     dispatcher.dispatch({
//         type: "GET_UPDATED_TOTAL",
//         data: {
//           property_id,
//           updated_count
//         }
//     });
//
// }
